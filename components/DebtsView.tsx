import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { TransactionList } from './TransactionList';
import { AlertCircleIcon, CheckCircleIcon, SparklesIcon } from './Icons';
import { formatCurrency } from '../constants';

interface DebtsViewProps {
  transactions: Transaction[];
  onTransactionClick: (t: Transaction) => void;
  onAddDebt: () => void;
}

export const DebtsView: React.FC<DebtsViewProps> = ({ transactions, onTransactionClick, onAddDebt }) => {
  
  // Filter only overdue
  const overdueTransactions = useMemo(() => {
    return transactions.filter(t => t.status === 'overdue').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);

  // Calculate total overdue amount
  const totalOverdue = useMemo(() => {
    return overdueTransactions.reduce((acc, t) => acc + t.amount, 0);
  }, [overdueTransactions]);

  const hasDebts = overdueTransactions.length > 0;

  return (
    <div className="space-y-6">
      <div className={`
        relative overflow-hidden p-6 rounded-2xl border shadow-lg transition-all duration-500
        ${hasDebts 
          ? 'bg-gradient-to-r from-rose-900 to-slate-900 border-rose-700/50 shadow-rose-900/20' 
          : 'bg-gradient-to-r from-emerald-900 to-slate-900 border-emerald-700/50 shadow-emerald-900/20'
        }
      `}>
         <div className={`
            absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-colors duration-500
            ${hasDebts ? 'bg-rose-600/10' : 'bg-emerald-600/10'}
         `}></div>

         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
               <div className="flex items-center gap-2 mb-2">
                 {hasDebts ? (
                    <AlertCircleIcon className="w-5 h-5 text-rose-400" />
                 ) : (
                    <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                 )}
                 <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                    {hasDebts ? 'Total em Atraso' : 'Situação Financeira'}
                 </h2>
               </div>
               
               <p className={`text-4xl font-extrabold transition-colors duration-300 ${hasDebts ? 'text-white' : 'text-emerald-50'}`}>
                  {hasDebts ? formatCurrency(totalOverdue) : 'Tudo em dia!'}
               </p>
               
               <p className={`text-sm mt-2 font-medium ${hasDebts ? 'text-rose-300' : 'text-emerald-300'}`}>
                 {hasDebts 
                   ? `${overdueTransactions.length} contas precisam de atenção imediata.`
                   : 'Você não possui dívidas em atraso no momento.'
                 }
               </p>
            </div>

            <div className={`
                w-full md:w-1/3 p-4 rounded-xl border backdrop-blur-sm transition-colors duration-300
                ${hasDebts ? 'bg-slate-900/50 border-rose-500/20' : 'bg-emerald-900/20 border-emerald-500/20'}
            `}>
               <div className="flex justify-between text-xs text-slate-300 mb-2">
                 <span>{hasDebts ? 'Nível de Pendências' : 'Saúde Financeira'}</span>
                 <span className={hasDebts ? 'text-rose-400' : 'text-emerald-400'}>
                    {hasDebts ? 'Prioridade Alta' : 'Excelente'}
                 </span>
               </div>
               
               {/* Progress Bar */}
               <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${hasDebts ? 'bg-gradient-to-r from-orange-500 to-rose-600' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`}
                    style={{ width: '100%' }} // Always full, color indicates state
                  >
                     <div className="w-full h-full animate-pulse bg-white/20"></div>
                  </div>
               </div>
               
               <p className="text-[10px] text-center mt-2 text-slate-400">
                  {hasDebts 
                    ? "Quite suas dívidas para regularizar sua situação!" 
                    : "Continue assim! Seu controle financeiro está ótimo."}
               </p>
            </div>
         </div>
      </div>

      <div className="flex justify-between items-center">
         <h3 className="text-lg font-bold text-white">
            {hasDebts ? 'Contas Vencidas' : 'Histórico de Dívidas'}
         </h3>
         <button 
           onClick={onAddDebt}
           className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium shadow
             ${hasDebts 
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/50' 
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200 shadow-slate-900/50'
             }
           `}
         >
           + Adicionar Dívida Manual
         </button>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 min-h-[400px]">
        {hasDebts ? (
          <TransactionList 
             transactions={overdueTransactions} 
             onTransactionClick={onTransactionClick}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-20 text-slate-500 animate-in fade-in duration-700">
             <div className="bg-emerald-500/10 p-6 rounded-full mb-6 ring-1 ring-emerald-500/30">
                <SparklesIcon className="w-12 h-12 text-emerald-500" />
             </div>
             <p className="text-xl font-bold text-white mb-2">Parabéns!</p>
             <p className="text-sm text-center max-w-xs leading-relaxed">
               Nenhuma conta atrasada encontrada. Aproveite para planejar seus investimentos.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};