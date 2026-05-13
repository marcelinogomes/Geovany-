import React from 'react';
import { motion } from 'motion/react';
import { Check, Star, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';

const Plans = () => {
  const [plansValue, loading] = useCollection(query(collection(db, 'plans'), orderBy('order', 'asc')));
  const plansData = plansValue?.docs.map(doc => ({ id: doc.id, ...doc.data() as any })) || [];

  const defaultPlans = [
    {
      name: 'Consultoria Online',
      price: 'R$ 197',
      period: '/mês',
      description: 'Ideal para quem treina sozinho e quer um planejamento profissional.',
      features: ['Treino Personalizado', 'Acompanhamento App', 'Suporte WhatsApp', 'Troca de Treino a cada 30 dias'],
      highlight: false,
    },
    {
      name: 'Plano Premium',
      price: 'R$ 397',
      period: '/mês',
      description: 'O acompanhamento mais completo para resultados acelerados.',
      features: ['Tudo do Online', 'Suporte Prioritário', 'Análise de Técnica por Vídeo', 'Orientação Nutritiva', 'Acompanhamento Semanal'],
      highlight: true,
    },
    {
      name: 'Presencial Elite',
      price: 'Consultar',
      period: '',
      description: 'Treinamento presencial exclusivo com atenção total a cada repetição.',
      features: ['100% Presencial', 'Vagas Limitadas', 'Equipamentos de Ponta', 'Avaliação Física Completa'],
      highlight: false,
    }
  ];

  const plans = plansData.length > 0 ? plansData : defaultPlans;

  return (
    <section id="plans" className="py-24 bg-brand-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter"
          >
            ESCOLHA SEU <span className="text-red-600">PLANO</span>
          </motion.h2>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto font-medium">
            Invista na sua saúde e performance com quem entende de verdade do assunto.
          </p>
        </div>

        {loading ? (
             <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" /></div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id || plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative p-8 rounded-3xl border flex flex-col justify-between overflow-hidden group transition-all ${
                  plan.highlight 
                    ? 'bg-gradient-to-br from-red-600 to-red-800 border-white/20 shadow-2xl scale-105 z-10' 
                    : 'bg-brand-dark border-white/5 hover:border-red-600/30'
                }`}
              >
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${plan.highlight ? 'text-white/60' : 'text-red-600'}`}>
                    {plan.highlight ? 'Recomendado' : 'Acesso Total'}
                  </span>
                  <h3 className="text-2xl font-black text-white uppercase italic mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className={`text-sm ${plan.highlight ? 'text-white/60' : 'text-gray-500'}`}>{plan.period}</span>
                  </div>
                  <p className={`text-sm mb-8 ${plan.highlight ? 'text-white/80' : 'text-gray-400'}`}>{plan.description}</p>
                  <div className="space-y-4 mb-8">
                    {plan.features?.map((feature: string, fIdx: number) => (
                      <div key={fIdx} className="flex items-center gap-3">
                        <div className={`p-1 rounded-full ${plan.highlight ? 'bg-white/20 text-white' : 'bg-red-600/10 text-red-600'}`}>
                          <Check className="w-3 h-3" />
                        </div>
                        <span className={`text-sm font-medium ${plan.highlight ? 'text-white/90' : 'text-gray-300'}`}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <motion.a
                  href={`https://wa.me/5500000000000?text=Olá! Tenho interesse no plano ${plan.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-tighter text-xs transition-all text-center ${
                    plan.highlight 
                      ? 'bg-white text-black hover:bg-zinc-100 shadow-xl' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  Garantir Vaga
                </motion.a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Plans;
