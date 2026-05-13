import React from 'react';
import { motion } from 'motion/react';
import { Send, MapPin, Phone, Instagram, Facebook, Youtube } from 'lucide-react';

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-brand-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase mb-8 tracking-tighter">
              ESTÁ <span className="text-glow-red">PRONTO</span>?
            </h2>
            <p className="text-gray-400 text-lg mb-12 font-medium leading-relaxed">
              Não deixe para depois a mudança que você pode começar agora. Entre em contato e vamos montar seu plano de ataque.
            </p>

            <div className="space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-brand-dark border border-white/5 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-all">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">WhatsApp</p>
                  <p className="text-white font-black text-2xl tracking-tighter">(00) 9 0000-0000</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-brand-dark border border-white/5 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-all">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Localização</p>
                  <p className="text-white font-black text-2xl tracking-tighter italic">Elite Performance Lab</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 bg-brand-dark border border-white/5 rounded-3xl shadow-2xl"
          >
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Nome Completo</label>
                  <input 
                    type="text" 
                    placeholder="Seu nome"
                    className="w-full bg-brand-black border border-white/5 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">WhatsApp</label>
                  <input 
                    type="tel" 
                    placeholder="(00) 0 0000-0000"
                    className="w-full bg-brand-black border border-white/5 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Qual seu objetivo?</label>
                <select className="w-full bg-brand-black border border-white/5 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-600 transition-colors appearance-none">
                  <option>Hipertrofia</option>
                  <option>Emagrecimento</option>
                  <option>Elite Performance</option>
                </select>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-5 bg-red-600 text-white font-black uppercase italic tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-2xl hover:bg-red-700 transition-all text-sm"
              >
                Enviar Mensagem
                <Send className="w-4 h-4" />
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
      
      {/* Background Glow */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
    </section>
  );
};

export default Contact;
