import React from 'react';
import { motion } from 'motion/react';
import { Send, MapPin, Phone, Instagram } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc } from 'firebase/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';

const Contact = () => {
  const [contactValue] = useDocument(doc(db, 'settings', 'contact'));
  const contactData = contactValue?.data();

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name');
    const goal = formData.get('goal');
    
    const whatsappNumber = contactData?.whatsapp?.replace(/\D/g, '') || '5500000000000';
    const text = encodeURIComponent(`Olá! Sou ${name}. Meu objetivo é ${goal}. Gostaria de mais informações sobre a consultoria.`);
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

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
              <a 
                href={`https://wa.me/${contactData?.whatsapp?.replace(/\D/g, '') || '5500000000000'}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-6 group"
              >
                <div className="w-14 h-14 bg-brand-dark border border-white/5 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-all border-glow-red">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">WhatsApp</p>
                  <p className="text-white font-black text-2xl tracking-tighter">{contactData?.whatsapp || '(00) 0 0000-0000'}</p>
                </div>
              </a>

              {contactData?.instagram && (
                <a 
                  href={`https://instagram.com/${contactData.instagram}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-6 group"
                >
                  <div className="w-14 h-14 bg-brand-dark border border-white/5 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-all">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Instagram</p>
                    <p className="text-white font-black text-2xl tracking-tighter italic">@{contactData.instagram}</p>
                  </div>
                </a>
              )}

              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-brand-dark border border-white/5 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-all">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Localização</p>
                  <p className="text-white font-black text-2xl tracking-tighter italic">{contactData?.address || 'Elite Performance Lab'}</p>
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
            <form onSubmit={handleWhatsAppSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Nome Completo</label>
                  <input 
                    name="name"
                    required
                    type="text" 
                    placeholder="Seu nome"
                    className="w-full bg-brand-black border border-white/5 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Objetivo Principal</label>
                  <select name="goal" className="w-full bg-brand-black border border-white/5 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-600 transition-colors appearance-none font-bold">
                    <option>Hipertrofia</option>
                    <option>Emagrecimento</option>
                    <option>Performance Atleta</option>
                    <option>Correção Postural</option>
                  </select>
                </div>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-5 bg-red-600 text-white font-black uppercase italic tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-2xl hover:bg-red-700 transition-all text-sm"
              >
                Enviar via WhatsApp
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
