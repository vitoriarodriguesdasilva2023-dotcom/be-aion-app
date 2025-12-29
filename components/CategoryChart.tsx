
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, TransactionType } from '../types';
import { formatCurrency } from '../constants';

interface CategoryChartProps {
  transactions: Transaction[];
  startDate: string;
  endDate: string;
}

const COLORS = ['#8257e5', '#10b981', '#f97316', '#f43f5e', '#3b82f6', '#eab308', '#a855f7'];

export const CategoryChart: React.FC<CategoryChartProps> = ({ transactions, startDate, endDate }) => {
  const data = useMemo(() => {
    // Filter by date range first
    const filteredTransactions = transactions.filter(t => {
       // Convert transaction date string to comparable format (YYYY-MM-DD)
       const tDate = t.date.split('T')[0];
       return tDate >= startDate && tDate <= endDate;
    });

    const expenses = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE);
    const groups: Record<string, number> = {};

    expenses.forEach(t => {
      const cat = t.category || 'Outros';
      groups[cat] = (groups[cat] || 0) + t.amount;
    });

    return Object.entries(groups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, startDate, endDate]);

  return (
    <div className="h-full w-full flex flex-col">
      <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Despesas por Categoria (Período)</h3>
      <div className="flex-1 min-h-[250px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  borderColor: '#334155', 
                  color: '#f8fafc',
                  borderRadius: '0.75rem',
                  fontSize: '12px'
                }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Legend 
                verticalAlign="middle" 
                align="right"
                layout="vertical"
                iconType="circle"
                wrapperStyle={{ paddingLeft: '10px', fontSize: '11px', color: '#94a3b8' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm flex-col gap-2">
            <p>Nenhuma despesa neste período.</p>
            <p className="text-xs opacity-50">Tente ajustar as datas no filtro acima.</p>
          </div>
        )}
      </div>
    </div>
  );
};
