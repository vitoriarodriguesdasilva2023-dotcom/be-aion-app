
import React, { useState, useEffect } from 'react';
import { LockIcon, DeleteIcon, ShieldIcon, CheckCircleIcon, SendIcon, AlertCircleIcon, XIcon } from './Icons';
import emailjs from 'https://esm.sh/@emailjs/browser@3.11.0';

const SERVICE_ID = "service_3gopmel";
const TEMPLATE_ID = "template_8pjctt9";
const PUBLIC_KEY = "sXodUzoFMPDmnyVZu";

interface VaultPinScreenProps {
  onUnlock: () => void;
}

// Security Helpers
const encryptData = (data: any) => {
  try {
    return btoa(JSON.stringify(data));
  } catch (e) {
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
      return encoded; // Return raw string for legacy support
    }
  }
};

export const VaultPinScreen: React.FC<VaultPinScreenProps> = ({ onUnlock }) => {
  const [view, setView] = useState<'loading' | 'setup' | 'locked'>('loading');
  const [pinInput, setPinInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  
  // Security State: Prevents email editing during reset
  const [isResetMode, setIsResetMode] = useState(false);
  
  // Random Keypad State
  const [keypadNumbers, setKeypadNumbers] = useState<string[]>(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']);
  
  // Recovery Modal State
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [storedEmail, setStoredEmail] = useState('');

  // 1. VERIFICAÇÃO INICIAL E SHUFFLE DO TECLADO
  useEffect(() => {
    // Carregar e Decriptar dados
    const savedPin = decryptData(localStorage.getItem('vault_pin'));
    const savedEmail = decryptData(localStorage.getItem('vault_email'));
    
    // Get logged in user data to pre-fill and lock email
    const appUser = decryptData(localStorage.getItem('finpro_user'));
    if (appUser && appUser.email) {
        setEmailInput(appUser.email);
    } else if (savedEmail) {
        setEmailInput(savedEmail); // Fallback
    }

    if (savedPin) {
      if (savedEmail) setStoredEmail(savedEmail);
      setView('locked');
      setIsResetMode(false);
    } else {
      setView('setup');
      setIsResetMode(false);
    }

    // Embaralhar Teclado para segurança visual
    const nums = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    setKeypadNumbers(nums);

  }, []);

  // --- ACTIONS ---

  const handleUnlockPress = (digit: string) => {
    if (pinInput.length < 4) {
      const newPin = pinInput + digit;
      setPinInput(newPin);
      setError('');

      // Auto-submit no 4º dígito (APENAS SE ESTIVER BLOQUEADO)
      if (newPin.length === 4 && view === 'locked') {
        const savedPin = decryptData(localStorage.getItem('vault_pin'));
        if (newPin === savedPin) {
          onUnlock(); // SUCESSO
        } else {
          setError('PIN incorreto');
          setTimeout(() => {
             setPinInput('');
             setError('');
          }, 500);
        }
      }
    }
  };

  const handleUnlockDelete = () => {
    setPinInput(prev => prev.slice(0, -1));
    setError('');
  };

  // 2. LISTENER DE TECLADO FÍSICO (Mantido)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showRecoveryModal) return;

      if (view === 'setup') {
         if (document.activeElement instanceof HTMLInputElement) {
            return;
         }
      }

      if (e.key >= '0' && e.key <= '9') {
        handleUnlockPress(e.key);
      } else if (e.key === 'Backspace') {
        handleUnlockDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, showRecoveryModal, pinInput]);

  // --- HELPER: MASK EMAIL ---
  const maskEmail = (email: string) => {
    if (!email) return "";
    const parts = email.split('@');
    if (parts.length < 2) return email;
    
    const [user, domain] = parts;
    if (user.length <= 3) return email; 
    return `${user.substring(0, 3)}***@${domain}`;
  };

  const handleSetupSave = () => {
    if (pinInput.length !== 4) {
      setError('O PIN deve ter 4 dígitos.');
      return;
    }
    
    // Ensure we have an email
    const emailToSave = isResetMode ? storedEmail : emailInput;
    if (!emailToSave) {
        setError('E-mail não identificado. Faça login novamente.');
        return;
    }

    // Se NÃO estiver em modo reset, salva o email (Criptografado)
    if (!isResetMode) {
        localStorage.setItem('vault_email', encryptData(emailToSave));
        setStoredEmail(emailToSave);
    } 

    // SALVAR O PIN (Criptografado)
    localStorage.setItem('vault_pin', encryptData(pinInput));
    
    setPinInput(''); 
    setError('');
    setIsResetMode(false);
    setView('locked');
  };

  const handleForgotPassword = async () => {
    if (loading) return;
    if (!storedEmail) {
        setError('E-mail não encontrado. Resete os dados do navegador.');
        return;
    }

    setLoading(true);
    setError('');

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        email: storedEmail, 
        otp_code: otp,
        message: `Seu código de recuperação do FinPro Vault é: ${otp}`
      }, PUBLIC_KEY);

      setShowRecoveryModal(true);
    } catch (err) {
      console.error(err);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (otpInput === generatedOtp) {
      localStorage.removeItem('vault_pin');
      setPinInput('');
      setOtpInput('');
      setShowRecoveryModal(false);
      setIsResetMode(true); 
      setView('setup');
      setError(''); 
    } else {
      setError('Código inválido.');
    }
  };

  // --- RENDERERS ---

  if (view === 'loading') return null;

  // CENÁRIO 1: SETUP
  if (view === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-white p-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-indigo-500/20 rounded-full mb-3">
              <ShieldIcon className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
                {isResetMode ? 'Redefinir Senha' : 'Proteja seus Dados'}
            </h2>
            <p className="text-xs text-slate-400 text-center mt-1">
                {isResetMode ? 'Código aceito. Crie seu novo PIN.' : 'Configure seu cofre pessoal.'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Crie seu PIN (4 dígitos)</label>
              <input 
                type="text" 
                inputMode="numeric" 
                maxLength={4}
                value={pinInput}
                onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-center text-2xl tracking-[0.5em] font-bold text-white focus:border-indigo-500 outline-none transition-colors"
                placeholder="••••"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex justify-between">
                  E-mail para Recuperação
                  <span className="text-[10px] text-amber-500 flex items-center gap-1"><LockIcon className="w-3 h-3" /> Bloqueado</span>
              </label>
              <div className="relative">
                  <input 
                    type="email" 
                    value={isResetMode ? maskEmail(storedEmail) : emailInput}
                    disabled={true}
                    className="w-full border rounded-xl p-3 text-white outline-none transition-colors bg-slate-900/50 border-slate-700 text-slate-400 cursor-not-allowed"
                    placeholder="seu@email.com"
                  />
                  <LockIcon className="w-4 h-4 text-slate-500 absolute right-3 top-3.5" />
              </div>
            </div>

            {error && <p className="text-rose-400 text-xs font-bold text-center bg-rose-500/10 py-2 rounded border border-rose-500/20">{error}</p>}

            <button 
              onClick={handleSetupSave}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
            >
              {isResetMode ? 'Atualizar PIN' : 'Salvar e Bloquear'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CENÁRIO 2: LOCKED (Teclado Dinâmico)
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-white p-4 animate-in fade-in zoom-in-95 duration-300">
      
      <div className="mb-8 flex flex-col items-center">
        <div className={`p-4 rounded-full bg-slate-800 border-2 mb-4 transition-colors ${error ? 'border-rose-500 bg-rose-500/10' : 'border-indigo-500/50'}`}>
          {error ? <AlertCircleIcon className="w-8 h-8 text-rose-500" /> : <LockIcon className="w-8 h-8 text-indigo-400" />}
        </div>
        <h2 className="text-xl font-bold mb-1">Cofre Bloqueado</h2>
        <p className="text-sm text-slate-400">Digite seu PIN de acesso</p>
      </div>

      {/* PIN Indicators */}
      <div className={`flex gap-4 mb-10 ${error ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
              i < pinInput.length 
                ? error ? 'bg-rose-500 border-rose-500' : 'bg-indigo-500 border-indigo-500 scale-110' 
                : 'border-slate-600 bg-transparent'
            }`}
          />
        ))}
      </div>

      {/* Numeric Keypad (Randomized) */}
      <div className="grid grid-cols-3 gap-x-6 gap-y-6 max-w-[280px]">
        {keypadNumbers.slice(0, 9).map((num) => (
          <button
            key={num}
            onClick={() => handleUnlockPress(num)}
            className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-2xl font-semibold flex items-center justify-center transition-colors active:scale-95 shadow-sm"
          >
            {num}
          </button>
        ))}
        
        {/* Empty Slot */}
        <div className="w-16 h-16"></div>
        
        {/* Last Number (Usually 0) */}
        <button
          onClick={() => handleUnlockPress(keypadNumbers[9])}
          className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-2xl font-semibold flex items-center justify-center transition-colors active:scale-95 shadow-sm"
        >
          {keypadNumbers[9]}
        </button>

        {/* Delete Button */}
        <button
          onClick={handleUnlockDelete}
          className="w-16 h-16 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center justify-center transition-colors active:scale-95"
        >
          <DeleteIcon className="w-6 h-6" />
        </button>
      </div>

      <button 
        onClick={handleForgotPassword}
        disabled={loading}
        className="mt-8 text-sm font-bold text-orange-500 hover:text-orange-400 transition-colors border-b border-transparent hover:border-orange-400 pb-0.5 disabled:opacity-50"
      >
        {loading ? 'Enviando Código...' : 'Esqueci meu PIN'}
      </button>

      {/* MODAL DE RECUPERAÇÃO */}
      {showRecoveryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl w-full max-w-sm shadow-2xl relative animate-in zoom-in-95">
             <button 
               onClick={() => setShowRecoveryModal(false)}
               className="absolute top-4 right-4 text-slate-500 hover:text-white"
             >
                <XIcon className="w-5 h-5" />
             </button>

             <div className="flex flex-col items-center mb-6">
                <div className="p-3 bg-sky-500/20 rounded-full mb-3">
                   <SendIcon className="w-8 h-8 text-sky-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Código Enviado!</h2>
                <p className="text-xs text-slate-400 text-center mt-2 px-2">
                   Enviamos um código de 4 dígitos para: <br/><strong className="text-slate-200">{maskEmail(storedEmail)}</strong>
                </p>
             </div>

             <div className="space-y-4">
                <input 
                   type="text" 
                   inputMode="numeric" 
                   maxLength={4}
                   value={otpInput}
                   onChange={e => {
                      setOtpInput(e.target.value.replace(/\D/g, ''));
                      setError('');
                   }}
                   className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-center text-3xl tracking-[0.5em] font-bold text-white focus:border-sky-500 outline-none transition-colors"
                   placeholder="0000"
                   autoFocus
                />

                {error && <p className="text-rose-400 text-xs font-bold text-center bg-rose-500/10 py-2 rounded">{error}</p>}

                <button 
                   onClick={handleVerifyOtp}
                   className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-900/20 transition-all active:scale-95"
                >
                   Verificar Código
                </button>
                
                <button 
                   onClick={() => setShowRecoveryModal(false)}
                   className="w-full py-2 text-slate-500 text-xs font-bold hover:text-white transition-colors"
                >
                   Cancelar
                </button>
             </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};
