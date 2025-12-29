
import React from 'react';
import { Transaction, TransactionType, CreditCard } from '../types';
import { formatCurrency, formatDate } from '../constants';
// Added ListIcon to the imported icons
import { CreditCardIcon, PixIcon, FileTextIcon, RefreshCwIcon, CheckCircleIcon, ListIcon } from './Icons';

interface TransactionListProps {
  transactions: Transaction[];
  showCategory?: boolean;
  onTransactionClick?: (transaction: Transaction) => void;
  cards?: CreditCard[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, showCategory = true, onTransactionClick, cards = [] }) => {
  
  const getPaymentInfo = (t: Transaction) => {
    if (t.type === TransactionType.INCOME) return null;

    const isInstallment = t.installmentTotal && t.installmentTotal > 1;
    const prefix = isInstallment ? 'Parcelamento via ' : 'Via ';

    if (t.paymentMethod === 'credit_card' && t.cardId) {
      const card = cards.find(c => c.id === t.cardId);
      return (
        <span className="flex items-center gap-1 text-[10px] text-indigo-500 dark:text-indigo-400 font-medium mt-0.5">
          <CreditCardIcon className="w-3 h-3" />
          {prefix}Cartão {card ? card.name : ''}
        </span>
      );
    }
    
    if (t.paymentMethod === 'boleto') {
      return (
        <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
          <FileTextIcon className="w-3 h-3" />
          {prefix}Boleto
        </span>
      );
    }

    if (t.paymentMethod === 'pix') {
      return (
        <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
          <PixIcon className="w-3 h-3" />
          {prefix}Pix
        </span>
      );
    }

    if (isInstallment && !t.paymentMethod) {
       return (
        <span className="text-[10px] text-slate-400 mt-0.5">
          Parcelamento
        </span>
       );
    }

    return null;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm">
            <th className="py-4 px-4 font-medium">Descrição</th>
            {showCategory && <th className="py-4 px-4 font-medium hidden md:table-cell">Categoria</th>}
            <th className="py-4 px-4 font-medium">Status</th>
            <th className="py-4 px-4 font-medium hidden md:table-cell">Data</th>
            <th className="py-4 px-4 font-medium text-right">Valor</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {transactions.map((t) => (
            <tr 
              key={t.id} 
              onClick={() => onTransactionClick && onTransactionClick(t)}
              className={`border-b border-slate-100 dark:border-slate-800 transition-colors group ${onTransactionClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-800' : ''}`}
            >
              <td className="py-4 px-4">
                <div className="flex flex-col">
                  <div className="flex items-center flex-wrap gap-2">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{t.description}</p>
                    
                    {/* Transaction Type Indicator Badges */}
                    {t.installmentTotal && t.installmentTotal > 1 ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20 whitespace-nowrap">
                        <ListIcon className="w-3 h-3" />
                        {t.installmentCurrent}/{t.installmentTotal}
                      </span>
                    ) : t.isRecurring ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 whitespace-nowrap">
                        <RefreshCwIcon className="w-3 h-3" />
                        Recorrente
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                        <CheckCircleIcon className="w-3 h-3" />
                        Única
                      </span>
                    )}
                  </div>
                  {getPaymentInfo(t)}
                  <p className="text-xs text-slate-500 mt-1 md:hidden">
                    {formatDate(t.date)}
                    {showCategory && <span className="mx-1">• {t.category}</span>}
                  </p>
                </div>
              </td>
              {showCategory && (
                <td className="py-4 px-4 hidden md:table-cell">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                    {t.category}
                  </span>
                </td>
              )}
              <td className="py-4 px-4">
                 {t.status === 'paid' && (
                   <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                     Pago
                   </span>
                 )}
                 {t.status === 'pending' && (
                   <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-medium">
                     <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                     Pendente
                   </span>
                 )}
                 {t.status === 'overdue' && (
                   <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-500 text-xs font-bold bg-rose-100 dark:bg-rose-500/10 px-2 py-1 rounded">
                     <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                     ATRASADO
                   </span>
                 )}
              </td>
              <td className="py-4 px-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">
                {formatDate(t.date)}
              </td>
              <td className={`py-4 px-4 text-right font-semibold ${
                t.type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-400' : 
                t.status === 'overdue' ? 'text-rose-600 dark:text-rose-500' : 'text-slate-800 dark:text-slate-200'
              }`}>
                {t.type === TransactionType.EXPENSE ? '-' : '+'}{formatCurrency(t.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {transactions.length === 0 && (
        <div className="text-center py-10 text-slate-500">
          Nenhuma transação encontrada.
        </div>
      )}
    </div>
  );
};
