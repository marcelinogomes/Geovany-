import React from 'react';
import { useAuth } from '../lib/AuthContext';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { profile, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white p-4">
        <div className="text-center">
          <h2 className="text-2xl font-black uppercase italic mb-4">Acesso Restrito</h2>
          <p className="text-gray-400 mb-8">Faça login para acessar sua área exclusiva.</p>
          <a href="#home" className="px-8 py-3 bg-red-600 rounded-xl font-bold uppercase transition-all">
            Voltar ao Início
          </a>
        </div>
      </div>
    );
  }

  return (
    <div id="dashboard" className="min-h-screen bg-black pt-20">
      {isAdmin ? <AdminDashboard /> : <StudentDashboard />}
    </div>
  );
};

export default Dashboard;
