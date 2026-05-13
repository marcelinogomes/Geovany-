import React, { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, addDoc, updateDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';
import { Loader2, Plus, Trash2, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { handleFirestoreError, OperationType } from '../../lib/utils';

export const HeroEditor = () => {
    const [heroValue, loading] = useDocument(doc(db, 'settings', 'hero'));
    const [data, setData] = useState({ title: '', subtitle: '' });
  
    React.useEffect(() => {
      if (heroValue?.exists()) {
        setData(heroValue.data() as any);
      }
    }, [heroValue]);
  
    const handleSave = async () => {
      try {
        await setDoc(doc(db, 'settings', 'hero'), data);
        alert('Hero atualizado!');
      } catch (error) {
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

export const AboutEditor = () => {
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

export const PlansEditor = () => {
    const [plansValue, loading] = useCollection(collection(db, 'plans'));
    const [localPlans, setLocalPlans] = useState<any[]>([]);
  
    React.useEffect(() => {
      if (plansValue) {
        setLocalPlans(plansValue.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => a.order - b.order));
      }
    }, [plansValue]);
  
    const handleAddPlan = async () => {
      try {
        await addDoc(collection(db, 'plans'), {
          name: 'Novo Plano',
          price: 'R$ 0',
          period: '/mês',
          description: 'Descrição aqui...',
          features: ['Funcionalidade 1'],
          highlight: false,
          order: localPlans.length
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'plans');
      }
    };
  
    const handleSavePlan = async (id: string, plan: any) => {
      try {
        const { id: _, ...data } = plan;
        await updateDoc(doc(db, 'plans', id), data);
        alert('Plano atualizado!');
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
  
    if (loading && localPlans.length === 0) return <Loader2 className="animate-spin text-red-600" />;
  
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Gestão de Planos</h3>
          <button onClick={handleAddPlan} className="btn-primary flex items-center gap-2 text-xs">
            <Plus className="w-4 h-4" /> Novo Plano
          </button>
        </div>
  
        <div className="grid gap-6">
          {localPlans.map((plan: any, idx) => (
            <div key={plan.id} className="p-6 bg-brand-black/50 border border-white/5 rounded-2xl space-y-4">
              <div className="flex justify-between items-start">
                <div className="grid grid-cols-2 gap-4 flex-1 mr-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-gray-500">Nome</label>
                    <input 
                      value={plan.name}
                      onChange={e => {
                        const newPlans = [...localPlans];
                        newPlans[idx].name = e.target.value;
                        setLocalPlans(newPlans);
                      }}
                      className="bg-brand-dark border border-white/5 rounded px-3 py-2 text-white font-black uppercase italic w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-gray-500">Valor</label>
                    <input 
                      value={plan.price}
                      onChange={e => {
                        const newPlans = [...localPlans];
                        newPlans[idx].price = e.target.value;
                        setLocalPlans(newPlans);
                      }}
                      className="bg-brand-dark border border-white/5 rounded px-3 py-2 text-white font-black w-full"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => handleSavePlan(plan.id, plan)}
                    className="p-2 text-green-500 hover:bg-green-500/10 rounded transition-colors"
                    title="Salvar"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-2 text-gray-700 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-gray-500">Descrição</label>
                <textarea 
                   value={plan.description}
                   onChange={e => {
                      const newPlans = [...localPlans];
                      newPlans[idx].description = e.target.value;
                      setLocalPlans(newPlans);
                   }}
                   className="w-full bg-brand-dark border border-white/5 rounded px-3 py-2 text-xs text-gray-400"
                   rows={2}
                />
              </div>
               <div className="flex items-center gap-4">
                 <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 cursor-pointer">
                   <input 
                     type="checkbox" 
                     checked={plan.highlight}
                     onChange={e => {
                        const newPlans = [...localPlans];
                        newPlans[idx].highlight = e.target.checked;
                        setLocalPlans(newPlans);
                     }}
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

export const ResultsEditor = () => {
    const [resultsValue, loading] = useCollection(collection(db, 'results'));
    const [localResults, setLocalResults] = useState<any[]>([]);
  
    React.useEffect(() => {
      if (resultsValue) {
        setLocalResults(resultsValue.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => a.order - b.order));
      }
    }, [resultsValue]);
  
    const handleAddResult = async () => {
      try {
        await addDoc(collection(db, 'results'), {
          title: 'Nova Transformação',
          before: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80',
          after: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80',
          text: 'Relato do aluno aqui...',
          order: localResults.length
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'results');
      }
    };
  
    const handleSaveResult = async (id: string, result: any) => {
      try {
        const { id: _, ...data } = result;
        await updateDoc(doc(db, 'results', id), data);
        alert('Resultado atualizado!');
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
  
    if (loading && localResults.length === 0) return <Loader2 className="animate-spin text-red-600" />;
  
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Case de Sucesso</h3>
          <button onClick={handleAddResult} className="btn-primary flex items-center gap-2 text-xs">
            <Plus className="w-4 h-4" /> Novo Case
          </button>
        </div>
  
        <div className="grid gap-8">
          {localResults.map((res: any, idx) => (
            <div key={res.id} className="p-6 bg-brand-black/50 border border-white/5 rounded-2xl space-y-4 flex flex-col md:flex-row gap-6">
              <div className="flex flex-col gap-4 w-full md:w-64 shrink-0">
                <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-gray-500">URL Antes</label>
                    <input 
                        value={res.before}
                        onChange={e => {
                          const newResults = [...localResults];
                          newResults[idx].before = e.target.value;
                          setLocalResults(newResults);
                        }}
                        className="bg-brand-dark border border-white/5 rounded px-3 py-1 text-[8px] text-gray-400 w-full"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-gray-500">URL Depois</label>
                    <input 
                        value={res.after}
                        onChange={e => {
                          const newResults = [...localResults];
                          newResults[idx].after = e.target.value;
                          setLocalResults(newResults);
                        }}
                        className="bg-brand-dark border border-white/5 rounded px-3 py-1 text-[8px] text-gray-400 w-full"
                    />
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 mr-4">
                    <label className="text-[8px] font-black uppercase text-gray-500 mb-1 block">Nome do Aluno</label>
                    <input 
                      value={res.title}
                      onChange={e => {
                        const newResults = [...localResults];
                        newResults[idx].title = e.target.value;
                        setLocalResults(newResults);
                      }}
                      className="bg-brand-dark border border-white/5 rounded px-3 py-2 text-white font-black uppercase italic w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleSaveResult(res.id, res)}
                      className="p-2 text-green-500 hover:bg-green-500/10 rounded transition-colors"
                      title="Salvar"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteResult(res.id)} className="p-2 text-gray-700 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-gray-500">Relato / Depoimento</label>
                  <textarea 
                      value={res.text}
                      onChange={e => {
                        const newResults = [...localResults];
                        newResults[idx].text = e.target.value;
                        setLocalResults(newResults);
                      }}
                      className="w-full bg-brand-dark border border-white/5 rounded px-3 py-2 text-xs text-gray-400"
                      rows={3}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
};

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

export default SiteContentManager;
