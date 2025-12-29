import React from 'react';
import { formatCurrency } from '../constants';

interface DashboardCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  trend: string;
  type: 'positive' | 'negative' | 'neutral';
  footer?: React.ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, amount, icon, trend, type, footer }) => {
  const trendColor = type === 'positive' ? 'text-emerald-500 dark:text-emerald-400' : type === 'negative' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400';
  const trendBg = type === 'positive' ? 'bg-emerald-100 dark:bg-emerald-400/10' : type === 'negative' ? 'bg-rose-100 dark:bg-rose-400/10' : 'bg-slate-100 dark:bg-slate-400/10';

  return (
    <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-colors h-full flex flex-col justify-between shadow-sm dark:shadow-none">
      <div>
        <div className="flex justify-between items-start mb-2 md:mb-4">
          <div className="p-2 md:p-3 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            {icon}
          </div>
          <span className={`text-[10px] md:text-xs font-medium px-2 py-0.5 md:px-2.5 md:py-1 rounded-full whitespace-nowrap ${trendBg} ${trendColor}`}>
            {trend}
          </span>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium truncate capitalize">{title}</p>
          <h3 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white mt-1 break-words">{formatCurrency(amount)}</h3>
        </div>
      </div>
      {footer && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
          {footer}
        </div>
      )}
    </div>
  );
};