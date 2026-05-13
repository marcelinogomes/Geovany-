import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Play, ClipboardList, TrendingUp, Plus, Calendar as CalendarIcon, Loader2, X, Dumbbell, Info, Video, MessageSquare, ExternalLink } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/utils';

const StudentDashboard = () => {
  const { profile } = useAuth();
  const [newWeight, setNewWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Workouts
  const [workoutsValue, workoutsLoading] = useCollection(
    profile ? query(collection(db, 'workouts'), where('studentId', '==', profile.uid), orderBy('createdAt', 'desc')) : null
  );

  // Fetch Progress
  const [progressValue, progressLoading] = useCollection(
    profile ? query(collection(db, 'progress'), where('studentId', '==', profile.uid), orderBy('date', 'asc')) : null
  );

  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);

  const workouts = workoutsValue?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];
  const progressData = progressValue?.docs.map(doc => {
    const data = doc.data();
    const date = data.date?.seconds ? new Date(data.date.seconds * 1000) : new Date();
    return {
      date: date.toLocaleDateString(),
      weight: data.weight
    };
  }) || [];

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || !profile) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'progress'), {
        studentId: profile.uid,
        weight: parseFloat(newWeight),
        date: serverTimestamp(),
      });
      setNewWeight('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'progress');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-brand-dark border border-white/5 overflow-hidden shadow-2xl shrink-0">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-black text-gray-800 bg-brand-black uppercase">
                {profile?.displayName?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">
              ÁREA DO <span className="text-red-600">ALUNO</span>
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Bem-vindo de volta, {profile?.displayName?.split(' ')[0]}</p>
          </div>
        </div>
        <div className="bg-brand-dark border border-white/5 px-6 py-3 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 bg-red-600/10 rounded-lg flex items-center justify-center text-red-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Peso Atual</p>
            <p className="text-xl font-black text-white italic tracking-tighter leading-none">
              {progressData[progressData.length - 1]?.weight || '--'} <span className="text-xs">KG</span>
            </p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content: Workouts */}
        <div className="lg:col-span-2 space-y-8">
          <section className="card-premium p-8">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Cronograma de Treino</h3>
              </div>
            </div>

            {workoutsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-red-600 w-8 h-8" />
              </div>
            ) : workouts.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {workouts.map((workout: any) => (
                  <motion.div 
                    key={workout.id}
                    onClick={() => setSelectedWorkout(workout)}
                    whileHover={{ y: -5 }}
                    className="p-6 bg-brand-black border border-white/5 rounded-2xl group cursor-pointer hover:border-red-600/30 transition-all shadow-xl"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="px-3 py-1 bg-red-600/10 rounded font-black text-[8px] text-red-500 uppercase tracking-widest">
                        Treino do Mês
                      </div>
                      <Play className="w-4 h-4 text-gray-700 group-hover:text-red-600 transition-colors" />
                    </div>
                    <h4 className="text-white font-black text-xl italic uppercase tracking-tighter group-hover:text-red-500 transition-colors mb-1">{workout.title}</h4>
                    <p className="text-gray-500 text-xs font-medium line-clamp-2">{workout.description || 'Foco em execução perfeita.'}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-brand-black/50 border border-dashed border-white/5 rounded-2xl">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Aguardando liberação do seu personal.</p>
              </div>
            )}
          </section>

          {/* Progress Chart */}
          <section className="card-premium p-8">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white border border-white/10">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Sua Evolução</h3>
            </div>

            {progressLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-red-600 w-8 h-8" />
              </div>
            ) : progressData.length > 1 ? (
              <div className="h-[350px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(255,255,255,0.2)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      dy={15}
                      fontFamily="Outfit"
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.2)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      domain={['dataMin - 1', 'dataMax + 1']}
                      dx={-10}
                      fontFamily="Outfit"
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                      itemStyle={{ color: '#dc2626', fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#dc2626" 
                      strokeWidth={5} 
                      dot={{ r: 0 }}
                      activeDot={{ r: 6, fill: '#fff', stroke: '#dc2626', strokeWidth: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-16 bg-brand-black/50 border border-dashed border-white/5 rounded-2xl">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Registre seu peso para visualizar sua curva de evolução.</p>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <section className="card-premium p-8 bg-gradient-to-br from-brand-card to-brand-black">
            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-8 bg-white/5 -mx-8 -mt-8 p-6 border-b border-white/5">Nova Pesagem</h3>
            <form onSubmit={handleAddProgress} className="space-y-6">
              <div>
                <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 px-1">Peso Atual (kg)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="00.0"
                  className="w-full bg-brand-black border border-white/5 rounded-xl px-4 py-4 text-white font-black text-2xl focus:outline-none focus:border-red-600 transition-colors placeholder:text-gray-800"
                  required
                />
              </div>
              <button
                disabled={isSubmitting}
                className="w-full py-5 bg-white text-black font-black uppercase tracking-tighter rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 shadow-2xl"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Registrar
              </button>
            </form>
          </section>

          <div className="card-premium p-8 border-l-4 border-l-red-600">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Meta Atual</h3>
            <p className="text-white font-black text-2xl italic tracking-tighter uppercase leading-none">
              {profile?.goal || 'HIPERTROFIA'}
            </p>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {selectedWorkout && (
          <WorkoutDetails workout={selectedWorkout} onClose={() => setSelectedWorkout(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

const WorkoutDetails = ({ workout, onClose }: { workout: any, onClose: () => void }) => {
  const [exercisesValue, loading] = useCollection(
    query(collection(db, 'exercises'), where('workoutId', '==', workout.id), orderBy('order', 'asc'))
  );
  const exercises = exercisesValue?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-2xl bg-brand-dark border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col max-h-[85vh] shadow-3xl"
      >
        <div className="p-10 bg-brand-black border-b border-white/5 flex justify-between items-start">
          <div>
            <div className="flex gap-2 mb-2">
              <span className="px-3 py-1 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full">Official WIP</span>
            </div>
            <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{workout.title}</h3>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-4 max-w-sm">{workout.description || 'Siga rigorosamente as séries e o intervalo proposto.'}</p>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 rounded-full text-gray-500 hover:text-white transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-red-600 w-12 h-12" />
              <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest">Sincronizando Atividade...</p>
            </div>
          ) : exercises.length > 0 ? (
            exercises.map((ex: any, idx) => (
              <motion.div 
                key={ex.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-8 bg-brand-black border border-white/5 rounded-3xl group hover:border-red-600/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl font-black italic text-gray-700 group-hover:text-red-600 transition-colors">
                    {(idx + 1).toString().padStart(2, '0')}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <h4 className="text-white font-black uppercase italic tracking-tighter text-xl">{ex.name}</h4>
                       {ex.videoUrl && (
                         <a 
                           href={ex.videoUrl} 
                           target="_blank" 
                           rel="noreferrer"
                           className="p-1.5 bg-red-600/20 text-red-500 rounded hover:bg-red-600 hover:text-white transition-all shadow-lg"
                           title="Ver Vídeo de Execução"
                         >
                           <Video className="w-3.5 h-3.5" />
                         </a>
                       )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <div className="px-3 py-1 bg-white/5 rounded border border-white/5 text-[9px] text-gray-400 font-black uppercase tracking-widest">
                        <span className="text-red-500">{ex.sets}</span> Séries
                      </div>
                      <div className="px-3 py-1 bg-white/5 rounded border border-white/5 text-[9px] text-gray-400 font-black uppercase tracking-widest">
                        <span className="text-red-500">{ex.reps}</span> Reps
                      </div>
                      {ex.weight && (
                        <div className="px-3 py-1 bg-red-600/10 rounded border border-red-600/20 text-[9px] text-red-500 font-black uppercase tracking-widest">
                          {ex.weight} KG
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                  <div className="text-right">
                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Descanso</p>
                    <p className="text-white font-black text-lg italic tracking-tighter">{ex.rest || '60s'}</p>
                  </div>
                  <div className="w-px h-8 bg-white/5" />
                  {ex.notes && (
                    <div className="relative group/note">
                      <button className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-700 hover:text-white transition-all">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-full right-0 mb-4 w-64 p-4 bg-brand-card border border-white/10 rounded-2xl shadow-3xl opacity-0 translate-y-2 pointer-events-none group-hover/note:opacity-100 group-hover/note:translate-y-0 transition-all z-20">
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-2 italic">Dica do Personal:</p>
                        <p className="text-white text-xs font-medium leading-relaxed">{ex.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 px-8 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
              <Dumbbell className="w-16 h-16 text-gray-800 mx-auto mb-6" />
              <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Plano em Elaboração</h4>
              <p className="text-gray-500 font-medium text-xs max-w-xs mx-auto">Seu personal está definindo as cargas e repetições para este treino.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;
