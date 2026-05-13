import React from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, where, deleteDoc, doc } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Loader2, Dumbbell, Trash2 } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../../lib/utils';

const StudentWorkouts = ({ studentId, onEdit }: { studentId: string, onEdit: (workout: any) => void }) => {
  const [workoutsValue, loading] = useCollection(
    query(collection(db, 'workouts'), where('studentId', '==', studentId), orderBy('createdAt', 'desc'))
  );
  const workouts = workoutsValue?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];

  const handleDelete = async (workoutId: string) => {
    if (!confirm('Tem certeza que deseja excluir este treino?')) return;
    try {
      await deleteDoc(doc(db, 'workouts', workoutId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'workouts');
    }
  };

  if (loading) return <Loader2 className="animate-spin text-red-600" />;

  return (
    <div className="space-y-3">
      {workouts.length > 0 ? workouts.map((workout: any) => (
        <div key={workout.id} className="p-4 bg-black border border-white/5 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-colors">
          <div>
            <h5 className="text-white font-black text-sm uppercase italic tracking-tighter">{workout.title}</h5>
            <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Sincronizado</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onEdit(workout)}
              className="p-2 text-gray-700 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              title="Gerenciar Exercícios"
            >
              <Dumbbell className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleDelete(workout.id)}
              className="p-2 text-gray-700 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )) : (
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest italic text-center py-4">Nenhum plano ativo</p>
      )}
    </div>
  );
};

export default StudentWorkouts;
