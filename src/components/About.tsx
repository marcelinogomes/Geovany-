import React from 'react';
import { motion } from 'motion/react';
import { Award, Users, Calendar, Target, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc } from 'firebase/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';

const About = () => {
  const [aboutValue, loading] = useDocument(doc(db, 'settings', 'about'));
  const aboutData = aboutValue?.data();

  const stats = [
    { icon: <Users className="w-8 h-8" />, value: '+500', label: 'Alunos Transformados' },
    { icon: <Calendar className="w-8 h-8" />, value: '10+', label: 'Anos de Experiência' },
    { icon: <Award className="w-8 h-8" />, value: 'Top 5', label: 'Personal Trainer' },
    { icon: <Target className="w-8 h-8" />, value: '100%', label: 'Foco em Resultados' },
  ];

  if (loading) return null;

  return (
    <section id="about" className="py-24 bg-brand-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] bg-brand-card rounded-2xl overflow-hidden border border-white/5 relative group shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80" 
                alt="Weber Inácio"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-red-600 font-black text-4xl italic uppercase tracking-tighter">Weber Inácio</p>
                <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs mt-1">Especialista em Performance</p>
              </div>
            </div>
            {/* Background elements */}
            <div className="absolute -top-6 -left-6 w-32 h-32 border-l-2 border-t-2 border-red-600/30 pointer-events-none" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-red-600 font-bold uppercase tracking-[0.3em] text-sm mb-6 block">Sobre o Personal</span>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-[0.9] uppercase italic tracking-tighter">
              {aboutData?.missionTitle || 'MINHA MISSÃO É EVOLUIR SEU POTENCIAL.'}
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed font-medium">
              {aboutData?.missionText || 'Metodologia de elite focada no seu objetivo real. Sem atalhos, apenas trabalho duro e resultados comprovados.'}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {stats.slice(0, 2).map((stat, idx) => (
                <div key={idx} className="bg-brand-dark/50 border border-white/5 rounded-2xl p-8 flex flex-col justify-center">
                  <div className="text-4xl font-black italic text-red-600 tracking-tighter">{stat.value}</div>
                  <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-2">{stat.label}</div>
                </div>
              ))}
              <div className="col-span-2 bg-red-600/10 border border-red-600/20 rounded-2xl p-8 flex flex-col justify-center">
                <div className="text-4xl font-black italic text-white tracking-tighter uppercase">CONSULTORIA PREMIUM</div>
                <div className="text-[10px] text-red-400 uppercase font-black tracking-widest mt-2">Acompanhamento Individualizado</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
