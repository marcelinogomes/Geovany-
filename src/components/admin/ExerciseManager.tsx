import React, { useState } from 'react';
import { motion } from 'motion/react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, where, updateDoc, doc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Loader2, Dumbbell, Trash2, Edit3, Video, MessageSquare, X } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../../lib/utils';

const ExerciseManager = ({ workout, onClose }: { workout: any, onClose: () => void }) => {
  const [exercisesValue, loading] = useCollection(
    query(collection(db, 'exercises'), where('workoutId', '==', workout.id), orderBy('order', 'asc'))
  );
  
  const [editingEx, setEditingEx] = useState<any>(null);
  const [isEditingWorkout, setIsEditingWorkout] = useState(false);
  const [workoutData, setWorkoutData] = useState({ title: workout.title, description: workout.description || '' });
  const [newExercise, setNewExercise] = useState({ 
    name: '', sets: 3, reps: '12', rest: '60s', weight: '', notes: '', videoUrl: '' 
  });

  const exercises = exercisesValue?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];

  const handleUpdateWorkout = async () => {
    try {
      await updateDoc(doc(db, 'workouts', workout.id), {
        title: workoutData.title,
        description: workoutData.description,
        updatedAt: serverTimestamp()
      });
      setIsEditingWorkout(false);
      alert('Plano atualizado!');
    } catch (error) {
      alert('Erro ao atualizar plano.');
      handleFirestoreError(error, OperationType.UPDATE, 'workouts');
    }
  };

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEx) {
        await updateDoc(doc(db, 'exercises', editingEx.id), {
          ...newExercise,
          updatedAt: serverTimestamp()
        });
        setEditingEx(null);
        alert('Exercício atualizado!');
      } else {
        await addDoc(collection(db, 'exercises'), {
          workoutId: workout.id,
          ...newExercise,
          order: exercises.length,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        alert('Exercício adicionado!');
      }
      setNewExercise({ name: '', sets: 3, reps: '12', rest: '60s', weight: '', notes: '', videoUrl: '' });
    } catch (error) {
      alert('Erro ao salvar exercício.');
      handleFirestoreError(error, editingEx ? OperationType.UPDATE : OperationType.CREATE, 'exercises');
    }
  };

  const startEditEx = (ex: any) => {
    setEditingEx(ex);
    setNewExercise({
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      rest: ex.rest,
      weight: ex.weight || '',
      notes: ex.notes || '',
      videoUrl: ex.videoUrl || ''
    });
  };

  const handleDeleteExercise = async (id: string) => {
    if (!confirm('Excluir exercício?')) return;
    try {
      await deleteDoc(doc(db, 'exercises', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'exercises');
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl bg-brand-dark border border-white/10 rounded-[2rem] overflow-hidden flex flex-col max-h-[90vh] shadow-3xl"
      >
        <div className="p-8 bg-brand-black border-b border-white/5 flex justify-between items-start">
          <div className="flex-1">
            <span className="text-red-600 font-black uppercase tracking-widest text-[10px] mb-1 block">Gerenciador de Atleta</span>
            {isEditingWorkout ? (
              <div className="flex flex-col gap-2 mt-2">
                <input 
                  value={workoutData.title}
                  onChange={e => setWorkoutData({...workoutData, title: e.target.value})}
                  className="bg-black border border-white/10 rounded px-4 py-2 text-2xl font-black text-white uppercase italic"
                />
                <textarea 
                   value={workoutData.description}
                   onChange={e => setWorkoutData({...workoutData, description: e.target.value})}
                   className="bg-black border border-white/10 rounded px-4 py-2 text-xs text-gray-400 font-bold"
                   rows={2}
                />
                <div className="flex gap-2">
                  <button onClick={handleUpdateWorkout} className="bg-green-600 text-white px-4 py-1 rounded text-[10px] font-black uppercase">Salvar Plano</button>
                  <button onClick={() => setIsEditingWorkout(false)} className="bg-white/5 text-gray-500 px-4 py-1 rounded text-[10px] font-black uppercase">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="group/w">
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{workout.title}</h3>
                  <button onClick={() => setIsEditingWorkout(true)} className="opacity-0 group-hover/w:opacity-100 transition-opacity text-gray-600 hover:text-white">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-500 text-xs font-bold mt-2">{workout.description || 'Nenhuma descrição adicionada.'}</p>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 rounded-full text-gray-500 hover:text-white transition-all ml-4">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-brand-black/20">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Exercise List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Sequência de Exercícios</h4>
                <div className="px-3 py-1 bg-white/5 rounded text-[10px] text-white font-bold">{exercises.length} Itens</div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-red-600" /></div>
              ) : exercises.length > 0 ? (
                exercises.map((ex: any, idx) => (
                  <div key={ex.id} className="p-6 bg-brand-card border border-white/5 rounded-2xl flex items-center justify-between group hover:border-red-600/20 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="text-2xl font-black italic text-gray-800 group-hover:text-red-900 transition-colors">{(idx + 1).toString().padStart(2, '0')}</div>
                      <div className="cursor-pointer" onClick={() => startEditEx(ex)}>
                        <h5 className="text-white font-black uppercase italic tracking-tighter text-lg flex items-center gap-2">
                          {ex.name}
                          {ex.videoUrl && <Video className="w-3 h-3 text-red-600" />}
                          {ex.notes && <MessageSquare className="w-3 h-3 text-gray-600" />}
                        </h5>
                        <div className="flex gap-4 mt-1">
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest"><span className="text-red-500">{ex.sets}</span> Séries</span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest"><span className="text-red-500">{ex.reps}</span> Reps</span>
                          {ex.weight && <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest"><span className="text-red-500">{ex.weight}</span>kg</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEditEx(ex)}
                        className="p-3 text-gray-700 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteExercise(ex.id)}
                        className="p-3 text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 border-2 border-dashed border-white/5 rounded-3xl text-center">
                  <Dumbbell className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Nenhum exercício adicionado</p>
                </div>
              )}
            </div>

            {/* Add/Edit Form */}
            <div className="lg:col-span-5">
              <div className="bg-brand-card border border-white/10 rounded-3xl p-8 sticky top-0">
                <h4 className="text-lg font-black text-white uppercase italic tracking-tighter mb-6">{editingEx ? 'Editar Exercício' : 'Novo Exercício'}</h4>
                <form onSubmit={handleAddExercise} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Nome</label>
                    <input 
                      className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-600 transition-all font-bold"
                      value={newExercise.name}
                      onChange={e => setNewExercise({...newExercise, name: e.target.value})}
                      placeholder="Puxada na Polia..."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Séries</label>
                      <input 
                        type="number"
                        className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-600 transition-all font-bold"
                        value={newExercise.sets}
                        onChange={e => setNewExercise({...newExercise, sets: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Reps</label>
                      <input 
                        className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-600 transition-all font-bold"
                        value={newExercise.reps}
                        onChange={e => setNewExercise({...newExercise, reps: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Carga (kg)</label>
                      <input 
                        className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-600 transition-all font-bold"
                        value={newExercise.weight}
                        onChange={e => setNewExercise({...newExercise, weight: e.target.value})}
                        placeholder="Opcional"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Descanso</label>
                      <input 
                        className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-600 transition-all font-bold"
                        value={newExercise.rest}
                        onChange={e => setNewExercise({...newExercise, rest: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Link do Vídeo (YouTube/Drive)</label>
                    <input 
                      className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-600 transition-all font-bold text-xs"
                      value={newExercise.videoUrl}
                      onChange={e => setNewExercise({...newExercise, videoUrl: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Observações / Dicas Técnicas</label>
                    <textarea 
                      className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-600 transition-all font-medium text-xs resize-none"
                      value={newExercise.notes}
                      onChange={e => setNewExercise({...newExercise, notes: e.target.value})}
                      placeholder="Ex: Cuidado com a postura das escápulas..."
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button type="submit" className="flex-1 py-4 bg-red-600 text-white font-black uppercase tracking-tighter italic rounded-xl shadow-2xl hover:bg-red-700 transition-all">
                      {editingEx ? 'Atualizar' : 'Adicionar'}
                    </button>
                    {editingEx && (
                      <button 
                        type="button"
                        onClick={() => { setEditingEx(null); setNewExercise({ name: '', sets: 3, reps: '12', rest: '60s', weight: '', notes: '' }); }}
                        className="px-6 py-4 bg-white/5 text-gray-500 font-black uppercase tracking-tighter italic rounded-xl hover:text-white transition-all"
                      >
                        X
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExerciseManager;
