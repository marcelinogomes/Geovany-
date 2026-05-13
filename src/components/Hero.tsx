import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, MessageCircle, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc } from 'firebase/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';

const Hero = () => {
  const [heroValue, loading] = useDocument(doc(db, 'settings', 'hero'));
  const heroData = heroValue?.data();

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 grayscale"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80")' 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left lg:max-w-4xl"
        >
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-red-500 font-bold uppercase tracking-[0.3em] text-sm mb-4 block"
          >
            Alta Performance
          </motion.span>
          
          {loading ? (
            <Loader2 className="animate-spin text-red-600 mb-8" />
          ) : (
            <h1 
              className="text-6xl md:text-8xl font-black leading-[0.85] tracking-tighter uppercase mb-6 italic text-white"
              dangerouslySetInnerHTML={{ __html: heroData?.title?.replace(/\n/g, '<br/>') || 'Transforme <br/>seu corpo.<br/>Supere limites.' }}
            />
          )}

          <p className="max-w-md mx-auto lg:mx-0 text-gray-400 mb-10 leading-relaxed font-medium">
            {heroData?.subtitle || 'Especialista em hipertrofia e emagrecimento com metodologia exclusiva para resultados rápidos e duradouros.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
            <motion.a
              href="#plans"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
            >
              Começar Agora
            </motion.a>
            
            <motion.a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary"
            >
              WhatsApp
            </motion.a>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-10 hidden lg:block opacity-20">
        <div className="text-9xl font-black text-white/5 select-none tracking-tighter">WI</div>
      </div>
      
      <div className="absolute top-1/4 -right-20 hidden lg:block opacity-10 blur-3xl group">
        <div className="w-96 h-96 bg-red-600 rounded-full" />
      </div>

      <style>{`
        .text-stroke-white {
          -webkit-text-stroke: 1px white;
        }
      `}</style>
    </section>
  );
};

export default Hero;
