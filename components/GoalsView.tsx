
import React, { useState } from 'react';
import { Goal } from '../types';
import { TargetIcon, PlusIcon, TrashIcon, CheckCircleIcon, SparklesIcon, ArrowDownIcon, ArrowUpIcon, AlertCircleIcon, EditIcon } from './Icons';
import { formatCurrency } from '../constants';

interface GoalsViewProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'currentAmount'>) => void;
  onDeposit: (goalId: string, amount: number) => void;
  onWithdraw: (goalId: string, amount: number) => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string, returnFunds: boolean) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ goals, onAddGoal, onDeposit, onWithdraw, onEditGoal, onDeleteGoal }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  // Transaction States
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [withdrawGoalId, setWithdrawGoalId] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState('');
  
  // Feedback States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Delete States
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formDeadline, setFormDeadline] = useState('');

  const openCreateModal = () => {
    setEditingGoal(null);
    setFormTitle('');
    setFormTarget('');
    setFormDeadline('');
    setIsFormOpen(true);
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setFormTitle(goal.title);
    setFormTarget(goal.targetAmount.toString());
    setFormDeadline(goal.deadline ? goal.deadline.split('T')[0] : '');
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formTarget) return;
    
    const targetAmount = parseFloat(formTarget.replace(',', '.'));
    const deadline = formDeadline ? new Date(formDeadline).toISOString() : undefined;

    if (editingGoal) {
      onEditGoal({
        ...editingGoal,
        title: formTitle,
        targetAmount,
        deadline
      });
    } else {
      onAddGoal({
        title: formTitle,
        targetAmount,
        deadline
      });
    }
    
    setIsFormOpen(false);
    setFormTitle('');
    setFormTarget('');
    setFormDeadline('');
    setEditingGoal(null);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoalId || !amountInput) return;
    onDeposit(depositGoalId, parseFloat(amountInput.replace(',', '.')));
    setAmountInput('');
    setDepositGoalId(null);
    setShowSuccessModal(true); 
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawGoalId || !amountInput) return;
    const amount = parseFloat(amountInput.replace(',', '.'));
    
    // Validate balance
    const goal = goals.find(g => g.id === withdrawGoalId);
    if (goal && amount > goal.currentAmount) {
        alert("Valor indisponível. Você não pode sacar mais do que possui na meta.");
        return;
    }

    onWithdraw(withdrawGoalId, amount);
    setAmountInput('');
    setWithdrawGoalId(null);
  };

  const handleDeleteRequest = (goal: Goal) => {
     if (goal.currentAmount > 0) {
        setGoalToDelete(goal); // Triggers special modal
     } else {
        if(confirm("Tem certeza que deseja excluir esta meta?")) {
            onDeleteGoal(goal.id, false);
        }
     }
  };

  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) {
      return { text: 'Meta Contínua', className: 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-700' };
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Parse deadline string properly
    const parts = deadline.split('T')[0].split('-');
    const target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Venceu há ${Math.abs(diffDays)} dias`, className: 'text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30' };
    }
    if (diffDays === 0) {
      return { text: 'Vence hoje!', className: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30' };
    }
    if (diffDays <= 30) {
      return { text: `Faltam ${diffDays} dias`, className: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30' };
    }
    return { text: `Faltam ${diffDays} dias`, className: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30' };
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <TargetIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
            Metas Financeiras
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Defina objetivos e acompanhe seu progresso.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="hidden md:inline">Nova Meta</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {goals.map(goal => {
          const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          const isCompleted = progress >= 100;
          const status = getDeadlineStatus(goal.deadline);

          return (
            <div key={goal.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm relative group overflow-hidden flex flex-col h-full">
              {isCompleted && (
                 <div className="absolute top-0 right-0 p-2 bg-emerald-500/10 rounded-bl-xl z-10">
                    <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                 </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 pr-2">
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg truncate" title={goal.title}>{goal.title}</h3>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${status.className}`}>
                    {status.text}
                  </span>
                </div>
                
                <div className="flex gap-1 shrink-0">
                  <button 
                     onClick={() => openEditModal(goal)}
                     className="text-slate-400 hover:text-indigo-500 p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                     title="Editar Meta"
                  >
                     <EditIcon className="w-4 h-4" />
                  </button>
                  <button 
                     onClick={() => handleDeleteRequest(goal)}
                     className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                     title="Excluir Meta"
                  >
                     <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Progresso</span>
                  <span className="font-bold text-indigo-500">{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-end mb-6 mt-auto">
                <div>
                  <p className="text-xs text-slate-500">Atual</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">{formatCurrency(goal.currentAmount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Alvo</p>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{formatCurrency(goal.targetAmount)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                 <button
                    onClick={() => { setDepositGoalId(goal.id); setAmountInput(''); }}
                    className="flex-1 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1"
                 >
                    <ArrowUpIcon className="w-3 h-3" /> Depositar
                 </button>
                 <button
                    onClick={() => { setWithdrawGoalId(goal.id); setAmountInput(''); }}
                    disabled={goal.currentAmount <= 0}
                    className="flex-1 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    <ArrowDownIcon className="w-3 h-3" /> Resgatar
                 </button>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
           <div className="col-span-full py-20 text-center text-slate-400 flex flex-col items-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <TargetIcon className="w-16 h-16 opacity-20 mb-4" />
              <p>Nenhuma meta criada ainda.</p>
              <p className="text-sm">Comece a planejar seu futuro hoje!</p>
           </div>
        )}
      </div>

      {/* CREATE/EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md animate-in zoom-in-95">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{editingGoal ? 'Editar Meta' : 'Nova Meta'}</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Título</label>
                <input
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Ex: Viagem, Carro Novo"
                  className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Valor Alvo (R$)</label>
                <input
                  type="number"
                  value={formTarget}
                  onChange={e => setFormTarget(e.target.value)}
                  placeholder="0,00"
                  className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Data Alvo (Opcional)</label>
                <input
                  type="date"
                  value={formDeadline}
                  onChange={e => setFormDeadline(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Deixe em branco para meta contínua.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:text-slate-800 dark:hover:text-white">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-500 shadow-lg">{editingGoal ? 'Salvar' : 'Criar Meta'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEPOSIT MODAL */}
      {depositGoalId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-sm animate-in zoom-in-95">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Depositar na Meta</h2>
            <p className="text-sm text-slate-500 mb-6">Isso criará uma despesa de "Investimento" no seu fluxo de caixa.</p>
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <input
                type="number"
                value={amountInput}
                onChange={e => setAmountInput(e.target.value)}
                placeholder="Valor do depósito (R$)"
                className="w-full p-4 text-xl font-bold text-center rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white outline-none focus:border-emerald-500"
                autoFocus
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setDepositGoalId(null)} className="flex-1 py-3 text-slate-500 font-bold hover:text-slate-800 dark:hover:text-white">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-500 shadow-lg">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {withdrawGoalId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-sm animate-in zoom-in-95">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Resgatar da Meta</h2>
            <p className="text-sm text-slate-500 mb-6">O valor voltará para o seu saldo principal como uma Receita.</p>
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <input
                type="number"
                value={amountInput}
                onChange={e => setAmountInput(e.target.value)}
                placeholder="Valor do resgate (R$)"
                className="w-full p-4 text-xl font-bold text-center rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white outline-none focus:border-amber-500"
                autoFocus
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setWithdrawGoalId(null)} className="flex-1 py-3 text-slate-500 font-bold hover:text-slate-800 dark:hover:text-white">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold shadow-lg">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL WITH FUNDS OPTION */}
      {goalToDelete && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-sm animate-in zoom-in-95">
               <div className="flex justify-center mb-4">
                  <div className="p-3 bg-rose-100 dark:bg-rose-500/10 rounded-full">
                     <AlertCircleIcon className="w-8 h-8 text-rose-500" />
                  </div>
               </div>
               <h3 className="text-lg font-bold text-center text-slate-800 dark:text-white mb-2">Excluir Meta com Saldo?</h3>
               <p className="text-center text-sm text-slate-500 mb-6">
                  Há <strong>{formatCurrency(goalToDelete.currentAmount)}</strong> nesta meta. O que deseja fazer com este valor?
               </p>
               
               <div className="flex flex-col gap-3">
                  <button 
                     onClick={() => { onDeleteGoal(goalToDelete.id, true); setGoalToDelete(null); }}
                     className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-sm flex items-center justify-center gap-2"
                  >
                     <ArrowDownIcon className="w-4 h-4" /> Devolver ao Saldo (Receita)
                  </button>
                  <button 
                     onClick={() => { onDeleteGoal(goalToDelete.id, false); setGoalToDelete(null); }}
                     className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-bold shadow-sm flex items-center justify-center gap-2"
                  >
                     <TrashIcon className="w-4 h-4" /> Apenas Excluir (Já gastei)
                  </button>
                  <button 
                     onClick={() => setGoalToDelete(null)}
                     className="w-full py-2 text-slate-400 hover:text-slate-600 text-sm mt-1"
                  >
                     Cancelar
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* EDUCATIONAL SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[60] p-6 animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-emerald-500/30 p-8 rounded-2xl max-w-md w-full text-center relative shadow-2xl shadow-emerald-900/20 animate-in zoom-in-95">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-emerald-500/50">
                 <SparklesIcon className="w-10 h-10 text-emerald-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">Meta Atualizada! 🚀</h2>
              
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mb-6">
                 <p className="text-slate-300 text-sm leading-relaxed">
                    O registro foi feito no app. <br/><br/>
                    <strong className="text-emerald-400 uppercase text-xs tracking-wider">Dica de Mestre</strong><br/>
                    Que tal abrir o app do seu banco <strong>AGORA</strong> e separar esse dinheiro em uma Caixinha ou Investimento? Assim você garante que não gasta sem querer!
                 </p>
              </div>

              <button 
                 onClick={() => setShowSuccessModal(false)}
                 className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/40 transition-all active:scale-95"
              >
                 Boa ideia, vou fazer isso!
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
