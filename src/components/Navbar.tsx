import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Dumbbell, Menu, X, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, isAdmin } = useAuth();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { name: 'Início', href: '#home' },
    { name: 'Sobre', href: '#about' },
    { name: 'Planos', href: '#plans' },
    { name: 'Resultados', href: '#results' },
    { name: 'Contato', href: '#contact' },
  ];

  return (
    <nav className="fixed w-full z-50 bg-brand-dark/95 backdrop-blur-sm border-b border-white/10 h-[70px] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-full">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-900 rounded-lg flex items-center justify-center font-black text-xl italic border border-white/20 shadow-lg">
              WI
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tighter text-white uppercase leading-none">
                WEBER INÁCIO <span className="text-red-600">PERSONAL</span>
              </span>
            </div>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4 md:space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all group-hover:w-full" />
                </a>
              ))}
              
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden shrink-0 bg-brand-dark">
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5 text-[10px] font-black text-white uppercase">
                        {profile?.displayName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <a 
                    href="#dashboard"
                    className="px-6 py-2 bg-white text-black text-xs font-black uppercase tracking-tighter hover:bg-red-600 hover:text-white transition-all shadow-xl"
                  >
                    {isAdmin ? 'Painel Admin' : 'Área do Aluno'}
                  </a>
                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="px-6 py-2 bg-white text-black text-xs font-black uppercase tracking-tighter hover:bg-red-600 hover:text-white transition-all shadow-xl"
                >
                  Entrar
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-zinc-900 border-b border-red-900/30"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-4 text-base font-medium text-gray-300 hover:text-red-500 hover:bg-zinc-800 transition-all uppercase tracking-widest"
              >
                {link.name}
              </a>
            ))}
            {user ? (
              <a
                href="#dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-4 text-base font-bold text-red-500 hover:bg-zinc-800 transition-all uppercase tracking-widest"
              >
                Dashboard
              </a>
            ) : (
              <button
                onClick={() => {
                  handleLogin();
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-4 text-base font-bold text-white bg-red-600 transition-all uppercase tracking-widest"
              >
                Login
              </button>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
