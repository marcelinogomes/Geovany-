import React from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { TrendingUp, Loader2 } from 'lucide-react';

const StudentActivity = ({ studentId }: { studentId: string }) => {
  const [progressValue, loading] = useCollection(
    query(collection(db, 'progress'), where('studentId', '==', studentId), orderBy('date', 'desc'))
  );

  const activities = progressValue?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];

  if (loading) return <Loader2 className="animate-spin text-red-600 mx-auto" />;

  return (
    <div className="space-y-4">
      {activities.length > 0 ? activities.slice(0, 5).map((activity: any) => (
        <div key={activity.id} className="p-4 bg-brand-black/40 border border-white/5 rounded-xl flex items-center gap-4">
          <div className="w-8 h-8 bg-green-500/10 rounded flex items-center justify-center text-green-500">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-white font-bold text-xs">Registrou {activity.weight}kg</p>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
              {activity.date?.seconds 
                ? new Date(activity.date.seconds * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
                : activity.date?.toString() || 'Sem data'}
            </p>
          </div>
        </div>
      )) : (
        <div className="p-8 bg-brand-black/30 border border-dashed border-white/5 rounded-2xl text-center">
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Nenhuma atividade recente</p>
        </div>
      )}
    </div>
  );
};

export default StudentActivity;
