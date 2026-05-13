import React, { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, getDocs, where, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';
import { Users, Search, Plus, ExternalLink, ChevronRight, LayoutDashboard, Dumbbell, ClipboardList, TrendingUp, X, Loader2, Trash2, Edit3, Save, Activity, Settings, Image as ImageIcon, MapPin, Video, MessageSquare } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { UserProfile, Workout, Exercise } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminProgressChart = lazy(() => import('./admin/AdminProgressChart'));
const StudentActivity = lazy(() => import('./admin/StudentActivity'));
const StudentWorkouts = lazy(() => import('./admin/StudentWorkouts'));
const ExerciseManager = lazy(() => import('./admin/ExerciseManager'));
import SiteContentManager from './admin/SiteContentEditors';

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
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white italic">Seu Time ({filteredStudents.length})</h3>
            </div>
            <div className="space-y-4 max-h-[50vh] lg:max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {studentsLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-red-600" /></div>
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
                                <Suspense fallback={<Loader2 className="animate-spin text-red-600 mx-auto" />}>
                                  <StudentWorkouts 
                                    studentId={selectedStudent.uid} 
                                    onEdit={(workout) => setEditingWorkout(workout)}
                                  />
                                </Suspense>
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
                              <Suspense fallback={<Loader2 className="animate-spin text-red-600 mx-auto" />}>
                                <AdminProgressChart studentId={selectedStudent.uid} />
                              </Suspense>
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Últimos Registros</h4>
                               <Suspense fallback={<Loader2 className="animate-spin text-red-600 mx-auto" />}>
                                 <StudentActivity studentId={selectedStudent.uid} />
                               </Suspense>
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
        <Suspense fallback={<Loader2 className="animate-spin text-red-600 mx-auto" />}>
          <ExerciseManager 
            workout={editingWorkout} 
            onClose={() => setEditingWorkout(null)} 
          />
        </Suspense>
      )}
    </div>
  );
};

export default AdminDashboard;
