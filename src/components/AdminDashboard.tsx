import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, getDocs, where, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';
import { Users, Search, Plus, ExternalLink, ChevronRight, LayoutDashboard, Dumbbell, ClipboardList, TrendingUp, X, Loader2, Trash2, Edit3, Save, Activity, Settings, Image as ImageIcon, MapPin, Video, MessageSquare } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { UserProfile, Workout, Exercise } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'students' | 'site'>('students');
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [newWorkout, setNewWorkout] = useState({ title: '', description: '' });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [editProfileData, setEditProfileData] = useState({ displayName: '', weight: 0, height: 0 });
  const [newGoal, setNewGoal] = useState('');
  const [studentDetailTab, setStudentDetailTab] = useState<'workouts' | 'progress' | 'profile'>('workouts');

  // Fetch all students (role == 'student')
  const [studentsValue, studentsLoading] = useCollection(
    query(collection(db, 'users'), where('role', '==', 'student'))
  );

  // Fetch stats (total workouts and progress logs)
  const [workoutsCountValue] = useCollection(collection(db, 'workouts'));
  const [progressCountValue] = useCollection(collection(db, 'progress'));

  const students = studentsValue?.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)) || [];
  const filteredStudents = students.filter(s => 
    s.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalStudents: students.length,
    activeWorkouts: workoutsCountValue?.size || 0,
    progressLogs: progressCountValue?.size || 0,
    newThisMonth: students.filter(s => {
      if (!s.createdAt) return false;
      const date = s.createdAt.seconds ? new Date(s.createdAt.seconds * 1000) : new Date();
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return date > monthAgo;
    }).length
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStudent) return;

    if (file.size > 1024 * 1024) {
      alert('A imagem deve ser menor que 1MB para armazenamento otimizado.');
      return;
    }

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        await updateDoc(doc(db, 'users', selectedStudent.uid), {
          photoURL: base64String
        });
        setSelectedStudent({ ...selectedStudent, photoURL: base64String });
        setIsUploadingPhoto(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'users');
        setIsUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateGoal = async () => {
    if (!selectedStudent || !newGoal) return;
    try {
      await updateDoc(doc(db, 'users', selectedStudent.uid), {
        goal: newGoal
      });
      setSelectedStudent({ ...selectedStudent, goal: newGoal });
      setIsEditingGoal(false);
      alert('Objetivo atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar objetivo. Verifique as permissões.');
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      const dataToUpdate = {
        displayName: editProfileData.displayName,
        weight: Number(editProfileData.weight),
        height: Number(editProfileData.height),
        updatedAt: serverTimestamp()
      };
      await updateDoc(doc(db, 'users', selectedStudent.uid), dataToUpdate);
      setSelectedStudent({ ...selectedStudent, ...dataToUpdate });
      setIsEditingProfile(false);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar perfil. Verifique as permissões.');
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  const handleAddWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !newWorkout.title) return;

    try {
      await addDoc(collection(db, 'workouts'), {
        studentId: selectedStudent.uid,
        title: newWorkout.title,
        description: newWorkout.description,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setIsAddingWorkout(false);
      setNewWorkout({ title: '', description: '' });
      alert('Cronograma liberado com sucesso!');
    } catch (error) {
      alert('Erro ao criar cronograma. Verifique as permissões.');
      handleFirestoreError(error, OperationType.CREATE, 'workouts');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
              PAINEL DO <span className="text-red-600">PERSONAL</span>
            </h2>
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('students')}
                className={`text-[11px] uppercase font-black tracking-widest px-4 py-2 rounded-lg transition-all ${activeTab === 'students' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-white/5 text-gray-500 hover:text-white'}`}
              >
                Gestão de Alunos
              </button>
              <button 
                onClick={() => setActiveTab('site')}
                className={`text-[11px] uppercase font-black tracking-widest px-4 py-2 rounded-lg transition-all ${activeTab === 'site' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-white/5 text-gray-500 hover:text-white'}`}
              >
                Conteúdo Institucional
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600" />
              <input 
                type="text" 
                placeholder="Pesquisar aluno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 bg-brand-dark border border-white/5 rounded-2xl text-white font-medium focus:outline-none focus:border-red-600/50 transition-all w-full md:w-72 shadow-2xl placeholder:text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        {activeTab === 'students' && (
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-12">
            {[
              { label: 'Total Alunos', value: stats.totalStudents, icon: Users, color: 'text-white' },
              { label: 'Novos (30d)', value: stats.newThisMonth, icon: Plus, color: 'text-green-500' },
              { label: 'Planilhas', value: stats.activeWorkouts, icon: ClipboardList, color: 'text-red-600' },
              { label: 'Check-ins', value: stats.progressLogs, icon: TrendingUp, color: 'text-blue-500' },
            ].map((stat, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={stat.label} 
                className="bg-brand-dark border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl group hover:border-red-600/20 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-xl bg-white/5 ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-white italic tracking-tighter leading-none mb-1">{stat.value}</p>
                <p className="text-[9px] uppercase font-black tracking-[0.1em] text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}
      </header>

      {activeTab === 'students' ? (
        <div className="grid lg:grid-cols-12 gap-10">
        {/* Student Sidebar List */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white italic">Seu Time ({filteredStudents.length})</h3>
          </div>

          <div className="space-y-4 max-h-[50vh] lg:max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            {studentsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-red-600" />
              </div>
            ) : filteredStudents.map((student, i) => (
              <motion.button
                key={student.uid}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  setSelectedStudent(student);
                  setStudentDetailTab('workouts');
                }}
                whileHover={{ x: 5 }}
                className={`w-full p-6 rounded-3xl flex items-center gap-5 transition-all border ${
                  selectedStudent?.uid === student.uid 
                    ? 'bg-red-600 border-white/20 shadow-[0_20px_40px_rgba(220,38,38,0.2)] scale-[1.02] z-10' 
                    : 'bg-brand-dark border-white/5 hover:border-red-600/30'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-black flex items-center justify-center font-black text-lg text-white uppercase overflow-hidden border border-white/10 shrink-0 shadow-xl group-hover:scale-105 transition-transform">
                  {student.photoURL ? <img src={student.photoURL} alt={student.displayName} className="w-full h-full object-cover" /> : student.displayName?.charAt(0)}
                </div>
                <div className="text-left overflow-hidden flex-1">
                  <p className={`font-black uppercase italic tracking-tighter text-xl truncate leading-none mb-2 ${selectedStudent?.uid === student.uid ? 'text-white' : 'text-gray-200'}`}>
                    {student.displayName}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className={`text-[8px] uppercase font-black px-2 py-0.5 rounded ${selectedStudent?.uid === student.uid ? 'bg-white/20 text-white' : 'bg-red-600/10 text-red-500'}`}>
                      {student.goal || 'Performance'}
                    </span>
                    <span className={`text-[9px] font-bold ${selectedStudent?.uid === student.uid ? 'text-white/60' : 'text-gray-600'}`}>
                      {student.weight ? `${student.weight}kg` : '--'}
                    </span>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 ml-auto transition-transform ${selectedStudent?.uid === student.uid ? 'translate-x-1 text-white' : 'text-gray-800'}`} />
              </motion.button>
            ))}
            {filteredStudents.length === 0 && !studentsLoading && (
              <div className="text-center py-20 bg-brand-dark/30 rounded-3xl border border-dashed border-white/5">
                <Search className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                <p className="text-gray-600 font-black uppercase text-[10px]">Nenhum aluno encontrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Student Detail View */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selectedStudent ? (
              <motion.div
                key={selectedStudent.uid}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="card-premium p-4 md:p-10 min-h-auto md:min-h-[750px] flex flex-col relative overflow-hidden"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] select-none pointer-events-none">
                  <Users className="w-96 h-96 rotate-12" />
                </div>

                <header className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
                  <div className="flex items-center gap-8">
                    <div className="relative">
                      <div className="w-28 h-28 rounded-3xl bg-brand-black border-2 border-white/10 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">
                        <div className="w-full h-full rounded-2xl bg-brand-dark flex items-center justify-center text-5xl font-black text-white uppercase overflow-hidden">
                          {isUploadingPhoto ? (
                            <Loader2 className="w-10 h-10 animate-spin text-red-600" />
                          ) : selectedStudent.photoURL ? (
                            <img src={selectedStudent.photoURL} alt={selectedStudent.displayName} className="w-full h-full object-cover" />
                          ) : (
                            selectedStudent.displayName?.charAt(0)
                          )}
                        </div>
                      </div>
                      <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center cursor-pointer shadow-xl border-4 border-brand-card hover:bg-red-700 transition-all">
                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
                        <ImageIcon className="w-4 h-4 text-white" />
                      </label>
                    </div>

                    <div>
                      {isEditingProfile ? (
                        <div className="space-y-4">
                          <input 
                            type="text"
                            value={editProfileData.displayName}
                            onChange={(e) => setEditProfileData({...editProfileData, displayName: e.target.value})}
                            className="bg-black border border-white/10 rounded-xl px-4 py-2 text-2xl text-white uppercase font-black italic tracking-tighter w-full focus:border-red-600 outline-none"
                            placeholder="Nome Completo"
                          />
                          <div className="flex gap-2">
                            <button onClick={handleUpdateProfile} className="bg-red-600 text-white px-6 py-2 rounded-lg text-[10px] font-black uppercase italic shadow-xl">Confirmar</button>
                            <button onClick={() => setIsEditingProfile(false)} className="bg-white/5 text-gray-500 px-6 py-2 rounded-lg text-[10px] font-black uppercase italic">Voltar</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-4 mb-2">
                             <h3 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">{selectedStudent.displayName || 'Atleta'}</h3>
                             <button 
                               onClick={() => {
                                 setEditProfileData({ displayName: selectedStudent.displayName, weight: selectedStudent.weight || 0, height: selectedStudent.height || 0 });
                                 setIsEditingProfile(true);
                               }}
                               className="p-2 bg-white/5 rounded-lg text-gray-600 hover:text-white transition-all shadow-lg"
                             >
                               <Edit3 className="w-4 h-4" />
                             </button>
                          </div>
                          <p className="text-gray-500 font-bold text-sm tracking-widest bg-white/5 px-3 py-1 rounded inline-block">{selectedStudent.email}</p>
                          
                          <div className="flex gap-4 mt-6">
                            <div className="bg-red-600/5 border border-red-600/10 px-4 py-3 rounded-2xl group cursor-pointer" onClick={() => { setNewGoal(selectedStudent.goal || ''); setIsEditingGoal(true); }}>
                              <p className="text-[9px] text-red-600 font-black uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <Activity className="w-3 h-3" /> Foco Atual
                              </p>
                              {isEditingGoal ? (
                                <div className="flex items-center gap-2">
                                  <input 
                                    className="bg-black border border-white/10 rounded px-2 py-0.5 text-xs text-white font-black"
                                    value={newGoal}
                                    onChange={e => setNewGoal(e.target.value)}
                                    autoFocus
                                    onBlur={handleUpdateGoal}
                                  />
                                </div>
                              ) : (
                                <p className="text-sm font-black text-white uppercase italic tracking-tighter">{selectedStudent.goal || 'HIPERTROFIA'}</p>
                              )}
                            </div>
                            <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
                              <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <TrendingUp className="w-3 h-3" /> Peso Atual
                              </p>
                              <p className="text-sm font-black text-white uppercase italic tracking-tighter">{selectedStudent.weight || '--'} <span className="text-[9px] opacity-40">KG</span></p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsAddingWorkout(true)}
                      className="bg-white text-black px-6 py-4 rounded-2xl font-black uppercase italic text-xs tracking-tighter flex items-center gap-3 hover:bg-red-600 hover:text-white transition-all shadow-2xl group"
                    >
                      <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                      Novo Plano
                    </button>
                  </div>
                </header>

                {/* Local Nav */}
                <div className="flex gap-8 border-b border-white/5 mb-10 relative z-10">
                  {[
                    { id: 'workouts', label: 'Planilhas', icon: ClipboardList },
                    { id: 'progress', label: 'Evolução', icon: TrendingUp },
                    { id: 'profile', label: 'Dados de Saúde', icon: Settings },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setStudentDetailTab(tab.id as any)}
                      className={`pb-4 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border-b-2 ${
                        studentDetailTab === tab.id 
                          ? 'border-red-600 text-white' 
                          : 'border-transparent text-gray-600 hover:text-gray-300'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 relative z-10">
                  <AnimatePresence mode="wait">
                    {studentDetailTab === 'workouts' && (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-6"
                      >
                         <div className="grid md:grid-cols-2 gap-6">
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /> Disponíveis Agora
                              </h4>
                              <StudentWorkouts 
                                studentId={selectedStudent.uid} 
                                onEdit={(workout) => setEditingWorkout(workout)}
                              />
                           </div>
                           <div className="bg-brand-black/40 border border-white/5 p-8 rounded-[2rem] flex flex-col items-center justify-center text-center">
                              <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-gray-700 mb-6 border border-white/10">
                                <Dumbbell className="w-8 h-8" />
                              </div>
                              <h5 className="text-white font-black uppercase italic text-lg mb-2">Cronograma WIP</h5>
                              <p className="text-gray-600 text-xs font-medium max-w-[200px]">Crie planos de treino focados nos resultados do {(selectedStudent.displayName || 'Atleta').split(' ')[0]}.</p>
                              <button 
                                onClick={() => setIsAddingWorkout(true)}
                                className="mt-8 text-[11px] font-black uppercase italic text-red-600 hover:text-white transition-all transform hover:scale-105"
                              >
                                Clique para liberar →
                              </button>
                           </div>
                         </div>
                      </motion.div>
                    )}

                    {studentDetailTab === 'progress' && (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-10"
                      >
                        <div className="card-premium p-8 bg-brand-black/30 border border-white/5">
                          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-600 mb-8 italic">Curva de Performance</h4>
                          <div className="h-[300px]">
                            <AdminProgressChart studentId={selectedStudent.uid} />
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-8">
                           <div className="space-y-4">
                             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Últimos Registros</h4>
                              <StudentActivity studentId={selectedStudent.uid} />
                           </div>
                        </div>
                      </motion.div>
                    )}

                    {studentDetailTab === 'profile' && (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="grid md:grid-cols-2 gap-8"
                      >
                        <div className="space-y-8">
                          <div className="bg-brand-dark/50 border border-white/5 p-8 rounded-3xl space-y-6">
                            <h4 className="text-white font-black uppercase italic text-xl tracking-tighter">Biometria</h4>
                            <div className="grid grid-cols-2 gap-6">
                               <div className="bg-brand-black border border-white/5 p-4 rounded-2xl">
                                 <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Altura</p>
                                 <p className="text-2xl font-black text-white italic">{selectedStudent.height || '--'} <span className="text-xs opacity-40">M</span></p>
                               </div>
                               <div className="bg-brand-black border border-white/5 p-4 rounded-2xl">
                                 <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Peso Meta</p>
                                 <p className="text-2xl font-black text-white italic">-- <span className="text-xs opacity-40">KG</span></p>
                               </div>
                            </div>
                            <button 
                              onClick={() => {
                                setEditProfileData({ displayName: selectedStudent.displayName, weight: selectedStudent.weight || 0, height: selectedStudent.height || 0 });
                                setIsEditingProfile(true);
                              }}
                              className="w-full py-4 border border-white/10 rounded-2xl text-[10px] uppercase font-black text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                            >
                              Editar Parâmetros
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <div className="h-[50vh] md:h-[750px] flex flex-col items-center justify-center text-center p-6 md:p-12 bg-brand-dark/30 rounded-[3rem] border-2 border-white/5 border-dashed relative overflow-hidden group">
                <div className="absolute inset-0 bg-grid opacity-[0.03]" />
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-gray-800 mx-auto mb-10 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                    <LayoutDashboard className="w-10 h-10" />
                  </div>
                  <h3 className="text-4xl font-black text-gray-800 uppercase italic mb-4 tracking-tighter">Selecione um Atleta</h3>
                  <p className="text-gray-600 max-w-sm font-bold uppercase tracking-widest text-[9px] mx-auto leading-loose">
                    Gerencie o cronograma, analise o desempenho biométrico e envie novos comandos de treinamento.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      ) : (
        <SiteContentManager />
      )}

      {/* New Workout Modal */}
      {isAddingWorkout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg bg-brand-card border border-white/10 rounded-[3rem] p-10 overflow-hidden relative shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
          >
            <button onClick={() => setIsAddingWorkout(false)} className="absolute top-8 right-8 text-gray-600 hover:text-white transition-colors">
              <X className="w-8 h-8" />
            </button>
            <div className="mb-10">
               <span className="text-red-600 font-black uppercase tracking-[0.3em] text-[11px] italic mb-2 block">Protocolo de Treino</span>
               <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Novo Ciclo</h3>
            </div>
            <form onSubmit={handleAddWorkout} className="space-y-8">
              <div>
                <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Nome do Cronograma</label>
                <input 
                  type="text" 
                  value={newWorkout.title}
                  onChange={(e) => setNewWorkout({...newWorkout, title: e.target.value})}
                  placeholder="Ex: Ciclo A - Evolução Muscular"
                  className="w-full bg-brand-black border border-white/5 rounded-2xl px-6 py-5 text-white font-black italic text-xl focus:outline-none focus:border-red-600 transition-all placeholder:text-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Notas e Observações</label>
                <textarea 
                  value={newWorkout.description}
                  onChange={(e) => setNewWorkout({...newWorkout, description: e.target.value})}
                  placeholder="Instruções específicas para o período..."
                  rows={4}
                  className="w-full bg-brand-black border border-white/5 rounded-2xl px-6 py-5 text-white font-medium focus:outline-none focus:border-red-600 transition-all resize-none text-sm placeholder:text-gray-800"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-6 bg-red-600 text-white font-black uppercase tracking-[0.1em] rounded-2xl shadow-3xl hover:bg-red-700 transition-all italic text-sm shadow-[0_20px_40px_rgba(220,38,38,0.3)] active:scale-95"
              >
                Liberar para o Aluno
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Exercise Manager Modal */}
      {editingWorkout && (
        <ExerciseManager 
          workout={editingWorkout} 
          onClose={() => setEditingWorkout(null)} 
        />
      )}
    </div>
  );
};

// Subcomponent: Chart for Admin

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


// Subcomponent for student activity feed
const StudentActivity = ({ studentId }: { studentId: string }) => {
  const [progressValue, loading] = useCollection(
    query(collection(db, 'progress'), where('studentId', '==', studentId), orderBy('date', 'desc'))
  );

  const activities = progressValue?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];

  if (loading) return <Loader2 className="animate-spin text-red-600 mx-auto" />;

  return (
    <div className="space-y-4">
      {activities.length > 0 ? activities.slice(0, 5).map((activity: any) => (
        <div key={activity.id} className="p-4 bg-brand-black/40 border border-white/5 rounded-xl flex items-center gap-4">
          <div className="w-8 h-8 bg-green-500/10 rounded flex items-center justify-center text-green-500">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-white font-bold text-xs">Registrou {activity.weight}kg</p>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{activity.date}</p>
          </div>
        </div>
      )) : (
        <div className="p-8 bg-brand-black/30 border border-dashed border-white/5 rounded-2xl text-center">
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Nenhuma atividade recente</p>
        </div>
      )}
    </div>
  );
};

// Subcomponent to list workouts for a student
const StudentWorkouts = ({ studentId, onEdit }: { studentId: string, onEdit: (workout: any) => void }) => {
  const [workoutsValue, loading] = useCollection(
    query(collection(db, 'workouts'), where('studentId', '==', studentId), orderBy('createdAt', 'desc'))
  );
  const workouts = workoutsValue?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];

  const handleDelete = async (workoutId: string) => {
    if (!confirm('Tem certeza que deseja excluir este treino?')) return;
    try {
      await deleteDoc(doc(db, 'workouts', workoutId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'workouts');
    }
  };

  if (loading) return <Loader2 className="animate-spin text-red-600" />;

  return (
    <div className="space-y-3">
      {workouts.length > 0 ? workouts.map((workout: any) => (
        <div key={workout.id} className="p-4 bg-black border border-white/5 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-colors">
          <div>
            <h5 className="text-white font-black text-sm uppercase italic tracking-tighter">{workout.title}</h5>
            <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Sincronizado</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onEdit(workout)}
              className="p-2 text-gray-700 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              title="Gerenciar Exercícios"
            >
              <Dumbbell className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleDelete(workout.id)}
              className="p-2 text-gray-700 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )) : (
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest italic text-center py-4">Nenhum plano ativo</p>
      )}
    </div>
  );
};

// New Component: Exercise Manager
const ExerciseManager = ({ workout, onClose }: { workout: any, onClose: () => void }) => {
  const [exercisesValue, loading] = useCollection(
    query(collection(db, 'exercises'), where('workoutId', '==', workout.id), orderBy('order', 'asc'))
  );
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingEx, setEditingEx] = useState<any>(null);
  const [isEditingWorkout, setIsEditingWorkout] = useState(false);
  const [workoutData, setWorkoutData] = useState({ title: workout.title, description: workout.description || '' });
  const [newExercise, setNewExercise] = useState({ 
    name: '', sets: 3, reps: '12', rest: '60s', weight: '', notes: '', videoUrl: '' 
  });

  const exercises = exercisesValue?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];

  const handleUpdateWorkout = async () => {
    try {
      await updateDoc(doc(db, 'workouts', workout.id), {
        title: workoutData.title,
        description: workoutData.description,
        updatedAt: serverTimestamp()
      });
      setIsEditingWorkout(false);
      alert('Plano atualizado!');
    } catch (error) {
      alert('Erro ao atualizar plano.');
      handleFirestoreError(error, OperationType.UPDATE, 'workouts');
    }
  };

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEx) {
        await updateDoc(doc(db, 'exercises', editingEx.id), {
          ...newExercise,
          updatedAt: serverTimestamp()
        });
        setEditingEx(null);
        alert('Exercício atualizado!');
      } else {
        await addDoc(collection(db, 'exercises'), {
          workoutId: workout.id,
          ...newExercise,
          order: exercises.length,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        alert('Exercício adicionado!');
      }
      setNewExercise({ name: '', sets: 3, reps: '12', rest: '60s', weight: '', notes: '', videoUrl: '' });
    } catch (error) {
      alert('Erro ao salvar exercício.');
      handleFirestoreError(error, editingEx ? OperationType.UPDATE : OperationType.CREATE, 'exercises');
    }
  };

  const startEditEx = (ex: any) => {
    setEditingEx(ex);
    setNewExercise({
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      rest: ex.rest,
      weight: ex.weight || '',
      notes: ex.notes || '',
      videoUrl: ex.videoUrl || ''
    });
  };

  const handleDeleteExercise = async (id: string) => {
    if (!confirm('Excluir exercício?')) return;
    try {
      await deleteDoc(doc(db, 'exercises', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'exercises');
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl bg-brand-dark border border-white/10 rounded-[2rem] overflow-hidden flex flex-col max-h-[90vh] shadow-3xl"
      >
        <div className="p-8 bg-brand-black border-b border-white/5 flex justify-between items-start">
          <div className="flex-1">
            <span className="text-red-600 font-black uppercase tracking-widest text-[10px] mb-1 block">Gerenciador de Atleta</span>
            {isEditingWorkout ? (
              <div className="flex flex-col gap-2 mt-2">
                <input 
                  value={workoutData.title}
                  onChange={e => setWorkoutData({...workoutData, title: e.target.value})}
                  className="bg-black border border-white/10 rounded px-4 py-2 text-2xl font-black text-white uppercase italic"
                />
                <textarea 
                   value={workoutData.description}
                   onChange={e => setWorkoutData({...workoutData, description: e.target.value})}
                   className="bg-black border border-white/10 rounded px-4 py-2 text-xs text-gray-400 font-bold"
                   rows={2}
                />
                <div className="flex gap-2">
                  <button onClick={handleUpdateWorkout} className="bg-green-600 text-white px-4 py-1 rounded text-[10px] font-black uppercase">Salvar Plano</button>
                  <button onClick={() => setIsEditingWorkout(false)} className="bg-white/5 text-gray-500 px-4 py-1 rounded text-[10px] font-black uppercase">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="group/w">
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{workout.title}</h3>
                  <button onClick={() => setIsEditingWorkout(true)} className="opacity-0 group-hover/w:opacity-100 transition-opacity text-gray-600 hover:text-white">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-500 text-xs font-bold mt-2">{workout.description || 'Nenhuma descrição adicionada.'}</p>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 rounded-full text-gray-500 hover:text-white transition-all ml-4">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-brand-black/20">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Exercise List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Sequência de Exercícios</h4>
                <div className="px-3 py-1 bg-white/5 rounded text-[10px] text-white font-bold">{exercises.length} Itens</div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-red-600" /></div>
              ) : exercises.length > 0 ? (
                exercises.map((ex: any, idx) => (
                  <div key={ex.id} className="p-6 bg-brand-card border border-white/5 rounded-2xl flex items-center justify-between group hover:border-red-600/20 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="text-2xl font-black italic text-gray-800 group-hover:text-red-900 transition-colors">{(idx + 1).toString().padStart(2, '0')}</div>
                      <div className="cursor-pointer" onClick={() => startEditEx(ex)}>
                        <h5 className="text-white font-black uppercase italic tracking-tighter text-lg flex items-center gap-2">
                          {ex.name}
                          {ex.videoUrl && <Video className="w-3 h-3 text-red-600" />}
                          {ex.notes && <MessageSquare className="w-3 h-3 text-gray-600" />}
                        </h5>
                        <div className="flex gap-4 mt-1">
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest"><span className="text-red-500">{ex.sets}</span> Séries</span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest"><span className="text-red-500">{ex.reps}</span> Reps</span>
                          {ex.weight && <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest"><span className="text-red-500">{ex.weight}</span>kg</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEditEx(ex)}
                        className="p-3 text-gray-700 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteExercise(ex.id)}
                        className="p-3 text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 border-2 border-dashed border-white/5 rounded-3xl text-center">
                  <Dumbbell className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Nenhum exercício adicionado</p>
                </div>
              )}
            </div>

            {/* Add/Edit Form */}
            <div className="lg:col-span-5">
              <div className="bg-brand-card border border-white/10 rounded-3xl p-8 sticky top-0">
                <h4 className="text-lg font-black text-white uppercase italic tracking-tighter mb-6">{editingEx ? 'Editar Exercício' : 'Novo Exercício'}</h4>
                <form onSubmit={handleAddExercise} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Nome</label>
                    <input 
                      className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-600 transition-all font-bold"
                      value={newExercise.name}
                      onChange={e => setNewExercise({...newExercise, name: e.target.value})}
                      placeholder="Puxada na Polia..."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Séries</label>
                      <input 
                        type="number"
                        className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-600 transition-all font-bold"
                        value={newExercise.sets}
                        onChange={e => setNewExercise({...newExercise, sets: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Reps</label>
                      <input 
                        className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-600 transition-all font-bold"
                        value={newExercise.reps}
                        onChange={e => setNewExercise({...newExercise, reps: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Carga (kg)</label>
                      <input 
                        className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-600 transition-all font-bold"
                        value={newExercise.weight}
                        onChange={e => setNewExercise({...newExercise, weight: e.target.value})}
                        placeholder="Opcional"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Descanso</label>
                      <input 
                        className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-600 transition-all font-bold"
                        value={newExercise.rest}
                        onChange={e => setNewExercise({...newExercise, rest: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Link do Vídeo (YouTube/Drive)</label>
                    <input 
                      className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-600 transition-all font-bold text-xs"
                      value={newExercise.videoUrl}
                      onChange={e => setNewExercise({...newExercise, videoUrl: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Observações / Dicas Técnicas</label>
                    <textarea 
                      className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-600 transition-all font-medium text-xs resize-none"
                      value={newExercise.notes}
                      onChange={e => setNewExercise({...newExercise, notes: e.target.value})}
                      placeholder="Ex: Cuidado com a postura das escápulas..."
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button type="submit" className="flex-1 py-4 bg-red-600 text-white font-black uppercase tracking-tighter italic rounded-xl shadow-2xl hover:bg-red-700 transition-all">
                      {editingEx ? 'Atualizar' : 'Adicionar'}
                    </button>
                    {editingEx && (
                      <button 
                        type="button"
                        onClick={() => { setEditingEx(null); setNewExercise({ name: '', sets: 3, reps: '12', rest: '60s', weight: '', notes: '' }); }}
                        className="px-6 py-4 bg-white/5 text-gray-500 font-black uppercase tracking-tighter italic rounded-xl hover:text-white transition-all"
                      >
                        X
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Component to manage home page content
const SiteContentManager = () => {
  const [activeSection, setActiveSection] = useState<'hero' | 'about' | 'plans' | 'results'>('hero');

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-3 space-y-2">
        {(['hero', 'about', 'plans', 'results'] as const).map(section => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`w-full text-left p-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeSection === section ? 'bg-red-600 text-white shadow-lg' : 'bg-brand-dark text-gray-500 hover:text-white border border-white/5'
            }`}
          >
            {section === 'hero' && 'Início / Hero'}
            {section === 'about' && 'Sobre'}
            {section === 'plans' && 'Planos / Preços'}
            {section === 'results' && 'Resultados'}
          </button>
        ))}
      </div>

      <div className="lg:col-span-9">
        <motion.div
           key={activeSection}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="card-premium p-8"
        >
          {activeSection === 'hero' && <HeroEditor />}
          {activeSection === 'about' && <AboutEditor />}
          {activeSection === 'plans' && <PlansEditor />}
          {activeSection === 'results' && <ResultsEditor />}
        </motion.div>
      </div>
    </div>
  );
};

const HeroEditor = () => {
  const [heroValue, loading] = useDocument(doc(db, 'settings', 'hero'));
  const [data, setData] = useState({ title: '', subtitle: '' });

  React.useEffect(() => {
    if (heroValue?.exists()) {
      setData(heroValue.data() as any);
    }
  }, [heroValue]);

  const handleSave = async () => {
    try {
      console.log('Attempting to update hero settings:', data);
      await setDoc(doc(db, 'settings', 'hero'), data);
      alert('Hero atualizado!');
    } catch (error) {
      console.error('Error updating hero settings:', error);
      alert('Erro ao atualizar hero. Verifique as permissões. Detalhes: ' + (error instanceof Error ? error.message : String(error)));
      handleFirestoreError(error, OperationType.UPDATE, 'settings/hero');
    }
  };

  if (loading) return <Loader2 className="animate-spin text-red-600" />;

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Editor da Hero</h3>
      <div>
        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Título Principal</label>
        <textarea 
          className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-4 text-white font-black uppercase italic tracking-tighter text-2xl"
          value={data.title}
          onChange={e => setData({...data, title: e.target.value})}
          rows={3}
        />
      </div>
      <div>
        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Subtítulo / Descrição</label>
        <input 
          className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-4 text-white font-medium"
          value={data.subtitle}
          onChange={e => setData({...data, subtitle: e.target.value})}
        />
      </div>
      <button onClick={handleSave} className="btn-primary flex items-center gap-2">
        <Save className="w-4 h-4" /> Salvar Alterações
      </button>
    </div>
  );
};

const AboutEditor = () => {
  const [aboutValue, loading] = useDocument(doc(db, 'settings', 'about'));
  const [data, setData] = useState({ missionTitle: '', missionText: '', stats: [] as any[] });

  React.useEffect(() => {
    if (aboutValue?.exists()) {
      setData(aboutValue.data() as any);
    }
  }, [aboutValue]);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'settings', 'about'), data);
      alert('Seção Sobre atualizada!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings');
    }
  };

  if (loading) return <Loader2 className="animate-spin text-red-600" />;

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Editor do Sobre</h3>
      <div>
        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Título da Missão</label>
        <input 
          className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-4 text-white font-black uppercase italic tracking-tighter"
          value={data.missionTitle}
          onChange={e => setData({...data, missionTitle: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Texto da Missão</label>
        <textarea 
          className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-4 text-white font-medium"
          value={data.missionText}
          onChange={e => setData({...data, missionText: e.target.value})}
          rows={4}
        />
      </div>
      <button onClick={handleSave} className="btn-primary flex items-center gap-2">
        <Save className="w-4 h-4" /> Salvar Alterações
      </button>
    </div>
  );
};

const PlansEditor = () => {
  const [plansValue, loading] = useCollection(collection(db, 'plans'));
  const plans = plansValue?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];

  const handleAddPlan = async () => {
    try {
      await addDoc(collection(db, 'plans'), {
        name: 'Novo Plano',
        price: 'R$ 0',
        period: '/mês',
        description: 'Descrição aqui...',
        features: ['Funcionalidade 1'],
        highlight: false,
        order: plans.length
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'plans');
    }
  };

  const handleUpdatePlan = async (id: string, updated: any) => {
    try {
      await updateDoc(doc(db, 'plans', id), updated);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'plans');
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Excluir plano?')) return;
    try {
      await deleteDoc(doc(db, 'plans', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'plans');
    }
  };

  if (loading) return <Loader2 className="animate-spin text-red-600" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Gestão de Planos</h3>
        <button onClick={handleAddPlan} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Plano
        </button>
      </div>

      <div className="grid gap-6">
        {plans.sort((a: any, b: any) => a.order - b.order).map((plan: any) => (
          <div key={plan.id} className="p-6 bg-brand-black/50 border border-white/5 rounded-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div className="grid grid-cols-2 gap-4 flex-1 mr-4">
                <input 
                  value={plan.name}
                  onChange={e => handleUpdatePlan(plan.id, { name: e.target.value })}
                  className="bg-brand-dark border border-white/5 rounded px-3 py-2 text-white font-black uppercase italic"
                  placeholder="Nome do Plano"
                />
                <input 
                  value={plan.price}
                  onChange={e => handleUpdatePlan(plan.id, { price: e.target.value })}
                  className="bg-brand-dark border border-white/5 rounded px-3 py-2 text-white font-black"
                  placeholder="Preço (Ex: R$ 197)"
                />
              </div>
              <button 
                onClick={() => handleDeletePlan(plan.id)}
                className="p-2 text-gray-700 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea 
               value={plan.description}
               onChange={e => handleUpdatePlan(plan.id, { description: e.target.value })}
               className="w-full bg-brand-dark border border-white/5 rounded px-3 py-2 text-xs text-gray-400"
               rows={2}
               placeholder="Descrição curta..."
            />
             <div className="flex items-center gap-4">
               <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 cursor-pointer">
                 <input 
                   type="checkbox" 
                   checked={plan.highlight}
                   onChange={e => handleUpdatePlan(plan.id, { highlight: e.target.checked })}
                   className="accent-red-600"
                 />
                 Destacar Plano (Recomendado)
               </label>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ResultsEditor = () => {
    const [resultsValue, loading] = useCollection(collection(db, 'results'));
    const results = resultsValue?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];
  
    const handleAddResult = async () => {
      try {
        await addDoc(collection(db, 'results'), {
          title: 'Nova Transformação',
          before: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80',
          after: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80',
          text: 'Relato do aluno aqui...',
          order: results.length
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'results');
      }
    };
  
    const handleUpdateResult = async (id: string, updated: any) => {
      try {
        await updateDoc(doc(db, 'results', id), updated);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'results');
      }
    };
  
    const handleDeleteResult = async (id: string) => {
      if (!confirm('Excluir resultado?')) return;
      try {
        await deleteDoc(doc(db, 'results', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'results');
      }
    };
  
    if (loading) return <Loader2 className="animate-spin text-red-600" />;
  
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Case de Sucesso</h3>
          <button onClick={handleAddResult} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo Case
          </button>
        </div>
  
        <div className="grid gap-8">
          {results.sort((a: any, b: any) => a.order - b.order).map((res: any) => (
            <div key={res.id} className="p-6 bg-brand-black/50 border border-white/5 rounded-2xl space-y-4 flex gap-6">
              <div className="flex flex-col gap-4 w-64 shrink-0">
                <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-gray-500">URL Antes</label>
                    <input 
                        value={res.before}
                        onChange={e => handleUpdateResult(res.id, { before: e.target.value })}
                        className="bg-brand-dark border border-white/5 rounded px-3 py-1 text-[8px] text-gray-400 w-full"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-gray-500">URL Depois</label>
                    <input 
                        value={res.after}
                        onChange={e => handleUpdateResult(res.id, { after: e.target.value })}
                        className="bg-brand-dark border border-white/5 rounded px-3 py-1 text-[8px] text-gray-400 w-full"
                    />
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <input 
                    value={res.title}
                    onChange={e => handleUpdateResult(res.id, { title: e.target.value })}
                    className="bg-brand-dark border border-white/5 rounded px-3 py-2 text-white font-black uppercase italic w-full mr-4"
                    placeholder="Nome do Aluno"
                  />
                  <button onClick={() => handleDeleteResult(res.id)} className="p-2 text-gray-700 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
                <textarea 
                    value={res.text}
                    onChange={e => handleUpdateResult(res.id, { text: e.target.value })}
                    className="w-full bg-brand-dark border border-white/5 rounded px-3 py-2 text-xs text-gray-400"
                    rows={3}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

export default AdminDashboard;
