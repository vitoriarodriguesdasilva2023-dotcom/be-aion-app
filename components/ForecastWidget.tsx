
import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency } from '../constants';
import { CalculatorIcon, ArrowDownIcon, ArrowUpIcon } from './Icons';

interface ForecastWidgetProps {
  transactions: Transaction[];
  onProjectionUpdate?: (data: any[]) => void;
  // New props for lifted state
  startDate: string;
  endDate: string;
  onRangeChange: (start: string, end: string) => void;
}

export const ForecastWidget: React.FC<ForecastWidgetProps> = ({ transactions, onProjectionUpdate, startDate, endDate, onRangeChange }) => {
  const [selectedItem, setSelectedItem] = useState<string>('general_result'); // Default to General Expense Result

  // Extract unique descriptions and categories for the dropdown (including income and expenses)
  const options = useMemo(() => {
    // Unique descriptions (items)
    const items = Array.from(new Set(transactions.map(t => t.description))).sort();
    
    // Unique categories
    const categories = Array.from(new Set(transactions.map(t => t.category))).sort();

    return { items, categories };
  }, [transactions]);

  // Handle Quick Filters
  const handleQuickFilter = (type: 'this_month' | 'last_month' | 'this_year' | 'all') => {
     const now = new Date();
     let start = '';
     let end = '';

     if (type === 'this_month') {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        start = firstDay.toISOString().split('T')[0];
        end = lastDay.toISOString().split('T')[0];
     } else if (type === 'last_month') {
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
        start = firstDay.toISOString().split('T')[0];
        end = lastDay.toISOString().split('T')[0];
     } else if (type === 'this_year') {
        const firstDay = new Date(now.getFullYear(), 0, 1);
        const lastDay = new Date(now.getFullYear(), 11, 31);
        start = firstDay.toISOString().split('T')[0];
        end = lastDay.toISOString().split('T')[0];
     } else {
        // All / Everything (Wide range)
        start = '2020-01-01';
        end = '2030-12-31';
     }
     
     onRangeChange(start, end);
  };

  // Logic to calculate forecast
  const projection = useMemo(() => {
    if (!selectedItem || !startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Validate dates
    if (start > end) return null;

    // Calculate difference in months
    const yearsDiff = end.getFullYear() - start.getFullYear();
    const monthsDiff = end.getMonth() - start.getMonth() + (yearsDiff * 12);
    
    // We treat partial months as full months for safety/projection, or at least 1
    const durationInMonths = Math.max(1, monthsDiff + 1); 

    let baseMonthlyAmount = 0;
    let label = '';
    let itemType: TransactionType = TransactionType.EXPENSE;

    if (selectedItem === 'general_result') {
       const now = new Date();
       const currentMonthTotal = transactions
         .filter(t => t.type === TransactionType.EXPENSE && new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear())
         .reduce((acc, t) => acc + t.amount, 0);

       baseMonthlyAmount = currentMonthTotal > 0 ? currentMonthTotal : 0;
       label = "Total de Despesas (Baseado no mês atual)";
       itemType = TransactionType.EXPENSE;

    } else if (selectedItem === 'general_income_result') {
       const now = new Date();
       const currentMonthTotal = transactions
         .filter(t => t.type === TransactionType.INCOME && new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear())
         .reduce((acc, t) => acc + t.amount, 0);

       baseMonthlyAmount = currentMonthTotal > 0 ? currentMonthTotal : 0;
       label = "Total de Receitas (Baseado no mês atual)";
       itemType = TransactionType.INCOME;

    } else if (options.categories.includes(selectedItem)) {
       // Category Average (Most recent transaction amount for that category)
       const categoryTrans = transactions.filter(t => t.category === selectedItem);
       const lastTrans = categoryTrans.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
       baseMonthlyAmount = lastTrans ? lastTrans.amount : 0;
       label = `Categoria: ${selectedItem}`;
       itemType = lastTrans ? lastTrans.type : TransactionType.EXPENSE;

    } else {
       // Specific Item (Description)
       const itemTrans = transactions.filter(t => t.description === selectedItem);
       const lastTrans = itemTrans.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
       baseMonthlyAmount = lastTrans ? lastTrans.amount : 0;
       label = `Item: ${selectedItem}`;
       itemType = lastTrans ? lastTrans.type : TransactionType.EXPENSE;
    }

    const totalProjected = baseMonthlyAmount * durationInMonths;

    // Generate Data Array for Chart
    const chartData = [];
    let currentCursor = new Date(start);
    // Align cursor to start of month to avoid skipping feb 30 etc issues in loop
    currentCursor.setDate(1); 
    
    let safeGuard = 0;
    
    // Adjust logic: if start and end are in the same month, show at least one point
    // Using a simpler loop based on months count
    for (let i = 0; i < durationInMonths; i++) {
        if(safeGuard > 60) break;
        
        // Create a date for this iteration
        const iterationDate = new Date(start.getFullYear(), start.getMonth() + i, 1);
        
        chartData.push({
            name: iterationDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
            amount: baseMonthlyAmount,
            type: itemType,
            description: selectedItem === 'general_result' || selectedItem === 'general_income_result' ? 'Média Mensal' : selectedItem
        });
        safeGuard++;
    }

    return {
      total: totalProjected,
      monthly: baseMonthlyAmount,
      months: durationInMonths,
      label,
      type: itemType,
      chartData
    };

  }, [selectedItem, startDate, endDate, transactions, options]);

  // Effect to push data up to parent when projection changes
  useEffect(() => {
     if (onProjectionUpdate) {
         if (projection && projection.chartData.length > 0) {
             onProjectionUpdate(projection.chartData);
         } else {
             onProjectionUpdate([]); 
         }
     }
  }, [projection, onProjectionUpdate]);

  return (
    <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-200 dark:border-slate-700/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg">
          <CalculatorIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
        </div>
        <div>
           <h2 className="text-lg font-bold text-slate-800 dark:text-white">Previsão Acumulada</h2>
           <p className="text-sm text-slate-500 dark:text-slate-400">Projete gastos ou ganhos futuros e visualize o impacto.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Controls */}
         <div className="space-y-4 md:col-span-1 border-r border-slate-200 dark:border-slate-700/50 md:pr-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">Selecionar Item</label>
              <select 
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">-- Escolha um item --</option>
                <option value="general_income_result"> Resultado Geral (Todas as Receitas)</option>
                <option value="general_result"> Resultado Geral (Todas as Despesas)</option>
                
                <optgroup label="Categorias">
                   {options.categories.map(cat => (
                     <option key={`cat-${cat}`} value={cat}>{cat}</option>
                   ))}
                </optgroup>

                <optgroup label="Itens Específicos">
                   {options.items.map(item => (
                     <option key={`item-${item}`} value={item}>{item}</option>
                   ))}
                </optgroup>
              </select>
            </div>

            {/* Quick Filters */}
            <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">Período</label>
               <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                  <button onClick={() => handleQuickFilter('this_month')} className="px-3 py-1 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors whitespace-nowrap">Este Mês</button>
                  <button onClick={() => handleQuickFilter('last_month')} className="px-3 py-1 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors whitespace-nowrap">Mês Passado</button>
                  <button onClick={() => handleQuickFilter('this_year')} className="px-3 py-1 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors whitespace-nowrap">Este Ano</button>
                  <button onClick={() => handleQuickFilter('all')} className="px-3 py-1 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors whitespace-nowrap">Tudo</button>
               </div>

               <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-[10px] text-slate-500 mb-1">De:</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => onRangeChange(e.target.value, endDate)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Até:</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => onRangeChange(startDate, e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500"
                    />
                 </div>
               </div>
            </div>
         </div>

         {/* Results */}
         <div className="md:col-span-2 flex flex-col justify-center items-center text-center p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800/50 relative overflow-hidden">
            {!selectedItem ? (
               <p className="text-slate-500 text-sm">Selecione um item ao lado para ver a projeção.</p>
            ) : projection ? (
               <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{projection.label}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                    Considerando {projection.months} meses (Base mensal: {formatCurrency(projection.monthly)})
                  </p>
                  
                  <div className="flex items-center justify-center gap-2">
                     <span className="text-slate-600 dark:text-slate-500 text-lg">Total Estimado no Período:</span>
                  </div>
                  <div className={`text-4xl md:text-5xl font-extrabold mt-2 mb-4 bg-clip-text text-transparent bg-gradient-to-r ${projection.type === TransactionType.INCOME ? 'from-emerald-500 to-teal-500' : 'from-indigo-500 to-purple-500'}`}>
                     {formatCurrency(projection.total)}
                  </div>

                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${projection.type === TransactionType.INCOME ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                     {projection.type === TransactionType.INCOME ? (
                        <>
                           <ArrowUpIcon className="w-4 h-4 text-emerald-500" />
                           <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">Entrada Projetada</span>
                        </>
                     ) : (
                        <>
                           <ArrowDownIcon className="w-4 h-4 text-rose-500" />
                           <span className="text-rose-600 dark:text-rose-400 text-xs font-bold">Saída Projetada</span>
                        </>
                     )}
                  </div>
               </div>
            ) : (
               <p className="text-rose-400 text-sm">Período inválido.</p>
            )}
         </div>
      </div>
    </div>
  );
};
