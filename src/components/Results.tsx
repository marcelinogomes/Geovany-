import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';

const Results = () => {
  const [resultsValue, loading] = useCollection(query(collection(db, 'results'), orderBy('order', 'asc')));
  const resultsData = resultsValue?.docs.map(doc => ({ id: doc.id, ...doc.data() as any })) || [];

  const defaultResults = [
    {
      student: "Cadu Silva",
      time: "4 meses",
      goal: "Hipertrofia",
      imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2ec617?auto=format&fit=crop&q=80",
    },
    {
      student: "Ana Paula",
      time: "6 meses",
      goal: "Definição",
      imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80",
    },
    {
      student: "Ricardo Lima",
      time: "3 meses",
      goal: "Perda de Peso",
      imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c64b52d2?auto=format&fit=crop&q=80",
    },
  ];

  const results = resultsData.length > 0 ? resultsData.map(r => ({
    student: r.title,
    time: r.text, // Using text for time/meta in this context
    goal: 'Evolução',
    imageUrl: r.after // Defaulting to after image
  })) : defaultResults;

  return (
    <section id="results" className="py-24 bg-brand-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter"
          >
            NOSSOS <span className="text-glow-red">RESULTADOS</span>
          </motion.h2>
          <p className="text-gray-500 mt-4 uppercase tracking-[0.3em] text-[10px] font-black">Transformação Real</p>
        </div>

        {loading ? (
           <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" /></div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {results.map((item: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-brand-dark border border-white/5 shadow-2xl"
              >
                <div className="aspect-[3/4] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
                  <img 
                    src={item.imageUrl} 
                    alt={item.student} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-brand-black via-brand-black/90 to-transparent">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{item.student}</h3>
                      <p className="text-red-600 text-[10px] font-black uppercase tracking-widest mt-1">{item.goal}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-xl font-black italic">{item.time}</p>
                      <p className="text-gray-600 text-[8px] uppercase font-black tracking-widest mt-0.5">Resultado</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        <div className="mt-16 text-center">
          <p className="text-gray-500 italic max-w-2xl mx-auto text-sm">
            *Resultados individuais podem variar. O comprometimento com o treino e a dieta são fundamentais para o sucesso.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Results;
