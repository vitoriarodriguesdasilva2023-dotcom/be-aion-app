
import React, { useState, useEffect } from 'react';
import { HomeIcon, ListIcon, AlertCircleIcon, BarChartIcon, CalendarIcon, LockIcon, SettingsIcon, EditIcon, CreditCardIcon, LogOutIcon, TargetIcon } from './Icons';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'debts' | 'charts' | 'calendar' | 'vault' | 'cards' | 'goals') => void;
  onOpenSettings: () => void;
  userName: string;
  onUpdateUser: (name: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenSettings, userName, onUpdateUser, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localName, setLocalName] = useState(userName);

  // Sync local state if prop changes externally
  useEffect(() => {
    setLocalName(userName);
  }, [userName]);

  const handleSave = () => {
    if (localName.trim()) {
      onUpdateUser(localName);
    } else {
      setLocalName(userName); // Revert if empty
    }
    setIsEditing(false);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Painel', icon: HomeIcon },
    { id: 'calendar', label: 'Calendário', icon: CalendarIcon },
    { id: 'charts', label: 'Fluxo de Caixa', icon: BarChartIcon },
    { id: 'goals', label: 'Metas', icon: TargetIcon },
    { id: 'cards', label: 'Cartões', icon: CreditCardIcon },
    { id: 'vault', label: 'Cofre de Senhas', icon: LockIcon }, 
    { id: 'transactions', label: 'Transações', icon: ListIcon },
    { id: 'debts', label: 'Dívidas', icon: AlertCircleIcon },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 transition-colors duration-300">
      <div className="flex items-center gap-3 px-2 mb-10 mt-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
          A
        </div>
        <div className="text-xl font-bold flex gap-1">
          <span className="text-slate-800 dark:text-white">BE</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            AION
          </span>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-600/10 dark:text-indigo-400 dark:border-indigo-500/20 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-2">
        {/* Settings Button */}
        <button 
           onClick={onOpenSettings}
           className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-all duration-200"
        >
           <SettingsIcon className="w-5 h-5" />
           <span className="font-medium">Configurações</span>
        </button>

         {/* Logout Button */}
         <button 
           onClick={onLogout}
           className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-200 mb-2"
        >
           <LogOutIcon className="w-5 h-5" />
           <span className="font-medium">Sair</span>
        </button>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                {localName.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input 
                  autoFocus
                  type="text" 
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  className="w-full bg-white dark:bg-slate-900 border border-indigo-500 rounded px-1.5 py-0.5 text-sm outline-none text-slate-800 dark:text-white"
                />
              ) : (
                <div onClick={() => setIsEditing(true)} className="group cursor-pointer">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate flex items-center gap-1.5">
                    {userName}
                    <EditIcon className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <p className="text-xs text-slate-500">Pro Plan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
