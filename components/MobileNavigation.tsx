
import React from 'react';
import { HomeIcon, AlertCircleIcon, CalendarIcon, LockIcon, MoreHorizontalIcon } from './Icons';

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ activeTab, setActiveTab }) => {
  // Itens principais da barra de navegação
  const menuItems = [
    { id: 'dashboard', label: 'Painel', icon: HomeIcon },
    { id: 'calendar', label: 'Agenda', icon: CalendarIcon },
    { id: 'vault', label: 'Cofre', icon: LockIcon },
    { id: 'debts', label: 'Dívidas', icon: AlertCircleIcon },
    { id: 'more', label: 'Mais', icon: MoreHorizontalIcon },
  ];

  // Abas que ficam "dentro" do menu Mais
  const moreSubTabs = ['charts', 'transactions', 'cards', 'goals'];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] pb-safe">
      <div className="flex justify-around items-center h-16 w-full px-2">
        {menuItems.map((item) => {
          // Lógica de ativação: é a aba atual OU é a aba 'more' e a aba atual é uma das sub-abas
          const isActive = activeTab === item.id || (item.id === 'more' && moreSubTabs.includes(activeTab));
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-200 outline-none w-full ${
                isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {/* Active Indicator Line at Top */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-500 rounded-b-lg shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              )}
              
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-slate-800/50 -translate-y-1' : ''}`}>
                <item.icon className={`w-6 h-6 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Safe Area padding for iOS/Android gesture bars */}
      <div className="h-6 w-full bg-slate-900" />
    </div>
  );
};
