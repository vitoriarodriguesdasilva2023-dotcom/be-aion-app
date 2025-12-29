import React, { useState, useMemo } from 'react';
import { VaultItem, VaultItemType } from '../types';
import { LockIcon, CopyIcon, EyeIcon, EyeOffIcon, GlobeIcon, FileTextIcon, TrashIcon, PlusIcon, PixIcon, BellIcon } from './Icons';

interface VaultViewProps {
  items: VaultItem[];
  onAdd: (item: Omit<VaultItem, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
}

type FolderType = VaultItemType | 'all';

export const VaultView: React.FC<VaultViewProps> = ({ items, onAdd, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<FolderType>('all');
  
  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      onDelete(itemToDelete);
      setItemToDelete(null);
    }
  };

  // Filter items based on selected folder
  const filteredItems = useMemo(() => {
    if (activeFolder === 'all') return items;
    return items.filter(item => item.type === activeFolder);
  }, [items, activeFolder]);

  // Folder Configuration
  const folders = [
    { id: 'all', label: 'Geral', icon: LockIcon, color: 'text-indigo-400' },
    { id: 'login', label: 'Logins', icon: GlobeIcon, color: 'text-indigo-400' },
    { id: 'note', label: 'Notas', icon: FileTextIcon, color: 'text-amber-400' },
    { id: 'pix', label: 'Pix', icon: PixIcon, color: 'text-emerald-400' },
    { id: 'reminder', label: 'Lembretes', icon: BellIcon, color: 'text-sky-400' },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
          <div>
             <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <LockIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                Cofre Pessoal
             </h2>
             <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie seus dados sensíveis e lembretes.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
             <PlusIcon className="w-5 h-5" />
             <span className="hidden md:inline">Adicionar Item</span>
          </button>
       </div>

       {/* Folder Navigation */}
       <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {folders.map(folder => {
             const isActive = activeFolder === folder.id;
             const Icon = folder.icon;
             // Count items in this folder
             const count = folder.id === 'all' ? items.length : items.filter(i => i.type === folder.id).length;

             return (
               <button
                 key={folder.id}
                 onClick={() => setActiveFolder(folder.id as FolderType)}
                 className={`
                    flex items-center gap-2 px-4 py-3 rounded-xl border transition-all whitespace-nowrap min-w-[100px] justify-center relative
                    ${isActive 
                       ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-md z-10' 
                       : 'bg-slate-100 dark:bg-slate-900/50 border-transparent text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }
                 `}
               >
                  <Icon className={`w-4 h-4 ${isActive ? folder.color : 'text-slate-400'}`} />
                  <span className={`text-sm font-medium ${isActive ? 'text-slate-800 dark:text-white' : ''}`}>
                     {folder.label}
                  </span>
                  <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-indigo-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                     {count}
                  </span>
                  
                  {isActive && (
                    <div className="absolute -bottom-[1px] left-0 w-full h-[2px] bg-indigo-500 rounded-full"></div>
                  )}
               </button>
             );
          })}
       </div>

       {/* Grid Content */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
          {filteredItems.map(item => (
             <VaultCard 
               key={item.id} 
               item={item} 
               onDelete={(id) => setItemToDelete(id)} 
             />
          ))}
          {filteredItems.length === 0 && (
             <div className="col-span-full py-16 text-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                   {activeFolder === 'all' && <LockIcon className="w-8 h-8 opacity-30" />}
                   {activeFolder === 'login' && <GlobeIcon className="w-8 h-8 opacity-30" />}
                   {activeFolder === 'note' && <FileTextIcon className="w-8 h-8 opacity-30" />}
                   {activeFolder === 'pix' && <PixIcon className="w-8 h-8 opacity-30" />}
                   {activeFolder === 'reminder' && <BellIcon className="w-8 h-8 opacity-30" />}
                </div>
                <p className="font-medium">Pasta vazia</p>
                <p className="text-sm mt-1">
                   {activeFolder === 'all' 
                      ? 'Adicione itens para vê-los aqui.' 
                      : `Nenhum item do tipo "${folders.find(f => f.id === activeFolder)?.label}" encontrado.`}
                </p>
             </div>
          )}
       </div>

       {isModalOpen && (
         <AddVaultItemModal 
            onClose={() => setIsModalOpen(false)} 
            onAdd={onAdd} 
            initialType={activeFolder === 'all' ? 'login' : activeFolder} // Smart default
         />
       )}

       {/* Delete Confirmation Modal */}
       {itemToDelete && (
         <div className="fixed inset-0 bg-black/50 dark:bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-2xl animate-in zoom-in-95">
               <div className="flex justify-center mb-6">
                 <div className="bg-rose-100 dark:bg-rose-500/10 p-4 rounded-full">
                   <TrashIcon className="w-8 h-8 text-rose-600 dark:text-rose-500" />
                 </div>
               </div>
               
               <h3 className="text-xl font-bold text-slate-800 dark:text-white text-center mb-2">Excluir item?</h3>
               <p className="text-slate-500 dark:text-slate-400 text-center mb-8 text-sm">
                 Esta ação não pode ser desfeita.
               </p>

               <div className="flex gap-3">
                 <button
                    onClick={() => setItemToDelete(null)}
                    className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-medium py-3 rounded-xl transition-colors"
                 >
                   Cancelar
                 </button>
                 <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-rose-500/20 transition-colors"
                 >
                   Excluir
                 </button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

interface VaultCardProps {
  item: VaultItem;
  onDelete: (id: string) => void;
}

const VaultCard: React.FC<VaultCardProps> = ({ item, onDelete }) => {
   const [showPassword, setShowPassword] = useState(false);
   const [copiedField, setCopiedField] = useState<string | null>(null);

   const handleCopy = (text: string | undefined, field: string) => {
      if (!text) return;
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
   };

   // Helper to render icon based on type
   const renderIcon = () => {
      if (item.type === 'pix') return <PixIcon className="w-5 h-5" />;
      if (item.type === 'note') return <FileTextIcon className="w-5 h-5" />;
      if (item.type === 'reminder') return <BellIcon className="w-5 h-5" />;
      return <GlobeIcon className="w-5 h-5" />;
   };

   // Helper for background style
   const getStyle = () => {
      if (item.type === 'pix') return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      if (item.type === 'note') return 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400';
      if (item.type === 'reminder') return 'bg-sky-100 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400';
      return 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400';
   };

   // Formatting Dates for Reminder
   const formatReminderDate = (dateStr?: string) => {
     if (!dateStr) return '';
     return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
   };

   return (
      <div className={`
         bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm relative group transition-all hover:border-indigo-300 dark:hover:border-slate-600
         ${item.type === 'reminder' ? 'border-l-4 border-l-sky-500' : ''}
      `}>
         <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 w-full">
               <div className={`p-2.5 rounded-lg shrink-0 ${getStyle()}`}>
                  {renderIcon()}
               </div>
               
               <div className="min-w-0 flex-1">
                  {item.type === 'reminder' ? (
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-500 dark:text-sky-400 mb-0.5">
                           Cronograma
                        </span>
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight truncate">{item.title}</h3>
                     </div>
                  ) : (
                     <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight truncate">{item.title}</h3>
                        {item.url && (
                           <a href={item.url.startsWith('http') ? item.url : `https://${item.url}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline truncate max-w-[150px] block">
                              Ir para site ↗
                           </a>
                        )}
                        {item.type === 'pix' && <p className="text-xs text-emerald-600 dark:text-emerald-500 font-medium">Chave PIX Salva</p>}
                     </div>
                  )}
               </div>
            </div>
            <button 
               onClick={() => onDelete(item.id)}
               className="text-slate-400 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-500 transition-colors p-1 shrink-0 ml-2"
            >
               <TrashIcon className="w-4 h-4" />
            </button>
         </div>

         <div className="space-y-3">
            {/* Logic for REMINDER type */}
            {item.type === 'reminder' && (item.reminderDate) && (
               <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-500/20 rounded-lg p-3">
                  <div className="flex flex-col gap-1">
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">Início</span>
                        <span className="text-slate-800 dark:text-white font-medium">{formatReminderDate(item.reminderDate)}</span>
                     </div>
                     {item.endDate && (
                        <>
                           <div className="h-px bg-sky-200 dark:bg-sky-500/20 my-1"></div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">Fim</span>
                              <span className="text-slate-800 dark:text-white font-medium">{formatReminderDate(item.endDate)}</span>
                           </div>
                        </>
                     )}
                  </div>
               </div>
            )}

            {/* Logic for LOGIN type */}
            {item.type === 'login' && (
               <>
                  {item.username && (
                     <div className="relative">
                        <div className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-2.5 pr-10 text-sm text-slate-600 dark:text-slate-300 truncate font-mono">
                           {item.username}
                        </div>
                        <button 
                           onClick={() => handleCopy(item.username, 'user')}
                           className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                           title="Copiar usuário"
                        >
                           {copiedField === 'user' ? <span className="text-emerald-500 text-xs font-bold">Ok!</span> : <CopyIcon className="w-4 h-4" />}
                        </button>
                     </div>
                  )}
                  {item.password && (
                     <div className="relative">
                        <div className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-2.5 pr-20 text-sm text-slate-600 dark:text-slate-300 truncate font-mono flex items-center h-[42px]">
                           {showPassword ? item.password : '••••••••••••'}
                        </div>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                           <button 
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5"
                           >
                              {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                           </button>
                           <button 
                              onClick={() => handleCopy(item.password, 'pass')}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5"
                              title="Copiar senha"
                           >
                              {copiedField === 'pass' ? <span className="text-emerald-500 text-xs font-bold">Ok!</span> : <CopyIcon className="w-4 h-4" />}
                           </button>
                        </div>
                     </div>
                  )}
               </>
            )}

            {/* Logic for PIX type */}
            {item.type === 'pix' && item.pixKey && (
               <div className="relative mt-2">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-500/20 rounded-lg p-3 pr-10">
                     <p className="text-[10px] text-emerald-600 dark:text-emerald-500/70 uppercase font-bold mb-1">Chave PIX</p>
                     <p className="text-sm text-emerald-800 dark:text-emerald-100 font-mono break-all">{item.pixKey}</p>
                     {item.beneficiary && <p className="text-xs text-emerald-600 dark:text-emerald-400/60 mt-1">{item.beneficiary}</p>}
                  </div>
                  <button 
                     onClick={() => handleCopy(item.pixKey, 'pix')}
                     className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-700 dark:hover:text-white p-1"
                     title="Copiar chave PIX"
                  >
                     {copiedField === 'pix' ? <span className="text-emerald-500 text-xs font-bold">Ok!</span> : <CopyIcon className="w-5 h-5" />}
                  </button>
               </div>
            )}

            {/* Logic for Notes (Shared or Specific) */}
            {item.notes && (
               <div className={`${item.type === 'pix' ? 'bg-slate-50 dark:bg-slate-900/30' : item.type === 'reminder' ? 'bg-sky-50 dark:bg-sky-500/10 border-sky-100 dark:border-sky-500/20' : 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20'} border rounded-lg p-3 mt-2`}>
                  <p className="text-[10px] uppercase font-bold opacity-70 mb-1 flex items-center gap-1 text-slate-600 dark:text-slate-400">
                     <FileTextIcon className="w-3 h-3" /> {item.type === 'reminder' ? 'Descrição / Detalhes' : 'Nota'}:
                  </p>
                  <p className="text-sm opacity-90 whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-300">
                     {item.notes}
                  </p>
               </div>
            )}
         </div>
      </div>
   );
};

// Add Modal
const AddVaultItemModal = ({ onClose, onAdd, initialType }: { onClose: () => void, onAdd: (item: Omit<VaultItem, 'id' | 'createdAt'>) => void, initialType: VaultItemType }) => {
   const [type, setType] = useState<VaultItemType>(initialType);
   const [title, setTitle] = useState('');
   const [url, setUrl] = useState('');
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [notes, setNotes] = useState('');
   
   // Pix Fields
   const [pixKey, setPixKey] = useState('');
   const [beneficiary, setBeneficiary] = useState('');

   // Reminder Fields
   const [reminderDate, setReminderDate] = useState('');
   const [endDate, setEndDate] = useState('');

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!title) return;
      onAdd({ type, title, url, username, password, notes, pixKey, beneficiary, reminderDate, endDate });
      onClose();
   };

   return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
         <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Adicionar ao Cofre</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
               {/* Type Selector */}
               <div className="grid grid-cols-4 gap-2 mb-4">
                  <button
                     type="button"
                     onClick={() => setType('login')}
                     className={`py-2 rounded-lg border text-[10px] md:text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                        type === 'login' 
                           ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                           : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                     }`}
                  >
                     <GlobeIcon className="w-4 h-4" /> Login
                  </button>
                  <button
                     type="button"
                     onClick={() => setType('note')}
                     className={`py-2 rounded-lg border text-[10px] md:text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                        type === 'note' 
                           ? 'bg-amber-500 border-amber-400 text-white shadow-lg' 
                           : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                     }`}
                  >
                     <FileTextIcon className="w-4 h-4" /> Nota
                  </button>
                  <button
                     type="button"
                     onClick={() => setType('pix')}
                     className={`py-2 rounded-lg border text-[10px] md:text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                        type === 'pix' 
                           ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' 
                           : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                     }`}
                  >
                     <PixIcon className="w-4 h-4" /> PIX
                  </button>
                  <button
                     type="button"
                     onClick={() => setType('reminder')}
                     className={`py-2 rounded-lg border text-[10px] md:text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                        type === 'reminder' 
                           ? 'bg-sky-500 border-sky-400 text-white shadow-lg' 
                           : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                     }`}
                  >
                     <BellIcon className="w-4 h-4" /> Lembrete
                  </button>
               </div>

               <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">
                     {type === 'pix' ? 'Nome da Conta / Beneficiário' : type === 'reminder' ? 'Título do Evento' : 'Título / Plataforma'}
                  </label>
                  <input 
                     type="text" 
                     value={title}
                     onChange={e => setTitle(e.target.value)}
                     className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-800 dark:text-white focus:border-indigo-500 outline-none"
                     placeholder={type === 'pix' ? "Ex: Escola de Música, Aluguel" : type === 'reminder' ? "Ex: Inscrição Concurso, Pagamento Imposto" : "Ex: Netflix, Banco"}
                     autoFocus
                  />
               </div>

               {/* Fields for Login */}
               {type === 'login' && (
                  <>
                     <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Link / Site</label>
                        <input 
                           type="text" 
                           value={url}
                           onChange={e => setUrl(e.target.value)}
                           className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-800 dark:text-white focus:border-indigo-500 outline-none"
                           placeholder="https://..."
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Usuário / Login</label>
                           <input 
                              type="text" 
                              value={username}
                              onChange={e => setUsername(e.target.value)}
                              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-800 dark:text-white focus:border-indigo-500 outline-none"
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Senha</label>
                           <input 
                              type="text" // Intentionally text to see what you type before saving
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-800 dark:text-white focus:border-indigo-500 outline-none"
                           />
                        </div>
                     </div>
                  </>
               )}

               {/* Fields for PIX */}
               {type === 'pix' && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-500/20 p-4 rounded-xl space-y-3">
                     <div>
                        <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1 uppercase">Chave PIX</label>
                        <input 
                           type="text" 
                           value={pixKey}
                           onChange={e => setPixKey(e.target.value)}
                           className="w-full bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 rounded-lg p-3 text-slate-800 dark:text-white focus:border-emerald-500 outline-none font-mono"
                           placeholder="CPF, CNPJ, Email, Tel ou Aleatória"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1 uppercase">Beneficiário (Opcional)</label>
                        <input 
                           type="text" 
                           value={beneficiary}
                           onChange={e => setBeneficiary(e.target.value)}
                           className="w-full bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 rounded-lg p-3 text-slate-800 dark:text-white focus:border-emerald-500 outline-none"
                           placeholder="Nome de quem recebe"
                        />
                     </div>
                  </div>
               )}

               {/* Fields for Reminder */}
               {type === 'reminder' && (
                  <div className="bg-sky-50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-500/20 p-4 rounded-xl space-y-3">
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="block text-xs font-semibold text-sky-600 dark:text-sky-400 mb-1 uppercase">Data Início</label>
                           <input 
                              type="date" 
                              value={reminderDate}
                              onChange={e => setReminderDate(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-500/30 rounded-lg p-3 text-slate-800 dark:text-white focus:border-sky-500 outline-none text-sm"
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-semibold text-sky-600 dark:text-sky-400 mb-1 uppercase">Data Fim (Opcional)</label>
                           <input 
                              type="date" 
                              value={endDate}
                              onChange={e => setEndDate(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-500/30 rounded-lg p-3 text-slate-800 dark:text-white focus:border-sky-500 outline-none text-sm"
                           />
                        </div>
                     </div>
                     <p className="text-[10px] text-sky-600 dark:text-sky-400/60 leading-tight">
                        Defina um período para ser lembrado. O item ficará destacado no cofre.
                     </p>
                  </div>
               )}

               <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">
                     {type === 'login' ? 'Observações' : type === 'reminder' ? 'Descrição Detalhada' : 'Anotação'}
                  </label>
                  <textarea 
                     value={notes}
                     onChange={e => setNotes(e.target.value)}
                     className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-800 dark:text-white focus:border-indigo-500 outline-none min-h-[80px]"
                     placeholder={type === 'reminder' ? "Ex: Levar documentos: RG, CPF e Comprovante de Residência..." : "Digite aqui..."}
                  />
               </div>

               <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white">Cancelar</button>
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-indigo-500/20">
                     Salvar no Cofre
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
};