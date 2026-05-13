import React from 'react';
import { Dumbbell } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="h-24 bg-brand-black flex items-center justify-between px-8 border-t border-white/5">
      <div className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
        &copy; 2026 Weber Inácio Personal &mdash; Todos os direitos reservados.
      </div>
      <div className="flex gap-6 items-center">
        <div className="flex gap-4 text-gray-500 text-[10px] font-black uppercase tracking-widest">
          <a href="#" className="hover:text-red-600 transition-colors">Instagram</a>
          <a href="#" className="hover:text-red-600 transition-colors">YouTube</a>
          <a href="#" className="hover:text-red-600 transition-colors">Spotify</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
