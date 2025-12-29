import React, { useState, useMemo } from 'react';
import { Transaction, VaultItem } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface CalendarViewProps {
  transactions: Transaction[];
  vaultItems?: VaultItem[]; // Added vaultItems prop
  onDayClick: (dateStr: string, transactions: Transaction[], reminders: VaultItem[]) => void; // Updated signature
}

export const CalendarView: React.FC<CalendarViewProps> = ({ transactions, vaultItems = [], onDayClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const formattedMonth = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate);

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + offset);
      return newDate;
    });
  };

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday
    
    const days = [];
    
    // Empty slots for previous month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [year, month]);

  // Map transactions by date string (YYYY-MM-DD)
  const transactionsByDate = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    transactions.forEach(t => {
      const dateStr = t.date.split('T')[0];
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(t);
    });
    return map;
  }, [transactions]);

  // Map Reminders by date string
  const remindersByDate = useMemo(() => {
    const map: Record<string, VaultItem[]> = {};
    // Filter only reminders that have a start date
    vaultItems
      .filter(item => item.type === 'reminder' && item.reminderDate)
      .forEach(item => {
         const dateStr = item.reminderDate!.split('T')[0];
         if (!map[dateStr]) map[dateStr] = [];
         map[dateStr].push(item);
      });
    return map;
  }, [vaultItems]);

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <div className="flex flex-col h-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
        <button 
          onClick={() => changeMonth(-1)}
          className="p-2 text-indigo-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        
        <h2 className="text-xl font-bold text-white capitalize">
          {formattedMonth}
        </h2>

        <button 
          onClick={() => changeMonth(1)}
          className="p-2 text-indigo-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 flex-1">
        {/* Week headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((day, i) => (
             <div key={i} className="text-center text-xs font-semibold text-slate-500 py-2">
               {day}
             </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1 md:gap-2 auto-rows-fr">
           {calendarDays.map((date, index) => {
             if (!date) {
               return <div key={`empty-${index}`} className="p-2" />;
             }

             const yearStr = date.getFullYear();
             const monthStr = String(date.getMonth() + 1).padStart(2, '0');
             const dayStr = String(date.getDate()).padStart(2, '0');
             const dateKey = `${yearStr}-${monthStr}-${dayStr}`;

             const daysTransactions = transactionsByDate[dateKey] || [];
             const daysReminders = remindersByDate[dateKey] || [];
             
             // Indicators
             const hasPaid = daysTransactions.some(t => t.status === 'paid');
             const hasPending = daysTransactions.some(t => t.status === 'pending');
             const hasReminder = daysReminders.length > 0;
             
             const totalItems = daysTransactions.length + daysReminders.length;

             // Check if today
             const isToday = new Date().toDateString() === date.toDateString();

             return (
               <button
                 key={dateKey}
                 onClick={() => onDayClick(dateKey, daysTransactions, daysReminders)}
                 className={`
                    relative p-1 md:p-2 rounded-lg flex flex-col items-center justify-start min-h-[60px] md:min-h-[80px] transition-all border
                    ${isToday ? 'bg-indigo-600/20 border-indigo-500' : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600'}
                 `}
               >
                 <span className={`text-sm font-medium ${isToday ? 'text-indigo-300' : 'text-slate-300'}`}>
                   {date.getDate()}
                 </span>

                 {/* Transaction Indicators */}
                 <div className="flex gap-1 mt-2 flex-wrap justify-center max-w-[80%]">
                    {hasReminder && (
                      <div className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_5px_rgba(14,165,233,0.5)]"></div>
                    )}
                    {hasPaid && (
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                    )}
                    {hasPending && (
                      <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]"></div>
                    )}
                 </div>
                 
                 {totalItems > 0 && (
                   <div className="hidden md:block mt-auto">
                     <p className="text-[9px] text-slate-400">
                       {totalItems} item{totalItems > 1 ? 's' : ''}
                     </p>
                   </div>
                 )}
               </button>
             );
           })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex gap-4 justify-center mt-4 text-xs text-slate-400 flex-wrap">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-500"></div>
            <span>Lembrete</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>Pago</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
            <span>Pendente</span>
         </div>
      </div>
    </div>
  );
};
