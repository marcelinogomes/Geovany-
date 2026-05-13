import React from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

const AdminProgressChart = ({ studentId }: { studentId: string }) => {
  const [progressValue, loading] = useCollection(
    query(collection(db, 'progress'), where('studentId', '==', studentId), orderBy('date', 'asc'))
  );

  const data = progressValue?.docs.map(doc => {
    const d = doc.data();
    const date = d.date?.seconds ? new Date(d.date.seconds * 1000) : new Date();
    return {
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      weight: Number(d.weight)
    };
  }) || [];

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-red-600" /></div>;
  if (data.length === 0) return <div className="h-full flex items-center justify-center text-gray-700 font-black uppercase text-[10px]">Aguardando dados biométricos do atleta.</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.03)" vertical={false} />
        <XAxis 
          dataKey="date" 
          stroke="rgba(255,255,255,0.2)" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false}
          dy={10}
        />
        <YAxis 
          stroke="rgba(255,255,255,0.2)" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false}
          domain={['auto', 'auto']}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px' }}
          itemStyle={{ color: '#dc2626', fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', fontSize: '10px' }}
          labelStyle={{ color: '#666', fontSize: '9px', fontWeight: 'bold', marginBottom: '4px' }}
        />
        <Line 
          type="monotone" 
          dataKey="weight" 
          stroke="#dc2626" 
          strokeWidth={4} 
          dot={{ r: 4, fill: '#050505', stroke: '#dc2626', strokeWidth: 2 }}
          activeDot={{ r: 8, fill: '#fff', stroke: '#dc2626', strokeWidth: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AdminProgressChart;
