import React from 'react';
import { AlertCircleIcon, CheckCircleIcon, BellIcon, XIcon } from './Icons';

export type NotificationType = 'success' | 'warning' | 'error' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

interface NotificationToastProps {
  notifications: AppNotification[];
  onClose: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, onClose }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            pointer-events-auto transform transition-all duration-300 animate-in slide-in-from-right-full fade-in
            flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-sm
            ${notification.type === 'success' ? 'bg-emerald-50/90 dark:bg-emerald-900/90 border-emerald-200 dark:border-emerald-700' : ''}
            ${notification.type === 'warning' ? 'bg-amber-50/90 dark:bg-amber-900/90 border-amber-200 dark:border-amber-700' : ''}
            ${notification.type === 'error' ? 'bg-rose-50/90 dark:bg-rose-900/90 border-rose-200 dark:border-rose-700' : ''}
            ${notification.type === 'info' ? 'bg-sky-50/90 dark:bg-sky-900/90 border-sky-200 dark:border-sky-700' : ''}
          `}
        >
          <div className="shrink-0 mt-0.5">
            {notification.type === 'success' && <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            {notification.type === 'warning' && <AlertCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
            {notification.type === 'error' && <AlertCircleIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
            {notification.type === 'info' && <BellIcon className="w-5 h-5 text-sky-600 dark:text-sky-400" />}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-bold mb-0.5 
               ${notification.type === 'success' ? 'text-emerald-800 dark:text-emerald-100' : ''}
               ${notification.type === 'warning' ? 'text-amber-800 dark:text-amber-100' : ''}
               ${notification.type === 'error' ? 'text-rose-800 dark:text-rose-100' : ''}
               ${notification.type === 'info' ? 'text-sky-800 dark:text-sky-100' : ''}
            `}>
              {notification.title}
            </h4>
            <p className={`text-xs leading-relaxed
               ${notification.type === 'success' ? 'text-emerald-700 dark:text-emerald-200' : ''}
               ${notification.type === 'warning' ? 'text-amber-700 dark:text-amber-200' : ''}
               ${notification.type === 'error' ? 'text-rose-700 dark:text-rose-200' : ''}
               ${notification.type === 'info' ? 'text-sky-700 dark:text-sky-200' : ''}
            `}>
              {notification.message}
            </p>
          </div>

          <button 
            onClick={() => onClose(notification.id)}
            className="shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500 dark:text-slate-300"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
