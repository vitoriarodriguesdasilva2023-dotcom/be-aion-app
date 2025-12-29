
import React, { useState } from 'react';
import { XIcon, DownloadIcon, UploadIcon } from './Icons';
import { THEMES } from '../constants';

const SettingsModal = ({ isOpen, onClose, currentTheme, setTheme, isDarkMode, setDarkMode, showIncome, setShowIncome, userName, setUserName, onExport, onImport, fileInputRef, onOpenIncomeModal, categories, onAddCategory, language, setLanguage, t, onFactoryReset }: any) => {
   const [newCategory, setNewCategory] = useState('');

   const handleAddCat = () => {
      const trimmed = newCategory.trim();
      if (!trimmed) return;
      
      // Strict Validation: Single word only
      if (trimmed.includes(' ')) {
         alert("Por favor, use apenas uma palavra para a categoria (Ex: Curso, Uber, Feira).");
         return;
      }

      onAddCategory(trimmed);
      setNewCategory('');
   };

   if(!isOpen) return null;
   
   return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
         <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-slate-800 dark:text-white">{t('settings_title')}</h2><button onClick={onClose}><XIcon className="w-6 h-6 text-slate-500" /></button></div>
            <div className="space-y-6">
               <section>
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">{t('settings_appearance')}</h3>
                  
                  {/* Dark Mode Toggle */}
                  <div className="flex justify-between items-center mb-4"><span className="text-slate-700 dark:text-slate-300">{t('settings_dark_mode')}</span><button onClick={() => setDarkMode(!isDarkMode)} className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${isDarkMode ? 'left-7' : 'left-1'}`}></div></button></div>
                  
                  {/* Theme Selector */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                     {Object.entries(THEMES).map(([key, theme]: any) => (
                        <button key={key} onClick={() => setTheme(key)} className={`h-10 rounded-lg border-2 ${currentTheme === key ? 'border-indigo-500' : 'border-transparent'}`} style={{ backgroundColor: theme.primary }} title={theme.label}></button>
                     ))}
                  </div>

                  {/* Language Selector (New) */}
                  <div className="mt-4">
                     <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2">{t('settings_language')}</label>
                     <select 
                        id="language-selector"
                        value={language} 
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-800 dark:text-white outline-none focus:border-indigo-500 cursor-pointer"
                     >
                        <option value="pt">🇧🇷 Português</option>
                        <option value="en">🇺🇸 English</option>
                        <option value="es">🇪🇸 Español</option>
                     </select>
                  </div>
               </section>
               
               <section>
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">{t('settings_custom_categories')}</h3>
                  <div className="flex gap-2 mb-3">
                     <input 
                        type="text" 
                        value={newCategory} 
                        onChange={e => setNewCategory(e.target.value)} 
                        placeholder="Nova categoria" 
                        className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                     />
                     <button onClick={handleAddCat} className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-indigo-500">Adicionar</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {categories.map((cat: string) => (
                        <span key={cat} className="px-2 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded text-xs border border-slate-200 dark:border-slate-700">{cat}</span>
                     ))}
                  </div>
               </section>

               <section>
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">{t('settings_data')}</h3>
                  <div className="space-y-3">
                     <button onClick={onOpenIncomeModal} className="w-full py-3 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold border border-emerald-200 dark:border-emerald-700">{t('settings_add_income')}</button>
                     <div className="flex gap-3">
                        <button onClick={onExport} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold flex justify-center gap-2"><DownloadIcon className="w-4 h-4" /> {t('settings_backup')}</button>
                        <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold flex justify-center gap-2"><UploadIcon className="w-4 h-4" /> {t('settings_restore')}</button>
                        <input type="file" ref={fileInputRef} onChange={onImport} className="hidden" accept=".json" />
                     </div>
                     <button onClick={onFactoryReset} className="w-full py-3 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-xl font-bold border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-colors">
                        {t('settings_reset') || "Zerar App (Fábrica)"}
                     </button>
                  </div>
               </section>
               <section>
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">{t('settings_preferences')}</h3>
                  <div className="flex justify-between items-center"><span className="text-slate-700 dark:text-slate-300">{t('settings_show_income')}</span><button onClick={() => setShowIncome(!showIncome)} className={`w-12 h-6 rounded-full transition-colors relative ${showIncome ? 'bg-indigo-600' : 'bg-slate-300'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${showIncome ? 'left-7' : 'left-1'}`}></div></button></div>
               </section>
            </div>
         </div>
      </div>
   );
};

export default SettingsModal;
