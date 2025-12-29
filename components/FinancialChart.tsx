import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Transaction, TransactionType } from '../types';

interface FinancialChartProps {
  transactions: Transaction[];
  customData?: any[]; // Allow external data injection
  title?: string;
}

export const FinancialChart: React.FC<FinancialChartProps> = ({ transactions, customData, title }) => {
  
  const data = React.useMemo(() => {
    // If custom forecast data is provided, use it directly
    if (customData && customData.length > 0) {
      return customData;
    }

    // Default behavior: Last 7 transaction groups or days
    const recent = [...transactions].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-10);
    
    // Group roughly for display if needed, or just list them
    return recent.map(t => ({
      name: new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      amount: t.amount,
      type: t.type,
      description: t.description // for tooltip
    }));
  }, [transactions, customData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl z-50">
          <p className="text-slate-300 text-xs mb-1 font-semibold">{label}</p>
          {dataPoint.description && (
             <p className="text-slate-400 text-[10px] mb-1 truncate max-w-[150px]">{dataPoint.description}</p>
          )}
          <p className={`text-sm font-bold ${dataPoint.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-rose-400'}`}>
            {dataPoint.type === 'INCOME' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full flex flex-col">
       {title && <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">{title}</h3>}
       
       <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              interval={customData ? 'preserveStartEnd' : 0} // Better fit for long projections
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `R$${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{fill: '#334155', opacity: 0.2}} />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.type === TransactionType.INCOME ? '#34d399' : '#fb7185'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};