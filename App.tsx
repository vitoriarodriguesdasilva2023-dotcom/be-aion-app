
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Transaction, TransactionType, TransactionStatus, VaultItem, CreditCard, Goal } from './types';
import { INITIAL_TRANSACTIONS, formatCurrency, formatDate, THEMES, ThemeKey } from './constants';
import { getGoogleCalendarUrl, generateICSFile, downloadICS } from './utils/calendarUtils';
import { generateMonthlyReport } from './utils/reportUtils';
import { DashboardCard } from './components/DashboardCard';
import { TransactionList } from './components/TransactionList';
import { FinancialChart } from './components/FinancialChart';
import { CategoryChart } from './components/CategoryChart';
import { DebtsView } from './components/DebtsView';
import { Sidebar } from './components/Sidebar';
import { MobileNavigation } from './components/MobileNavigation';
import { CalendarView } from './components/CalendarView';
import { ForecastWidget } from './components/ForecastWidget';
import { VaultView } from './components/VaultView';
import { VaultPinScreen } from './components/VaultPinScreen';
import { GoalsView } from './components/GoalsView';
import { NotificationToast, AppNotification, NotificationType } from './components/NotificationToast';
import SettingsModal from './components/SettingsModal';
import emailjs from 'https://esm.sh/@emailjs/browser@3.11.0';
import { 
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EditIcon,
  TrashIcon,
  AlertCircleIcon,
  CalculatorIcon,
  SettingsIcon,
  PaletteIcon,
  SunIcon,
  MoonIcon,
  ExternalLinkIcon,
  DownloadIcon,
  CalendarIcon,
  UploadIcon,
  ShieldIcon,
  PrinterIcon,
  MoreHorizontalIcon,
  PixIcon,
  CopyIcon,
  WalletIcon,
  BarChartIcon,
  BellIcon,
  ListIcon,
  CreditCardIcon,
  ArchiveIcon,
  ArrowUpIcon,
  XIcon,
  SendIcon,
  TargetIcon
} from './components/Icons';
import { LockIcon } from './components/Icons';

// --- EmailJS Config ---
const SERVICE_ID = "service_3gopmel";
const PUBLIC_KEY = "sXodUzoFMPDmnyVZu";
const TEMPLATE_ID_VERIFY = "template_aquq8gj";

// --- Constants ---
const DEFAULT_CATEGORIES = ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Serviços', 'Investimentos', 'Outros'];

// --- TRANSLATIONS CONFIGURATION ---
const TRANSLATIONS = {
  pt: {
    menu_dashboard: "Painel",
    menu_calendar: "Calendário",
    menu_charts: "Fluxo de Caixa",
    menu_goals: "Metas",
    menu_cards: "Cartões",
    menu_vault: "Cofre de Senhas",
    menu_transactions: "Transações",
    menu_debts: "Dívidas",
    menu_more: "Mais",
    menu_settings: "Configurações",
    menu_logout: "Sair",
    
    header_dashboard: "Visão Geral",
    header_charts: "Análise de Fluxo",
    header_transactions: "Transações",
    header_debts: "Central de Dívidas",
    header_calendar: "Calendário Financeiro",
    header_vault: "Cofre Pessoal",
    header_cards: "Cartões de Crédito",
    header_goals: "Metas Financeiras",
    header_more: "Mais Opções",
    
    btn_new_transaction: "Nova Transação",
    
    settings_title: "Configurações",
    settings_appearance: "Aparência",
    settings_language: "Idioma / Language",
    settings_dark_mode: "Modo Escuro",
    settings_custom_categories: "Categorias Personalizadas",
    settings_data: "Dados",
    settings_preferences: "Preferências",
    settings_show_income: "Mostrar Receitas no Painel",
    settings_backup: "Backup",
    settings_restore: "Restaurar",
    settings_add_income: "Adicionar Receita Manual",
    settings_reset: "Zerar App (Fábrica)"
  },
  en: {
    menu_dashboard: "Dashboard",
    menu_calendar: "Calendar",
    menu_charts: "Cash Flow",
    menu_goals: "Goals",
    menu_cards: "Cards",
    menu_vault: "Password Vault",
    menu_transactions: "Transactions",
    menu_debts: "Debts",
    menu_more: "More",
    menu_settings: "Settings",
    menu_logout: "Logout",
    
    header_dashboard: "Overview",
    header_charts: "Flow Analysis",
    header_transactions: "Transactions",
    header_debts: "Debt Center",
    header_calendar: "Financial Calendar",
    header_vault: "Personal Vault",
    header_cards: "Credit Cards",
    header_goals: "Financial Goals",
    header_more: "More Options",
    
    btn_new_transaction: "New Transaction",
    
    settings_title: "Settings",
    settings_appearance: "Appearance",
    settings_language: "Language",
    settings_dark_mode: "Dark Mode",
    settings_custom_categories: "Custom Categories",
    settings_data: "Data",
    settings_preferences: "Preferences",
    settings_show_income: "Show Income on Dashboard",
    settings_backup: "Backup",
    settings_restore: "Restore",
    settings_add_income: "Add Income Manually",
    settings_reset: "Factory Reset"
  },
  es: {
    menu_dashboard: "Panel",
    menu_calendar: "Calendario",
    menu_charts: "Flujo de Caja",
    menu_goals: "Metas",
    menu_cards: "Tarjetas",
    menu_vault: "Bóveda de Contraseñas",
    menu_transactions: "Transacciones",
    menu_debts: "Deudas",
    menu_more: "Más",
    menu_settings: "Configuración",
    menu_logout: "Salir",
    
    header_dashboard: "Visión General",
    header_charts: "Análisis de Flujo",
    header_transactions: "Transacciones",
    header_debts: "Central de Deudas",
    header_calendar: "Calendario Financiero",
    header_vault: "Bóveda Personal",
    header_cards: "Tarjetas de Crédito",
    header_goals: "Metas Financieras",
    header_more: "Más Opciones",
    
    btn_new_transaction: "Nueva Transacción",
    
    settings_title: "Configuración",
    settings_appearance: "Apariencia",
    settings_language: "Idioma",
    settings_dark_mode: "Modo Oscuro",
    settings_custom_categories: "Categorías Personalizadas",
    settings_data: "Datos",
    settings_preferences: "Preferencias",
    settings_show_income: "Mostrar Ingresos en el Panel",
    settings_backup: "Copia de Seguridad",
    settings_restore: "Restaurar",
    settings_add_income: "Añadir Ingreso Manual",
    settings_reset: "Restablecer Todo"
  }
};

type Language = keyof typeof TRANSLATIONS;

// --- Security Helpers (Global Encryption) ---
const encryptData = (data: any) => {
  try {
    return btoa(JSON.stringify(data));
  } catch (e) {
    console.error("Encryption error", e);
    return JSON.stringify(data);
  }
};

const decryptData = (encoded: string | null) => {
  if (!encoded) return null;
  try {
    return JSON.parse(atob(encoded));
  } catch (e) {
    try {
      return JSON.parse(encoded);
    } catch (e2) {
      return null;
    }
  }
};

// --- AUTH SCREEN COMPONENT ---
const AuthScreen = ({ onLogin }: { onLogin: (name: string, email: string) => void }) => {
   const [isLogin, setIsLogin] = useState(true);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   // Login State
   const [loginEmail, setLoginEmail] = useState('');
   const [loginPassword, setLoginPassword] = useState('');

   // Register State
   const [regName, setRegName] = useState('');
   const [regEmail, setRegEmail] = useState('');
   const [regConfirmEmail, setRegConfirmEmail] = useState('');
   const [regPassword, setRegPassword] = useState('');
   const [regConfirmPassword, setRegConfirmPassword] = useState('');

   // Password Generator State
   const [showGenerator, setShowGenerator] = useState(false);

   // Verification State (Modal)
   const [showOtpModal, setShowOtpModal] = useState(false);
   const [generatedOtp, setGeneratedOtp] = useState('');
   const [otpInput, setOtpInput] = useState('');

   // Recover Password State
   const [showRecoverModal, setShowRecoverModal] = useState(false);
   const [recoverStep, setRecoverStep] = useState<'email' | 'otp' | 'new_password'>('email');
   const [recoverEmail, setRecoverEmail] = useState('');
   const [recoverOtp, setRecoverOtp] = useState('');
   const [newPassword, setNewPassword] = useState('');

   const handleLoginSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      await new Promise(resolve => setTimeout(resolve, 800));

      const user = decryptData(localStorage.getItem('finpro_user'));
      
      if (user) {
         if (user.email === loginEmail && user.password === btoa(loginPassword)) {
            onLogin(user.name, user.email);
         } else {
            setError('E-mail ou senha incorretos.');
            setLoading(false);
         }
      } else {
         setError('Usuário não encontrado.');
         setLoading(false);
      }
   };

   const handleRegisterSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!regName || !regEmail || !regConfirmEmail || !regPassword || !regConfirmPassword) {
         setError('Preencha todos os campos obrigatórios.');
         return;
      }
      if (regEmail !== regConfirmEmail) {
         setError('Os e-mails não conferem.');
         return;
      }
      if (regPassword !== regConfirmPassword) {
         setError('As senhas não conferem.');
         return;
      }

      const user = decryptData(localStorage.getItem('finpro_user'));
      if (user) {
         if (user.email === regEmail) {
            setError('Este e-mail já está cadastrado.');
            return;
         }
      }

      setLoading(true);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);

      try {
         await emailjs.send(SERVICE_ID, TEMPLATE_ID_VERIFY, {
            name: regName,
            email: regEmail,
            otp_code: code
         }, PUBLIC_KEY);

         setShowOtpModal(true);
         setError('');
      } catch (err) {
         console.error(err);
         setError('Erro ao enviar e-mail de verificação. Tente novamente.');
      } finally {
         setLoading(false);
      }
   };

   const handleVerifyOtp = (e: React.FormEvent) => {
      e.preventDefault();
      if (otpInput === generatedOtp) {
         const encryptedPassword = btoa(regPassword);
         const newUser = { name: regName, email: regEmail, password: encryptedPassword };
         
         localStorage.setItem('finpro_user', encryptData(newUser));
         
         alert('Conta verificada com sucesso!');
         onLogin(regName, regEmail);
      } else {
         setError('Código inválido. Verifique seu e-mail.');
      }
   };

   const handleRecoverSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      
      const user = decryptData(localStorage.getItem('finpro_user'));
      
      if (!user || user.email !== recoverEmail) {
         setError('E-mail não encontrado na base de dados.');
         return;
      }

      setLoading(true);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);

      try {
         await emailjs.send(SERVICE_ID, TEMPLATE_ID_VERIFY, {
            name: user.name,
            email: recoverEmail,
            otp_code: code
         }, PUBLIC_KEY);

         setRecoverStep('otp');
         setError('');
      } catch (err) {
         console.error(err);
         setError('Erro ao enviar código. Tente novamente.');
      } finally {
         setLoading(false);
      }
   };

   const handleRecoverVerify = (e: React.FormEvent) => {
      e.preventDefault();
      if (recoverOtp === generatedOtp) {
         setRecoverStep('new_password');
         setError('');
      } else {
         setError('Código inválido.');
      }
   };

   const handleRecoverSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newPassword || newPassword.length < 4) {
         setError('Senha muito curta.');
         return;
      }

      const user = decryptData(localStorage.getItem('finpro_user'));
      if (user) {
         user.password = btoa(newPassword);
         localStorage.setItem('finpro_user', encryptData(user));
         alert('Senha redefinida com sucesso! Faça login.');
         setShowRecoverModal(false);
         setIsLogin(true);
         setRecoverStep('email');
         setRecoverEmail('');
         setRecoverOtp('');
         setNewPassword('');
         setError('');
      }
   };

   return (
      <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4 font-sans">
         <div className="bg-[#202024] border border-[#29292e] p-8 rounded-lg w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-500 relative">
            <div className="text-center mb-8">
               <div className="w-16 h-16 bg-[#8257e5] rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-[#8257e5]/20 mb-4">
                  <span className="text-3xl font-bold text-white">A</span>
               </div>
               <h1 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-1">
                  <span>BE</span> <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">AION</span>
               </h1>
               <p className="text-[#a8a8b3] text-sm">
                  {isLogin ? 'Entre para acessar suas finanças' : 'Crie sua conta segura'}
               </p>
            </div>

            {isLogin && (
               <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                     <input 
                        type="email" 
                        placeholder="E-mail" 
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        className="w-full bg-[#121214] border border-[#29292e] rounded-lg p-4 text-white placeholder-[#7c7c8a] focus:border-[#8257e5] outline-none transition-colors"
                     />
                  </div>
                  <div>
                     <input 
                        type="password" 
                        placeholder="Senha" 
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        className="w-full bg-[#121214] border border-[#29292e] rounded-lg p-4 text-white placeholder-[#7c7c8a] focus:border-[#8257e5] outline-none transition-colors"
                     />
                  </div>
                  
                  {error && <p className="text-rose-400 text-sm text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">{error}</p>}
                  
                  <button 
                     type="submit" 
                     disabled={loading}
                     className="w-full bg-[#8257e5] hover:bg-[#996dff] text-white font-bold py-4 rounded-lg shadow-lg shadow-[#8257e5]/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     {loading ? 'Entrando...' : 'Acessar Conta'}
                  </button>
               </form>
            )}

            {!isLogin && (
               <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <input 
                     type="text" 
                     placeholder="Nome Completo" 
                     value={regName}
                     onChange={e => setRegName(e.target.value)}
                     className="w-full bg-[#121214] border border-[#29292e] rounded-lg p-4 text-white placeholder-[#7c7c8a] focus:border-[#8257e5] outline-none transition-colors"
                  />
                  <input 
                     type="email" 
                     placeholder="E-mail" 
                     value={regEmail}
                     onChange={e => setRegEmail(e.target.value)}
                     className="w-full bg-[#121214] border border-[#29292e] rounded-lg p-4 text-white placeholder-[#7c7c8a] focus:border-[#8257e5] outline-none transition-colors"
                  />
                  <input 
                     type="email" 
                     placeholder="Confirmar E-mail" 
                     value={regConfirmEmail}
                     onChange={e => setRegConfirmEmail(e.target.value)}
                     className={`w-full bg-[#121214] border rounded-lg p-4 text-white placeholder-[#7c7c8a] outline-none transition-colors ${regConfirmEmail && regEmail !== regConfirmEmail ? 'border-rose-500 focus:border-rose-500' : 'border-[#29292e] focus:border-[#8257e5]'}`}
                  />
                  
                  <div className="relative">
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-[#a8a8b3]">Senha</span>
                     </div>
                     <input 
                        type="password" 
                        placeholder="Gerar uma senha" 
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        className="w-full bg-[#121214] border border-[#29292e] rounded-lg p-4 text-white placeholder-[#7c7c8a] focus:border-[#8257e5] outline-none transition-colors"
                     />
                  </div>

                  <input 
                     type="password" 
                     placeholder="Confirmar Senha" 
                     value={regConfirmPassword}
                     onChange={e => setRegConfirmPassword(e.target.value)}
                     className={`w-full bg-[#121214] border rounded-lg p-4 text-white placeholder-[#7c7c8a] outline-none transition-colors ${regConfirmPassword && regPassword !== regConfirmPassword ? 'border-rose-500 focus:border-rose-500' : 'border-[#29292e] focus:border-[#8257e5]'}`}
                  />

                  {error && <p className="text-rose-400 text-sm text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">{error}</p>}

                  <button 
                     type="submit" 
                     disabled={loading}
                     className="w-full bg-[#8257e5] hover:bg-[#996dff] text-white font-bold py-4 rounded-lg shadow-lg shadow-[#8257e5]/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     {loading ? 'Enviando Código...' : 'Criar Conta'}
                  </button>
               </form>
            )}

            <div className="mt-8 text-center pt-4 border-t border-[#29292e]">
               <button 
                  onClick={() => { 
                     setIsLogin(!isLogin); 
                     setError(''); 
                     setOtpInput('');
                     setShowOtpModal(false);
                  }}
                  className="text-[#a8a8b3] hover:text-white text-sm transition-colors"
                  disabled={loading}
               >
                  {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem conta? Fazer Login'}
               </button>

               {isLogin && (
                  <button 
                     onClick={() => {
                        setShowRecoverModal(true);
                        setRecoverStep('email');
                        setError('');
                     }}
                     className="block w-full text-[#a8a8b3] hover:text-white text-xs mt-4 transition-colors"
                  >
                     Esqueci minha senha
                  </button>
               )}
            </div>

            {showOtpModal && (
               <div className="absolute inset-0 bg-[#121214]/95 backdrop-blur-md z-50 rounded-lg flex items-center justify-center p-6 animate-in fade-in duration-300">
                  <div className="w-full">
                     <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-[#04d361]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                           <SendIcon className="w-6 h-6 text-[#04d361]" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Código Enviado!</h3>
                        <p className="text-sm text-[#a8a8b3] mt-2">
                           Verifique seu e-mail <strong>{regEmail}</strong> e digite o código de 6 dígitos.
                        </p>
                     </div>

                     <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <input 
                           type="text" 
                           inputMode="numeric"
                           maxLength={6}
                           placeholder="000000"
                           value={otpInput}
                           onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                           className="w-full bg-[#121214] border border-[#29292e] rounded-lg p-4 text-center text-3xl tracking-[0.25em] font-bold text-white focus:border-[#04d361] outline-none transition-colors"
                           autoFocus
                        />
                        
                        {error && <p className="text-rose-400 text-sm text-center font-bold">{error}</p>}

                        <div className="flex gap-3">
                           <button 
                              type="button"
                              onClick={() => { setShowOtpModal(false); setOtpInput(''); }}
                              className="flex-1 bg-[#29292e] hover:bg-[#323238] text-white font-bold py-3 rounded-lg transition-colors"
                           >
                              Cancelar
                           </button>
                           <button 
                              type="submit" 
                              className="flex-1 bg-[#04d361] hover:bg-[#04d361]/90 text-white font-bold py-3 rounded-lg shadow-lg shadow-[#04d361]/20 transition-all active:scale-95"
                           >
                              Confirmar
                           </button>
                        </div>
                     </form>
                  </div>
               </div>
            )}

            {showRecoverModal && (
               <div className="absolute inset-0 bg-[#121214]/95 backdrop-blur-md z-50 rounded-lg flex items-center justify-center p-6 animate-in fade-in duration-300">
                  <div className="w-full">
                     <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                           <LockIcon className="w-6 h-6 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Recuperar Senha</h3>
                        {recoverStep === 'email' && <p className="text-sm text-[#a8a8b3] mt-2">Digite seu e-mail cadastrado.</p>}
                        {recoverStep === 'otp' && <p className="text-sm text-[#a8a8b3] mt-2">Verifique o código enviado para <strong>{recoverEmail}</strong>.</p>}
                        {recoverStep === 'new_password' && <p className="text-sm text-[#a8a8b3] mt-2">Crie sua nova senha.</p>}
                     </div>

                     {recoverStep === 'email' && (
                        <form onSubmit={handleRecoverSubmit} className="space-y-4">
                           <input 
                              type="email" 
                              placeholder="Seu e-mail"
                              value={recoverEmail}
                              onChange={e => setRecoverEmail(e.target.value)}
                              className="w-full bg-[#121214] border border-[#29292e] rounded-lg p-4 text-white focus:border-[#8257e5] outline-none"
                              autoFocus
                           />
                           {error && <p className="text-rose-400 text-sm text-center font-bold">{error}</p>}
                           <div className="flex gap-3">
                              <button type="button" onClick={() => setShowRecoverModal(false)} className="flex-1 bg-[#29292e] hover:bg-[#323238] text-white font-bold py-3 rounded-lg">Cancelar</button>
                              <button type="submit" disabled={loading} className="flex-1 bg-[#8257e5] hover:bg-[#996dff] text-white font-bold py-3 rounded-lg shadow-lg">
                                 {loading ? 'Enviando...' : 'Enviar Código'}
                              </button>
                           </div>
                        </form>
                     )}

                     {recoverStep === 'otp' && (
                        <form onSubmit={handleRecoverVerify} className="space-y-4">
                           <input 
                              type="text" 
                              inputMode="numeric"
                              maxLength={6}
                              placeholder="000000"
                              value={recoverOtp}
                              onChange={e => setRecoverOtp(e.target.value.replace(/\D/g, ''))}
                              className="w-full bg-[#121214] border border-[#29292e] rounded-lg p-4 text-center text-3xl tracking-[0.25em] font-bold text-white focus:border-[#8257e5] outline-none"
                              autoFocus
                           />
                           {error && <p className="text-rose-400 text-sm text-center font-bold">{error}</p>}
                           <div className="flex gap-3">
                              <button type="button" onClick={() => { setRecoverStep('email'); setError(''); }} className="flex-1 bg-[#29292e] hover:bg-[#323238] text-white font-bold py-3 rounded-lg">Voltar</button>
                              <button type="submit" className="flex-1 bg-[#8257e5] hover:bg-[#996dff] text-white font-bold py-3 rounded-lg shadow-lg">Verificar</button>
                           </div>
                        </form>
                     )}

                     {recoverStep === 'new_password' && (
                        <form onSubmit={handleRecoverSave} className="space-y-4">
                           <input 
                              type="password" 
                              placeholder="Nova Senha"
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              className="w-full bg-[#121214] border border-[#29292e] rounded-lg p-4 text-white focus:border-[#8257e5] outline-none"
                              autoFocus
                           />
                           {error && <p className="text-rose-400 text-sm text-center font-bold">{error}</p>}
                           <button type="submit" className="w-full bg-[#04d361] hover:bg-[#04d361]/90 text-white font-bold py-3 rounded-lg shadow-lg">Salvar Nova Senha</button>
                        </form>
                     )}
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

// --- Helpers for Business Days Logic ---
const getNthBusinessDay = (year: number, month: number, n: number) => {
  let count = 0;
  let day = 1;
  while (count < n) {
    const d = new Date(year, month, day);
    if (d.getMonth() !== month) return new Date(year, month + 1, 0); 
    
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    if (count === n) return d;
    day++;
  }
  return new Date(year, month, day);
};

const adjustToNextBusinessDay = (date: Date) => {
   const d = new Date(date);
   const day = d.getDay();
   if (day === 0) d.setDate(d.getDate() + 1); 
   if (day === 6) d.setDate(d.getDate() + 2); 
   return d;
};

// --- RESTORED MODAL COMPONENTS ---

const TransactionDetailsModal = ({ transaction, onClose, onUpdateStatus, onDelete, onUpdate, onStopRecurrence, onAnticipate, hasFutureRecurrences, hasPendingInstallments }: {
  transaction: Transaction;
  onClose: () => void;
  onUpdateStatus: (id: string, status: TransactionStatus) => void;
  onDelete: (t: Transaction) => void;
  onUpdate: (t: Transaction) => void;
  onStopRecurrence: (t: Transaction) => void;
  onAnticipate: (t: Transaction) => void;
  hasFutureRecurrences: boolean;
  hasPendingInstallments: boolean;
}) => {
   const [isEditing, setIsEditing] = useState(false);
   const [editDesc, setEditDesc] = useState(transaction.description);
   const [editAmount, setEditAmount] = useState(transaction.amount.toString());
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
   const [showStopRecurrenceConfirm, setShowStopRecurrenceConfirm] = useState(false);

   const handleSave = () => {
      onUpdate({ ...transaction, description: editDesc, amount: parseFloat(editAmount) });
      setIsEditing(false);
   };

   return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
         <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-700 transition-all">
            {showDeleteConfirm ? (
               <div className="text-center animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                     <TrashIcon className="w-8 h-8 text-rose-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Tem certeza?</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Você está prestes a excluir <strong>{transaction.description}</strong>. Esta ação é irreversível.
                  </p>
                  <div className="flex gap-3">
                     <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancelar</button>
                     <button onClick={() => onDelete(transaction)} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 transition-colors">Sim, Excluir</button>
                  </div>
               </div>
            ) : showStopRecurrenceConfirm ? (
               <div className="text-center animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                     <ClockIcon className="w-8 h-8 text-rose-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Parar Recorrência?</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Você deseja parar a recorrência desta transação? As próximas ocorrências não serão geradas.</p>
                  <div className="flex gap-3">
                     <button onClick={() => setShowStopRecurrenceConfirm(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Voltar</button>
                     <button onClick={() => onStopRecurrence(transaction)} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 transition-colors">Sim, Parar</button>
                  </div>
               </div>
            ) : isEditing ? (
               <div className="space-y-4">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">Editar Transação</h3>
                  <input value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded text-slate-800 dark:text-white" />
                  <input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded text-slate-800 dark:text-white" />
                  <div className="flex gap-2">
                     <button onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 rounded text-slate-800 dark:text-white">Cancelar</button>
                     <button onClick={handleSave} className="flex-1 py-2 bg-indigo-600 text-white rounded">Salvar</button>
                  </div>
               </div>
            ) : (
               <>
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <span className="text-xs uppercase font-bold text-slate-400">{transaction.category}</span>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">{transaction.description}</h2>
                        <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{formatCurrency(transaction.amount)}</p>
                     </div>
                     <button onClick={onClose} className="p-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500">✕</button>
                  </div>
                  <div className="space-y-2 mb-6">
                     <div className="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-slate-500">Vencimento</span>
                        <span className="text-slate-800 dark:text-white">{formatDate(transaction.date)}</span>
                     </div>
                     <div className="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-slate-500">Status</span>
                        <span className={`font-bold ${transaction.status === 'paid' ? 'text-emerald-500' : transaction.status === 'overdue' ? 'text-rose-500' : 'text-amber-500'}`}>
                           {transaction.status === 'paid' ? 'Pago' : transaction.status === 'overdue' ? 'Atrasado' : 'Pendente'}
                        </span>
                     </div>
                     {transaction.status === 'paid' && transaction.paidAt && (
                        <div className="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-700">
                           <span className="text-slate-500">Pago em</span>
                           <span className="text-slate-800 dark:text-white">{formatDate(transaction.paidAt)}</span>
                        </div>
                     )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                     {transaction.status !== 'paid' && <button onClick={() => onUpdateStatus(transaction.id, 'paid')} className="col-span-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors">Marcar como Pago</button>}
                     {transaction.status === 'paid' && <button onClick={() => onUpdateStatus(transaction.id, 'pending')} className="col-span-2 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-colors">Marcar como Pendente</button>}
                     <button onClick={() => setIsEditing(true)} className="py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Editar</button>
                     <button onClick={() => setShowDeleteConfirm(true)} className="py-3 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl font-bold hover:bg-rose-200 transition-colors">Excluir</button>
                  </div>
                  {hasFutureRecurrences && <button onClick={() => setShowStopRecurrenceConfirm(true)} className="w-full py-2 mb-2 text-xs font-bold text-rose-500 border border-rose-200 dark:border-rose-500/30 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10">Parar Recorrência Futura</button>}
                  {hasPendingInstallments && <button onClick={() => { if(confirm('Marcar todas as parcelas pendentes como pagas?')) onAnticipate(transaction) }} className="w-full py-2 text-xs font-bold text-indigo-500 border border-indigo-200 dark:border-indigo-500/30 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10">Antecipar Parcelas Restantes</button>}
               </>
            )}
         </div>
      </div>
   );
};

const AddTransactionModal = ({ onClose, onAdd, cards = [], categories }: { onClose: () => void, onAdd: (t: Omit<Transaction, 'id'>[]) => void, cards?: CreditCard[], categories: string[] }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState(categories[0] || 'Alimentação');
  
  const [useCard, setUseCard] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [recurrence, setRecurrence] = useState<'single' | 'fixed' | 'installments'>('single');
  const [recurrenceCount, setRecurrenceCount] = useState('2');
  const [workDaysOnly, setWorkDaysOnly] = useState(false);
  const [nthDay, setNthDay] = useState('');
  const [installmentMode, setInstallmentMode] = useState<'total' | 'monthly'>('total');
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'boleto' | 'pix' | 'cash' | 'other'>('other');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date) return;
    if (useCard && !selectedCardId) {
        alert("Selecione um cartão ou desative a opção 'Compra no cartão'.");
        return;
    }

    const numAmount = parseFloat(amount.replace(',', '.')); 
    const effectivePaymentMethod = useCard ? 'credit_card' : paymentMethod;

    if (recurrence === 'installments') {
       const totalInstallments = parseInt(recurrenceCount);
       const groupId = Math.random().toString(36).substr(2, 9);
       const baseDate = new Date(date);
       let monthlyAmount = installmentMode === 'monthly' ? numAmount : numAmount / totalInstallments;
       const newTransactions: Omit<Transaction, 'id'>[] = [];

       for (let i = 0; i < totalInstallments; i++) {
          let tDate = new Date(baseDate);
          tDate.setMonth(baseDate.getMonth() + i);
          if (nthDay && parseInt(nthDay) > 0) tDate = getNthBusinessDay(tDate.getFullYear(), tDate.getMonth(), parseInt(nthDay));
          else if (workDaysOnly) tDate = adjustToNextBusinessDay(tDate);

          newTransactions.push({
            description: `${description}`,
            amount: monthlyAmount,
            date: tDate.toISOString(),
            type,
            category,
            status: 'pending',
            groupId,
            installmentCurrent: i + 1,
            installmentTotal: totalInstallments,
            cardId: useCard ? selectedCardId : undefined,
            paymentMethod: effectivePaymentMethod
          });
       }
       onAdd(newTransactions);
    } else if (recurrence === 'fixed') {
       const groupId = Math.random().toString(36).substr(2, 9);
       const [y, m, d] = date.split('-').map(Number);
       const startYear = y;
       const startMonth = m - 1; 
       const startDay = d;
       const newTransactions: Omit<Transaction, 'id'>[] = [];
       
       for (let i = 0; i < 12; i++) {
          const targetMonthIndex = startMonth + i;
          const year = startYear + Math.floor(targetMonthIndex / 12);
          const month = targetMonthIndex % 12;
          let tDate: Date;
          if (nthDay && parseInt(nthDay) > 0) tDate = getNthBusinessDay(year, month, parseInt(nthDay));
          else {
              const maxDaysInMonth = new Date(year, month + 1, 0).getDate();
              const day = Math.min(startDay, maxDaysInMonth);
              tDate = new Date(year, month, day, 12, 0, 0);
              if (workDaysOnly) tDate = adjustToNextBusinessDay(tDate);
          }
          newTransactions.push({
             description,
             amount: numAmount,
             date: tDate.toISOString(),
             type,
             category,
             status: 'pending',
             groupId,
             isRecurring: true,
             cardId: useCard ? selectedCardId : undefined,
             paymentMethod: effectivePaymentMethod
          });
       }
       onAdd(newTransactions);
    } else {
       let tDate = new Date(date);
       if (workDaysOnly) tDate = adjustToNextBusinessDay(tDate);
       onAdd([{
         description,
         amount: numAmount,
         date: tDate.toISOString(),
         type,
         category,
         status: 'pending',
         cardId: useCard ? selectedCardId : undefined,
         paymentMethod: effectivePaymentMethod
       }]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-xl font-bold text-slate-800 dark:text-white">Nova Transação</h2>
           <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-end mb-2">
             <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5">
               <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${type === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-400'}`}>Despesa</button>
               <button type="button" onClick={() => { setType(TransactionType.INCOME); setUseCard(false); }} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${type === TransactionType.INCOME ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-400'}`}>Receita</button>
             </div>
          </div>
          {type === TransactionType.EXPENSE && (
             <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 p-3 rounded-lg mb-2">
                <div className="flex justify-between items-center mb-1">
                   <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><CreditCardIcon className="w-4 h-4 text-indigo-500" />Compra no cartão?</span>
                   <button type="button" onClick={() => setUseCard(!useCard)} className={`w-10 h-6 rounded-full transition-colors relative ${useCard ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${useCard ? 'left-5' : 'left-1'}`} /></button>
                </div>
                {useCard && (
                   <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                      <select value={selectedCardId} onChange={(e) => setSelectedCardId(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-500/30 rounded-lg p-2 text-sm text-slate-800 dark:text-white outline-none focus:border-indigo-500">
                         <option value="">Selecione um cartão...</option>
                         {cards.map(c => <option key={c.id} value={c.id}>{c.name} - Final {c.dueDay}</option>)}
                      </select>
                   </div>
                )}
                {!useCard && (
                   <div className="mt-3 animate-in fade-in">
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Meio de Pagamento</label>
                      <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-800 dark:text-white outline-none focus:border-indigo-500">
                         <option value="pix">Pix</option>
                         <option value="boleto">Boleto</option>
                         <option value="cash">Dinheiro</option>
                         <option value="other">Outro / Débito</option>
                      </select>
                   </div>
                )}
             </div>
          )}
          <div>
             <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">Frequência</label>
             <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1 mb-3">
               <button type="button" onClick={() => setRecurrence('single')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${recurrence === 'single' ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Única</button>
               <button type="button" onClick={() => setRecurrence('fixed')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${recurrence === 'fixed' ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Recorrente</button>
               <button type="button" onClick={() => setRecurrence('installments')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${recurrence === 'installments' ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Parcelado</button>
             </div>
          </div>
          {recurrence === 'installments' && (
             <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-lg p-3 mb-4">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Número de parcelas</label>
                <input type="number" min="2" max="60" value={recurrenceCount} onChange={e => setRecurrenceCount(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-orange-500" />
                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1 mt-3">
                  <button type="button" onClick={() => setInstallmentMode('total')} className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${installmentMode === 'total' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Valor Total</button>
                  <button type="button" onClick={() => setInstallmentMode('monthly')} className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${installmentMode === 'monthly' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Valor da Parcela</button>
                </div>
             </div>
          )}
          {recurrence !== 'single' && (
             <div className="mt-3 mb-4">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">Agendar em dia útil específico?</label>
                <select value={nthDay} onChange={e => setNthDay(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-800 dark:text-white outline-none focus:border-orange-500 transition-colors cursor-pointer">
                   <option value="">Não, manter data original</option>
                   {[...Array(20)].map((_, i) => <option key={i} value={i + 1}>{i + 1}º Dia Útil</option>)}
                </select>
                <p className="text-[10px] text-slate-400 mt-1 ml-1">O sistema calculará automaticamente a data para cada mês.</p>
             </div>
          )}
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/30">
             <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Ajustar para dia útil (Sáb/Dom)?</span>
             <button type="button" onClick={() => setWorkDaysOnly(!workDaysOnly)} className={`w-8 h-5 rounded-full transition-colors relative ${workDaysOnly ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'}`}><div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${workDaysOnly ? 'left-4' : 'left-1'}`} /></button>
          </div>
          <div>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-slate-800 dark:text-white focus:border-orange-500 outline-none placeholder-slate-400" placeholder="Descrição (ex: Mercado, Salário)" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div><input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-slate-800 dark:text-white focus:border-orange-500 outline-none placeholder-slate-400" placeholder="Valor (R$)" /></div>
             <div className="relative"><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-slate-800 dark:text-white focus:border-orange-500 outline-none" /></div>
          </div>
          <div>
             <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-slate-800 dark:text-white focus:border-orange-500 outline-none appearance-none cursor-pointer">
               <option>Selecione uma categoria</option>
               {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
             </select>
          </div>
          <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all mt-4">Adicionar</button>
        </form>
      </div>
    </div>
  );
};

const ManageIncomeModal = ({ onClose, onAdd }: { onClose: () => void, onAdd: (t: Omit<Transaction, 'id'>[]) => void }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Serviços');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    onAdd([{ description, amount: parseFloat(amount.replace(',', '.')), date: new Date(date).toISOString(), type: TransactionType.INCOME, category, status: 'paid' }]);
  };
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
       <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Nova Receita</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
             <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Descrição" className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white" autoFocus />
             <input type="number" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Valor" className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white" />
             <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white" />
             <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold">Adicionar Receita</button>
             <button type="button" onClick={onClose} className="w-full py-3 bg-transparent text-slate-500">Cancelar</button>
          </form>
       </div>
    </div>
  )
}

const CardFormModal = ({ onClose, onSave, initialData }: { onClose: () => void, onSave: (data: Omit<CreditCard, 'id'>) => void, initialData?: CreditCard | null }) => {
   const [name, setName] = useState(initialData?.name || '');
   const [holderName, setHolderName] = useState(initialData?.holderName || '');
   const [limitTotal, setLimitTotal] = useState(initialData?.limitTotal?.toString() || '');
   const [closingDay, setClosingDay] = useState(initialData?.closingDay?.toString() || '1');
   const [dueDay, setDueDay] = useState(initialData?.dueDay?.toString() || '10');
   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({ name, holderName, limitTotal: parseFloat(limitTotal), closingDay: parseInt(closingDay), dueDay: parseInt(dueDay), color: initialData?.color || '#6366f1' });
   };
   return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
         <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">{initialData ? 'Editar Cartão' : 'Novo Cartão'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
               <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome do Cartão (ex: Nubank)" className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white" />
               <input value={holderName} onChange={e=>setHolderName(e.target.value)} placeholder="Nome do Titular" className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white" />
               <input type="number" value={limitTotal} onChange={e=>setLimitTotal(e.target.value)} placeholder="Limite Total" className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white" />
               <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-slate-500">Dia Fechamento</label><input type="number" min="1" max="31" value={closingDay} onChange={e=>setClosingDay(e.target.value)} className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white" /></div>
                  <div><label className="text-xs text-slate-500">Dia Vencimento</label><input type="number" min="1" max="31" value={dueDay} onChange={e=>setDueDay(e.target.value)} className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white" /></div>
               </div>
               <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold">Salvar Cartão</button>
               <button type="button" onClick={onClose} className="w-full py-3 text-slate-500">Cancelar</button>
            </form>
         </div>
      </div>
   )
}

const CardDetailsModal = ({ card, transactions, onClose }: { card: CreditCard, transactions: Transaction[], onClose: () => void }) => {
   const cardTransactions = transactions.filter(t => t.cardId === card.id && t.type === TransactionType.EXPENSE).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
   const totalUsed = cardTransactions.reduce((acc, t) => t.status !== 'paid' ? acc + t.amount : acc, 0);
   return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
         <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-slate-800 dark:text-white">Fatura: {card.name}</h2><button onClick={onClose} className="text-slate-500"><XIcon className="w-6 h-6" /></button></div>
            <div className="mb-6 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700"><p className="text-sm text-slate-500">Total em Aberto</p><p className="text-3xl font-bold text-slate-800 dark:text-white">{formatCurrency(totalUsed)}</p><p className="text-xs text-slate-400 mt-1">Limite Disponível: {formatCurrency(card.limitTotal - totalUsed)}</p></div>
            <div className="flex-1 overflow-y-auto"><TransactionList transactions={cardTransactions} /></div>
         </div>
      </div>
   );
};

const RemindersListModal = ({ reminders, onClose }: { reminders: VaultItem[], onClose: () => void }) => {
   return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
         <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold text-slate-800 dark:text-white">Lembretes Ativos</h2><button onClick={onClose}><XIcon className="w-5 h-5 text-slate-500" /></button></div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
               {reminders.length === 0 ? <p className="text-slate-500 text-sm">Nenhum lembrete.</p> : reminders.map(r => (
                  <div key={r.id} className="p-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-500/20 rounded-lg">
                     <p className="font-bold text-slate-800 dark:text-white">{r.title}</p>
                     <p className="text-xs text-sky-600 dark:text-sky-400">{formatDate(r.reminderDate!)}</p>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
};

const DayDetailsModal = ({ date, transactions, reminders, onClose, onTransactionClick }: any) => {
   return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
         <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold text-slate-800 dark:text-white">{formatDate(date)}</h2><button onClick={onClose}><XIcon className="w-5 h-5 text-slate-500" /></button></div>
            {reminders.length > 0 && (<div className="mb-4"><h3 className="text-xs font-bold text-sky-500 uppercase mb-2">Lembretes</h3>{reminders.map((r: any) => (<div key={r.id} className="p-2 mb-2 bg-sky-50 dark:bg-sky-900/20 rounded border border-sky-100 dark:border-sky-700 text-sm dark:text-white">{r.title}</div>))}</div>)}
            <div><h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Transações</h3><TransactionList transactions={transactions} onTransactionClick={onTransactionClick} /></div>
         </div>
      </div>
   );
};

const CardActionModal = ({ card, onClose, onArchive, onDelete }: any) => {
   const [showConfirm, setShowConfirm] = useState(false);
   return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
         <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl transition-all">
            {showConfirm ? (
               <div className="text-center animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><TrashIcon className="w-8 h-8 text-rose-500" /></div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Excluir Cartão?</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Você está prestes a excluir <strong>{card.name}</strong>. Todas as faturas e configurações deste cartão serão perdidas.</p>
                  <div className="flex gap-3"><button onClick={() => setShowConfirm(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancelar</button><button onClick={() => { onDelete(); onClose(); }} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 transition-colors">Sim, Excluir</button></div>
               </div>
            ) : (
               <>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Gerenciar Cartão</h2>
                  <p className="text-sm text-slate-500 mb-6">{card.name} - {card.holderName}</p>
                  <button onClick={() => { onArchive(); onClose(); }} className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl mb-3 font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"><ArchiveIcon className="w-4 h-4" /> Arquivar (Ocultar)</button>
                  <button onClick={() => setShowConfirm(true)} className="w-full py-3 bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-200 dark:hover:bg-rose-900/40 transition-colors"><TrashIcon className="w-4 h-4" /> Excluir Permanentemente</button>
                  <button onClick={onClose} className="w-full py-3 mt-2 text-slate-400 hover:text-slate-600 text-sm">Cancelar</button>
               </>
            )}
         </div>
      </div>
   );
};

const ArchivedCardsListModal = ({ cards, onClose, onUnarchive, onDelete }: any) => {
   return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
         <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold text-slate-800 dark:text-white">Cartões Arquivados</h2><button onClick={onClose}><XIcon className="w-5 h-5 text-slate-500" /></button></div>
            <div className="space-y-3">
               {cards.length === 0 ? <p className="text-slate-500 text-sm">Nenhum cartão arquivado.</p> : cards.map((c: any) => (
                  <div key={c.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"><span className="font-bold text-slate-700 dark:text-white">{c.name}</span><div className="flex gap-2"><button onClick={() => onUnarchive(c.id)} className="text-indigo-500 text-xs font-bold px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded">Restaurar</button><button onClick={() => onDelete(c.id)} className="text-rose-500 text-xs font-bold px-2 py-1 bg-rose-50 dark:bg-rose-900/20 rounded">X</button></div></div>
               ))}
            </div>
         </div>
      </div>
   );
};

// --- APP COMPONENT ---

export default function App() {
  // --- AUTH STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false); 
  const [userName, setUserName] = useState('Investidor');
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  // --- LANGUAGE STATE ---
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('app_lang') as Language) || 'pt';
  });

  useEffect(() => {
    localStorage.setItem('app_lang', language);
  }, [language]);

  const t = (key: string) => {
    // @ts-ignore
    return TRANSLATIONS[language][key] || key;
  };

  // --- CHART DATE STATE ---
  const [chartStartDate, setChartStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); 
    return d.toISOString().split('T')[0];
  });
  
  const [chartEndDate, setChartEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(0); 
    return d.toISOString().split('T')[0];
  });

  // --- CATEGORIES STATE ---
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('finpro_categories');
    const decrypted = decryptData(saved);
    return Array.isArray(decrypted) ? decrypted : DEFAULT_CATEGORIES;
  });

  useEffect(() => {
     localStorage.setItem('finpro_categories', encryptData(categories));
  }, [categories]);

  const handleAddCategory = (cat: string) => {
     const formatted = cat.charAt(0).toUpperCase() + cat.slice(1);
     if(!categories.includes(formatted)) {
        setCategories(prev => [...prev, formatted]);
        addNotification('success', 'Categoria Adicionada', `"${formatted}" já pode ser usada.`);
     } else {
        alert("Esta categoria já existe.");
     }
  };

  useEffect(() => {
     const initSession = () => {
       const session = localStorage.getItem('finpro_session');
       if (session === 'true') {
          const user = decryptData(localStorage.getItem('finpro_user'));
          if (user) {
             setUserName(user.name);
             setIsAuthenticated(true);
             setIsAppLocked(true); 
          }
       }
       setIsSessionLoading(false);
     };
     
     initSession();
  }, []);

  const handleLogin = (name: string, email: string) => {
     localStorage.setItem('finpro_session', 'true');
     setUserName(name);
     setIsAuthenticated(true);
  };

  const handleLogout = () => {
     localStorage.removeItem('finpro_session');
     setIsAuthenticated(false);
     setIsAppLocked(false);
  };

  // PERSISTENCE LOGIC
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem('finpro_transactions');
    const decrypted = decryptData(savedTransactions);
    return decrypted || INITIAL_TRANSACTIONS;
  });

  useEffect(() => {
    localStorage.setItem('finpro_transactions', encryptData(transactions));
  }, [transactions]);

  // --- GOALS STATE ---
  const [goals, setGoals] = useState<Goal[]>(() => {
    const savedGoals = localStorage.getItem('finpro_goals');
    const decrypted = decryptData(savedGoals);
    return Array.isArray(decrypted) ? decrypted : [];
  });

  useEffect(() => {
    localStorage.setItem('finpro_goals', encryptData(goals));
  }, [goals]);

  // --- GOAL ACTIONS ---
  const handleAddGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'currentAmount'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Math.random().toString(36).substr(2, 9),
      currentAmount: 0,
      createdAt: new Date().toISOString()
    };
    setGoals(prev => [...prev, newGoal]);
    addNotification('success', 'Meta Criada', 'Comece a economizar!');
  };

  const handleDeleteGoal = (goalId: string, returnFunds: boolean) => {
    const goal = goals.find(g => g.id === goalId);
    if (returnFunds && goal && goal.currentAmount > 0) {
        const refundTransaction: Transaction = {
            id: Math.random().toString(36).substr(2, 9),
            description: `Devolução: ${goal.title}`,
            amount: goal.currentAmount,
            date: new Date().toISOString(),
            type: TransactionType.INCOME,
            category: 'Outros', 
            status: 'paid',
            paymentMethod: 'other'
        };
        setTransactions(prev => [refundTransaction, ...prev]);
        addNotification('success', 'Dinheiro Devolvido', 'O saldo da meta voltou para o caixa.');
    }
    setGoals(prev => prev.filter(g => g.id !== goalId));
    addNotification('success', 'Meta Excluída', 'O registro foi removido.');
  };

  const handleEditGoal = (updatedGoal: Goal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    addNotification('success', 'Meta Atualizada', 'As alterações foram salvas.');
  };

  const handleDepositToGoal = (goalId: string, amount: number) => {
    const targetGoal = goals.find(g => g.id === goalId);
    if (!targetGoal) return;
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g));
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      description: `Depósito Meta: ${targetGoal.title}`,
      amount: amount,
      date: new Date().toISOString(),
      type: TransactionType.EXPENSE,
      category: 'Investimentos',
      status: 'paid',
      paymentMethod: 'other'
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleWithdrawFromGoal = (goalId: string, amount: number) => {
    const targetGoal = goals.find(g => g.id === goalId);
    if (!targetGoal) return;
    if (amount > targetGoal.currentAmount) {
        alert("Saldo insuficiente na meta.");
        return;
    }
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, currentAmount: g.currentAmount - amount } : g));
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      description: `Resgate Meta: ${targetGoal.title}`,
      amount: amount,
      date: new Date().toISOString(),
      type: TransactionType.INCOME,
      category: 'Investimentos', 
      status: 'paid',
      paymentMethod: 'other'
    };
    setTransactions(prev => [newTransaction, ...prev]);
    addNotification('success', 'Resgate Realizado', 'O valor voltou para seu saldo disponível.');
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'debts' | 'charts' | 'calendar' | 'vault' | 'more' | 'cards' | 'goals'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false); 
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false); 
  const [isArchivedListOpen, setIsArchivedListOpen] = useState(false); 
  
  // Card Modals State
  const [isCardModalOpen, setIsCardModalOpen] = useState(false); 
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [cardToManage, setCardToManage] = useState<CreditCard | null>(null);

  // CHANGED: Initialize cards as empty array for production
  const [cards, setCards] = useState<CreditCard[]>(() => {
    const saved = localStorage.getItem('finpro_cards');
    const decrypted = decryptData(saved);
    return decrypted || [];
  });

  useEffect(() => {
    localStorage.setItem('finpro_cards', encryptData(cards));
  }, [cards]);

  const handleSaveCard = (cardData: Omit<CreditCard, 'id'>) => {
    if (editingCard) {
      setCards(prev => prev.map(c => c.id === editingCard.id ? { ...cardData, id: editingCard.id } : c));
      setEditingCard(null);
    } else {
      const newCard = { ...cardData, id: Math.random().toString(36).substr(2, 9) };
      setCards(prev => [...prev, newCard]);
    }
    setIsCardModalOpen(false);
  };

  const handleEditCardClick = (card: CreditCard) => {
    setEditingCard(card);
    setIsCardModalOpen(true);
  };

  const handleArchiveCard = () => {
    if (!cardToManage) return;
    setCards(prev => prev.map(c => c.id === cardToManage.id ? { ...c, isArchived: true } : c));
    setCardToManage(null);
    addNotification('success', 'Cartão Arquivado', 'O cartão foi ocultado do painel.');
  };

  const handleUnarchiveCard = (cardId: string) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isArchived: false } : c));
    addNotification('success', 'Cartão Restaurado', 'O cartão voltou para o painel principal.');
  };

  const handleConfirmDeleteCard = () => {
    if (!cardToManage) return;
    setCards(prev => prev.filter(c => c.id !== cardToManage.id));
    setCardToManage(null);
    addNotification('success', 'Cartão Excluído', 'O cartão foi removido permanentemente.');
  };

  const handleDeleteArchivedCard = (id: string) => {
    if(window.confirm('Tem certeza que deseja excluir este cartão permanentemente?')) {
        setCards(prev => prev.filter(c => c.id !== id));
        addNotification('success', 'Cartão Excluído', 'Removido dos arquivados.');
    }
  };

  const [currentTheme, setCurrentTheme] = useState<ThemeKey>(() => {
    return (localStorage.getItem('finpro_theme') as ThemeKey) || 'purple';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('finpro_mode');
    return saved ? saved === 'dark' : true; 
  });

  const [showIncome, setShowIncome] = useState(() => {
    const saved = localStorage.getItem('finpro_show_income');
    const decrypted = decryptData(saved);
    return decrypted !== null ? decrypted : true;
  });

  useEffect(() => {
    localStorage.setItem('finpro_show_income', encryptData(showIncome));
  }, [showIncome]);

  useEffect(() => {
    const root = document.documentElement;
    const themeColors = THEMES[currentTheme].colors;
    
    root.style.setProperty('--color-accent-300', themeColors[300]);
    root.style.setProperty('--color-accent-400', themeColors[400]);
    root.style.setProperty('--color-accent-500', themeColors[500]);
    root.style.setProperty('--color-accent-600', themeColors[600]);
    root.style.setProperty('--color-accent-900', themeColors[900]);

    localStorage.setItem('finpro_theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('finpro_mode', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('finpro_mode', 'light');
    }
  }, [isDarkMode]);

  const [forecastChartData, setForecastChartData] = useState<any[]>([]);

  const [vaultItems, setVaultItems] = useState<VaultItem[]>(() => {
    const saved = localStorage.getItem('finpro_vault');
    const decrypted = decryptData(saved);
    return Array.isArray(decrypted) ? decrypted : [];
  });
  
  const activeReminders = useMemo(() => {
    return vaultItems.filter(i => i.type === 'reminder');
  }, [vaultItems]);
  
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = (type: NotificationType, title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    const checkReminders = () => {
      const today = new Date();
      today.setHours(0,0,0,0);

      vaultItems.forEach(item => {
        if (item.type === 'reminder' && item.reminderDate) {
          const [y, m, d] = item.reminderDate.split('-').map(Number);
          const reminderDate = new Date(y, m - 1, d); 
          const diffTime = reminderDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

          if (diffDays < 0) {
             addNotification('error', 'Lembrete Vencido', `${item.title} era para ${formatDate(item.reminderDate)}.`);
          } else if (diffDays === 0) {
             addNotification('warning', 'Lembrete de Hoje', `Não esqueça: ${item.title}`);
          } else if (diffDays <= 3) {
             addNotification('info', 'Lembrete Próximo', `${item.title} é em ${diffDays} dia(s).`);
          }
        }
      });
    };
    const timer = setTimeout(checkReminders, 1500);
    return () => clearTimeout(timer);
  }, []); 

  useEffect(() => {
    if (activeTab !== 'vault') {
      setIsVaultUnlocked(false);
    }
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('finpro_vault', encryptData(vaultItems));
  }, [vaultItems]);

  const handleAddVaultItem = (item: Omit<VaultItem, 'id' | 'createdAt'>) => {
    const newItem: VaultItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setVaultItems(prev => [newItem, ...prev]);
    if (item.type === 'reminder') {
       addNotification('success', 'Lembrete Criado', `Agendado para ${formatDate(item.reminderDate!)}`);
    }
  };

  const handleDeleteVaultItem = (id: string) => {
    setVaultItems(prev => prev.filter(i => i.id !== id));
  };

  const [selectedDayData, setSelectedDayData] = useState<{date: string, list: Transaction[], reminders: VaultItem[]} | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEditingName, setIsEditingName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    const backupData = {
      transactions: transactions,
      vaultItems: vaultItems,
      cards: cards,
      categories: categories, 
      goals: goals, 
      settings: {
        theme: currentTheme,
        mode: isDarkMode ? 'dark' : 'light',
        user: userName,
        showIncome: showIncome
      },
      backupDate: new Date().toISOString(),
      appVersion: "1.4.0"
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `backup_contas_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);

        if (!parsedData.transactions || !Array.isArray(parsedData.transactions)) {
          alert('Erro: Arquivo de backup inválido. Chave "transactions" não encontrada.');
          return;
        }

        if (window.confirm(`Tem certeza que deseja restaurar este backup de ${formatDate(parsedData.backupDate)}? \n\nISSO SUBSTITUIRÁ TODOS OS DADOS ATUAIS.`)) {
           localStorage.setItem('finpro_transactions', encryptData(parsedData.transactions));
           if (parsedData.vaultItems) localStorage.setItem('finpro_vault', encryptData(parsedData.vaultItems));
           if (parsedData.cards) localStorage.setItem('finpro_cards', encryptData(parsedData.cards));
           if (parsedData.categories) localStorage.setItem('finpro_categories', encryptData(parsedData.categories));
           if (parsedData.goals) localStorage.setItem('finpro_goals', encryptData(parsedData.goals));
           if (parsedData.settings) {
             localStorage.setItem('finpro_theme', parsedData.settings.theme || 'purple');
             localStorage.setItem('finpro_mode', parsedData.settings.mode || 'dark');
             const user = decryptData(localStorage.getItem('finpro_user')) || { name: parsedData.settings.user || 'Investidor' };
             user.name = parsedData.settings.user || 'Investidor';
             localStorage.setItem('finpro_user', encryptData(user));
             localStorage.setItem('finpro_username', encryptData(user.name)); 
             localStorage.setItem('finpro_show_income', encryptData(parsedData.settings.showIncome ?? true));
           }
           window.location.reload();
        }
      } catch (err) {
        console.error(err);
        alert('Erro ao ler o arquivo. Verifique se é um JSON válido.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // NEW: Factory Reset Handler
  const handleFactoryReset = () => {
     if (confirm("Tem certeza? Isso apagará TODOS os dados do navegador (transações, senhas, metas) e reiniciará o app como novo.\n\nEsta ação não pode ser desfeita.")) {
        localStorage.clear();
        window.location.reload();
     }
  };

  const visibleTransactions = useMemo(() => {
    if (showIncome) return transactions;
    return transactions.filter(t => t.type !== TransactionType.INCOME);
  }, [transactions, showIncome]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    setTransactions(prev => {
      let hasChanges = false;
      const updated = prev.map(t => {
        if (t.status === 'pending') {
          const tDate = new Date(t.date);
          if (tDate < today) {
             hasChanges = true;
             return { ...t, status: 'overdue' as TransactionStatus };
          }
        }
        return t;
      });
      return hasChanges ? updated : prev;
    });
  }, []);

  const handleNameSave = () => {
    setIsEditingName(false);
    if (userName.trim() === '') {
      setUserName('Investidor');
      const user = decryptData(localStorage.getItem('finpro_user')) || { name: 'Investidor' };
      user.name = 'Investidor';
      localStorage.setItem('finpro_user', encryptData(user));
      localStorage.setItem('finpro_username', encryptData('Investidor'));
    } else {
      const user = decryptData(localStorage.getItem('finpro_user')) || { name: userName };
      user.name = userName;
      localStorage.setItem('finpro_user', encryptData(user));
      localStorage.setItem('finpro_username', encryptData(userName));
    }
  };

  const handleUpdateUserName = (newName: string) => {
    setUserName(newName);
    const user = decryptData(localStorage.getItem('finpro_user')) || { name: newName };
    user.name = newName;
    localStorage.setItem('finpro_user', encryptData(user));
    localStorage.setItem('finpro_username', encryptData(newName));
  };

  const currentMonthTransactions = useMemo(() => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return visibleTransactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [visibleTransactions, currentDate]);

  const summary = useMemo(() => {
    const incomeThisMonth = currentMonthTransactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, curr) => acc + curr.amount, 0);
    const expensePaidThisMonth = currentMonthTransactions.filter(t => t.type === TransactionType.EXPENSE && t.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
    const expensePendingThisMonth = currentMonthTransactions.filter(t => t.type === TransactionType.EXPENSE && (t.status === 'pending' || t.status === 'overdue')).reduce((acc, curr) => acc + curr.amount, 0);
    const overdueThisMonth = currentMonthTransactions.filter(t => t.type === TransactionType.EXPENSE && t.status === 'overdue').reduce((acc, curr) => acc + curr.amount, 0);

    return {
      incomeThisMonth,
      paidThisMonth: expensePaidThisMonth,
      remainingThisMonth: expensePendingThisMonth,
      overdueThisMonth,
      balance: incomeThisMonth - (expensePaidThisMonth + expensePendingThisMonth)
    };
  }, [currentMonthTransactions]);

  const accumulatedSurplus = useMemo(() => {
     const startOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
     const pastTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate < startOfCurrentMonth && t.status === 'paid';
     });
     const pastIncome = pastTransactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0);
     const pastExpenses = pastTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0);
     const balance = pastIncome - pastExpenses;
     return balance > 0 ? balance : 0; 
  }, [transactions, currentDate]);

  const totalBalanceWithAccumulated = summary.balance + accumulatedSurplus;

  const hasFutureRecurrences = useMemo(() => {
    if (!selectedTransaction?.groupId || !selectedTransaction?.isRecurring) return false;
    return transactions.some(t => t.groupId === selectedTransaction.groupId && new Date(t.date) > new Date(selectedTransaction.date));
  }, [selectedTransaction, transactions]);

  const hasPendingInstallments = useMemo(() => {
    if (!selectedTransaction?.groupId || !selectedTransaction?.installmentTotal) return false;
    return transactions.some(t => t.groupId === selectedTransaction.groupId && (t.status === 'pending' || t.status === 'overdue'));
  }, [selectedTransaction, transactions]);

  const handleAddTransactions = (newTransactions: Omit<Transaction, 'id'>[]) => {
    const transactionsToAdd = newTransactions.map(t => ({
      ...t,
      id: Math.random().toString(36).substr(2, 9),
    }));
    const today = new Date();
    today.setHours(0,0,0,0);
    const checkedTransactions = transactionsToAdd.map(t => {
        if(t.status === 'pending' && new Date(t.date) < today) {
            return { ...t, status: 'overdue' as TransactionStatus };
        }
        return t;
    });
    setTransactions(prev => [...checkedTransactions, ...prev]);
    setIsModalOpen(false);
    setIsIncomeModalOpen(false);
  };

  const handleUpdateStatus = (id: string, status: TransactionStatus) => {
    const paidAt = status === 'paid' ? new Date().toISOString() : undefined;
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status, paidAt } : t));
    setSelectedTransaction(prev => prev ? { ...prev, status, paidAt } : null);
    addNotification('success', status === 'paid' ? 'Marcado como Pago' : 'Atualizado', 'O status da transação foi alterado.');
  };

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    setSelectedTransaction(updatedTransaction);
    addNotification('success', 'Atualizado', 'As informações foram salvas.');
  };

  const handleStopRecurrence = (transaction: Transaction) => {
    if (!transaction.groupId) return;
    const currentTransTimestamp = new Date(transaction.date).getTime();
    setTransactions(prev => prev.filter(t => {
      if (t.groupId !== transaction.groupId) return true;
      const tTimestamp = new Date(t.date).getTime();
      return tTimestamp <= currentTransTimestamp;
    }));
    setSelectedTransaction(null);
    addNotification('success', 'Recorrência Parada', 'Lançamentos futuros foram removidos.');
  };

  const handleDeleteTransaction = (t: Transaction) => {
    setTransactions(prev => prev.filter(item => item.id !== t.id));
    setSelectedTransaction(null);
    addNotification('success', 'Transação Excluída', 'O registro foi removido do histórico.');
  };

  const handleAnticipateInstallments = (transaction: Transaction) => {
    if (!transaction.groupId) return;
    const paidAt = new Date().toISOString();
    setTransactions(prev => prev.map(t => {
      if (t.groupId === transaction.groupId && (t.status === 'pending' || t.status === 'overdue')) {
        return { ...t, status: 'paid', paidAt };
      }
      return t;
    }));
    setSelectedTransaction(prev => prev ? { ...prev, status: 'paid', paidAt } : null);
    addNotification('success', 'Antecipado', 'Parcelas restantes foram marcadas como pagas.');
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + offset);
      return newDate;
    });
  };

  const handleDayClick = (dateStr: string, transactionsList: Transaction[], remindersList: VaultItem[]) => {
    if (transactionsList.length > 0 || remindersList.length > 0) {
        setSelectedDayData({ date: dateStr, list: transactionsList, reminders: remindersList });
    }
  };

  const formattedMonth = new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' }).format(currentDate);
  const monthName = formattedMonth.split(' ')[0]; 
  const yearNum = formattedMonth.split(' ')[2] || currentDate.getFullYear(); 

  if (isSessionLoading) {
     return (
       <div className="min-h-screen bg-[#121214] flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Carregando FinPro...</p>
       </div>
     );
  }

  if (!isAuthenticated) return <AuthScreen onLogin={handleLogin} />;
  if (isAppLocked) return <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4 font-sans"><div className="w-full max-w-md"><VaultPinScreen onUnlock={() => setIsAppLocked(false)} /></div></div>;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      <Sidebar 
         activeTab={activeTab as any} 
         setActiveTab={setActiveTab as any} 
         onOpenSettings={() => setIsSettingsOpen(true)}
         userName={userName}
         onUpdateUser={handleUpdateUserName}
         onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative pb-40 md:pb-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {activeTab === 'dashboard' && t('header_dashboard')}
              {activeTab === 'charts' && t('header_charts')}
              {activeTab === 'transactions' && t('header_transactions')}
              {activeTab === 'debts' && t('header_debts')}
              {activeTab === 'calendar' && t('header_calendar')}
              {activeTab === 'vault' && t('header_vault')}
              {activeTab === 'cards' && t('header_cards')}
              {activeTab === 'goals' && t('header_goals')}
              {activeTab === 'more' && t('header_more')}
            </h1>
            <div className="flex items-center gap-2 mt-1">
               <p className="text-slate-500 dark:text-slate-400 text-sm">Olá, {userName}</p>
               {isEditingName ? (
                 <input autoFocus type="text" value={userName} onChange={(e) => setUserName(e.target.value)} onBlur={handleNameSave} onKeyDown={(e) => e.key === 'Enter' && handleNameSave()} className="bg-transparent border-b border-indigo-500 text-indigo-600 dark:text-indigo-400 text-sm font-medium focus:outline-none w-auto min-w-[80px]" />
               ) : (
                 <button onClick={() => setIsEditingName(true)} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-500 flex items-center gap-2 transition-colors group relative">
                   <EditIcon className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </button>
               )}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsSettingsOpen(true)} className="md:hidden bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700"><SettingsIcon className="w-5 h-5" /></button>
            <button onClick={() => setIsRemindersModalOpen(true)} className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 relative"><BellIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />{activeReminders.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">{activeReminders.length}</span>}</button>
            {activeTab !== 'vault' && activeTab !== 'more' && activeTab !== 'cards' && activeTab !== 'goals' && (
              <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg"><PlusIcon className="w-5 h-5" /><span className="hidden md:inline">{t('btn_new_transaction')}</span></button>
            )}
          </div>
        </header>

        <NotificationToast notifications={notifications} onClose={removeNotification} />

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
             {showIncome ? (
               <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <DashboardCard title={`Receitas em ${monthName}`} amount={summary.incomeThisMonth} icon={<WalletIcon className="w-6 h-6 text-indigo-400" />} trend="Entradas" type="neutral" />
                  <DashboardCard title={`Despesas em ${monthName}`} amount={summary.paidThisMonth + summary.remainingThisMonth} icon={<ClockIcon className="w-6 h-6 text-rose-400" />} trend="Saídas Totais" type="negative" />
                  <div className="col-span-2 lg:col-span-1">
                    <DashboardCard title={`Saldo Previsto`} amount={summary.balance} icon={<CheckCircleIcon className="w-6 h-6 text-emerald-400" />} trend="Receita - Despesa" type={summary.balance >= 0 ? "positive" : "negative"} footer={accumulatedSurplus > 0 ? (<div className="flex flex-col gap-1"><p className="text-[10px] text-slate-500 dark:text-slate-400">Receita acumulada: <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(accumulatedSurplus)}</span></p><p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Total: {formatCurrency(totalBalanceWithAccumulated)}</p></div>) : null} />
                  </div>
               </div>
             ) : (
                <div className="grid grid-cols-2 gap-3 md:gap-6">
                   <DashboardCard title={`Pago em ${monthName}`} amount={summary.paidThisMonth} icon={<CheckCircleIcon className="w-6 h-6 text-emerald-400" />} trend="Quitadas" type="positive" />
                   <DashboardCard title={`Falta em ${monthName}`} amount={summary.remainingThisMonth + summary.overdueThisMonth} icon={<ClockIcon className="w-6 h-6 text-amber-400" />} trend="A Vencer" type="negative" />
                </div>
             )}
             
             <div className="h-full">
               <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-slate-200 dark:border-slate-700/50">
                 <div className="flex items-center justify-center gap-6 md:gap-10 mb-8 pb-6 border-b border-slate-200 dark:border-slate-700/30 pt-2">
                     <button onClick={() => changeMonth(-1)} className="p-3 text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-white dark:hover:bg-indigo-600/20 rounded-full transition-all" aria-label="Mês anterior"><ChevronLeftIcon className="w-6 h-6 md:w-8 md:h-8" /></button>
                     <div className="text-center min-w-[140px]"><h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white capitalize tracking-tight">{monthName}</h2><p className="text-sm text-slate-500 font-medium mt-1">{yearNum}</p></div>
                     <button onClick={() => changeMonth(1)} className="p-3 text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-white dark:hover:bg-indigo-600/20 rounded-full transition-all" aria-label="Próximo mês"><ChevronRightIcon className="w-6 h-6 md:w-8 md:h-8" /></button>
                 </div>
                 <div className="flex justify-between items-center mb-4 px-2"><h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transações de {monthName}</h3></div>
                 <TransactionList transactions={currentMonthTransactions} showCategory={false} onTransactionClick={setSelectedTransaction} cards={cards} />
                 <button onClick={() => generateMonthlyReport(visibleTransactions, currentDate.getMonth(), currentDate.getFullYear(), userName)} className="w-full mt-6 py-3 rounded-xl border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-medium flex items-center justify-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"><PrinterIcon className="w-5 h-5" /> Baixar Extrato de <span className="capitalize">{monthName}</span></button>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="space-y-6">
            <ForecastWidget transactions={visibleTransactions} onProjectionUpdate={setForecastChartData} startDate={chartStartDate} endDate={chartEndDate} onRangeChange={(start, end) => { setChartStartDate(start); setChartEndDate(end); }} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 h-[400px] flex flex-col"><FinancialChart transactions={visibleTransactions} customData={forecastChartData.length > 0 ? forecastChartData : undefined} title="Fluxo" /></div>
              <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 h-[400px] flex flex-col"><CategoryChart transactions={visibleTransactions} startDate={chartStartDate} endDate={chartEndDate} /></div>
            </div>
          </div>
        )}
        
        {activeTab === 'transactions' && <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50"><TransactionList transactions={visibleTransactions} onTransactionClick={setSelectedTransaction} cards={cards} /></div>}
        {activeTab === 'vault' && (isVaultUnlocked ? <VaultView items={vaultItems} onAdd={handleAddVaultItem} onDelete={handleDeleteVaultItem} /> : <VaultPinScreen onUnlock={() => setIsVaultUnlocked(true)} />)}
        {activeTab === 'calendar' && <div className="h-[calc(100vh-160px)] md:h-[calc(100vh-140px)]"><CalendarView transactions={visibleTransactions} vaultItems={vaultItems} onDayClick={handleDayClick} /></div>}
        {activeTab === 'debts' && <div className="max-w-4xl mx-auto"><DebtsView transactions={transactions} onTransactionClick={setSelectedTransaction} onAddDebt={() => setIsModalOpen(true)} /></div>}
        {activeTab === 'goals' && (
           <GoalsView goals={goals} onAddGoal={handleAddGoal} onDeposit={handleDepositToGoal} onWithdraw={handleWithdrawFromGoal} onEditGoal={handleEditGoal} onDeleteGoal={handleDeleteGoal} />
        )}
        
        {activeTab === 'cards' && (
           <div className="space-y-6">
              <div className="flex gap-3 mb-6">
                 <button onClick={() => setIsModalOpen(true)} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-rose-500/20"><CreditCardIcon className="w-4 h-4" /> Despesa Cartão</button>
                 <button onClick={() => { setEditingCard(null); setIsCardModalOpen(true); }} className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm"><PlusIcon className="w-4 h-4" /> Novo Cartão</button>
                 <button onClick={() => setIsArchivedListOpen(true)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors flex items-center justify-center" title="Cartões Arquivados"><ArchiveIcon className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6">
                 {cards.filter(c => !c.isArchived).map(card => {
                    const usedAmount = transactions.filter(t => t.type === TransactionType.EXPENSE && t.cardId === card.id && t.status !== 'paid').reduce((acc, t) => acc + t.amount, 0);
                    const available = card.limitTotal - usedAmount;
                    const percentage = Math.min(100, (usedAmount / card.limitTotal) * 100);
                    return (
                       <div key={card.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-4"><div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">{card.holderName.substring(0, 2).toUpperCase()}</div><div><p className="text-xs text-slate-500 dark:text-slate-400">{card.holderName}</p><div className="flex items-center gap-2"><CreditCardIcon className="w-4 h-4 text-slate-400" /><h3 className="font-bold text-slate-800 dark:text-white">{card.name}</h3></div></div></div>
                          <div className="mb-4"><div className="flex justify-between text-xs mb-1 text-slate-500 dark:text-slate-400"><span>Limite usado</span><span>{percentage.toFixed(0)}%</span></div><div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div></div></div>
                          <div className="grid grid-cols-3 gap-2 mb-6 text-center"><div><p className="text-[10px] text-slate-500">Limite usado</p><p className="text-sm font-bold text-rose-600 dark:text-rose-400">{formatCurrency(usedAmount)}</p></div><div className="border-x border-slate-100 dark:border-slate-700"><p className="text-[10px] text-slate-500">Disponível</p><p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(available)}</p></div><div><p className="text-[10px] text-slate-500">Total</p><p className="text-sm font-bold text-slate-800 dark:text-white">{formatCurrency(card.limitTotal)}</p></div></div>
                          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg"><div><span className="block opacity-70 mb-0.5">Fechamento</span><strong className="text-slate-700 dark:text-slate-200">Todo dia {card.closingDay}</strong></div><div className="text-right"><span className="block opacity-70 mb-0.5">Vencimento</span><strong className="text-slate-700 dark:text-slate-200">Todo dia {card.dueDay}</strong></div></div>
                          <div className="flex items-center gap-2"><button onClick={() => setSelectedCard(card)} className="flex-1 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Detalhes da fatura -</button><button onClick={() => handleEditCardClick(card)} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-700"><EditIcon className="w-4 h-4" /></button><button onClick={() => setCardToManage(card)} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700"><TrashIcon className="w-4 h-4" /></button></div>
                       </div>
                    );
                 })}
                 <button onClick={() => { setEditingCard(null); setIsCardModalOpen(true); }} className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors min-h-[280px]"><PlusIcon className="w-8 h-8 mb-2" /><span className="font-bold text-sm">Adicionar Cartão</span></button>
              </div>
           </div>
        )}
      </main>

      <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {isModalOpen && activeTab !== 'vault' && activeTab !== 'more' && (
        <AddTransactionModal onClose={() => setIsModalOpen(false)} onAdd={handleAddTransactions} cards={cards.filter(c => !c.isArchived)} categories={categories} />
      )}
      
      {isIncomeModalOpen && <ManageIncomeModal onClose={() => setIsIncomeModalOpen(false)} onAdd={handleAddTransactions} />}
      {isCardModalOpen && <CardFormModal onClose={() => setIsCardModalOpen(false)} onSave={handleSaveCard} initialData={editingCard} />}
      {selectedCard && <CardDetailsModal card={selectedCard} transactions={transactions} onClose={() => setSelectedCard(null)} />}
      {isRemindersModalOpen && <RemindersListModal reminders={activeReminders} onClose={() => setIsRemindersModalOpen(false)} />}
      {selectedTransaction && <TransactionDetailsModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} onUpdateStatus={handleUpdateStatus} onDelete={handleDeleteTransaction} onUpdate={handleUpdateTransaction} onStopRecurrence={handleStopRecurrence} onAnticipate={handleAnticipateInstallments} hasFutureRecurrences={hasFutureRecurrences} hasPendingInstallments={hasPendingInstallments} />}
      {selectedDayData && <DayDetailsModal date={selectedDayData.date} transactions={selectedDayData.list} reminders={selectedDayData.reminders} onClose={() => setSelectedDayData(null)} onTransactionClick={(t) => { setSelectedDayData(null); setSelectedTransaction(t); }} />}
      {cardToManage && <CardActionModal card={cardToManage} onClose={() => setCardToManage(null)} onArchive={handleArchiveCard} onDelete={handleConfirmDeleteCard} />}
      {isArchivedListOpen && <ArchivedCardsListModal cards={cards.filter(c => c.isArchived)} onClose={() => setIsArchivedListOpen(false)} onUnarchive={handleUnarchiveCard} onDelete={handleDeleteArchivedCard} />}

      {isSettingsOpen && (
        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          currentTheme={currentTheme}
          setTheme={setCurrentTheme}
          isDarkMode={isDarkMode}
          setDarkMode={setIsDarkMode}
          showIncome={showIncome}
          setShowIncome={setShowIncome}
          userName={userName}
          setUserName={(n: string) => { setUserName(n); localStorage.setItem('finpro_username', n); }}
          onExport={handleExportBackup}
          onImport={handleImportBackup}
          fileInputRef={fileInputRef}
          onOpenIncomeModal={() => { setIsSettingsOpen(false); setIsIncomeModalOpen(true); }}
          categories={categories}
          onAddCategory={handleAddCategory}
          language={language}
          setLanguage={setLanguage}
          t={t}
          onFactoryReset={handleFactoryReset}
        />
      )}
    </div>
  );
}
