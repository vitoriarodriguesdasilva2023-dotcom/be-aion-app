import React, { useState } from 'react';
import { Transaction } from '../types';
import { analyzeFinances } from '../services/geminiService';
import { SparklesIcon, SendIcon } from './Icons';

interface AIAdvisorProps {
  transactions: Transaction[];
  compact?: boolean;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions, compact }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [customQuery, setCustomQuery] = useState('');

  const handleGenerateInsight = async () => {
    setLoading(true);
    const result = await analyzeFinances(transactions);
    setAnalysis(result);
    setLoading(false);
  };

  const handleCustomQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;
    
    setLoading(true);
    // Append context about transactions to the user query
    const contextPrompt = `
      Baseado nestas transações: ${JSON.stringify(transactions.slice(0, 10))}.
      Responda à pergunta do usuário: "${customQuery}".
    `;
    const result = await analyzeFinances(transactions, contextPrompt);
    setAnalysis(result);
    setLoading(false);
    setCustomQuery('');
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-xl border border-indigo-500/30 relative overflow-hidden h-full flex flex-col">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <SparklesIcon className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Insights IA</h3>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
           {!analysis && !loading && (
             <>
                <p className="text-slate-300 text-sm mb-4">
                  Analise seus gastos recentes para encontrar oportunidades de economia com o Gemini.
                </p>
                <button 
                  onClick={handleGenerateInsight}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-900/50 w-full"
                >
                  Gerar Análise
                </button>
             </>
           )}
           
           {loading && (
             <div className="flex flex-col items-center gap-3">
               <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-xs text-indigo-300 animate-pulse">Pensando...</p>
             </div>
           )}

           {analysis && !loading && (
             <div className="text-left w-full">
               <div className="text-xs text-slate-200 prose prose-invert prose-p:my-1 prose-ul:pl-4 max-h-[200px] overflow-y-auto custom-scrollbar">
                 <div dangerouslySetInnerHTML={{ 
                   __html: analysis
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^\* /gm, '• ')
                    .replace(/\n/g, '<br/>') 
                 }} />
               </div>
               <button 
                  onClick={() => setAnalysis('')}
                  className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 underline"
                >
                  Nova Análise
                </button>
             </div>
           )}
        </div>
      </div>
    );
  }

  // Full Page View
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden flex flex-col h-[600px]">
      <div className="p-6 border-b border-slate-700/50 bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
             <SparklesIcon className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Consultor Financeiro Gemini</h2>
            <p className="text-sm text-slate-400">Pergunte sobre seus dados ou peça conselhos.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {analysis ? (
           <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
             <h4 className="text-sm font-semibold text-indigo-400 mb-4 uppercase tracking-wider">Resposta da IA</h4>
             <div className="text-slate-200 leading-relaxed space-y-4">
                 <div dangerouslySetInnerHTML={{ 
                   __html: analysis
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                    .replace(/^\* /gm, '<li class="ml-4 list-disc">') 
                    .replace(/\n/g, '<br/>')
                 }} />
             </div>
           </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
            <SparklesIcon className="w-16 h-16 mb-4" />
            <p>Selecione uma opção abaixo ou digite sua pergunta.</p>
          </div>
        )}
        
        {loading && (
          <div className="flex items-center gap-3 text-indigo-400 mt-4 animate-pulse">
            <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animation-delay-200"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animation-delay-400"></div>
            <span className="text-sm">Gerando resposta...</span>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-800 border-t border-slate-700/50">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
           <button 
             onClick={handleGenerateInsight}
             className="whitespace-nowrap px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 rounded-full border border-slate-600 transition-colors"
           >
             Analisar tudo
           </button>
           <button 
             onClick={() => {
                setCustomQuery("Como posso economizar mais em alimentação?");
             }}
             className="whitespace-nowrap px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 rounded-full border border-slate-600 transition-colors"
           >
             Economizar em alimentação
           </button>
           <button 
             onClick={() => {
               setCustomQuery("Qual é minha maior despesa?");
             }}
             className="whitespace-nowrap px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 rounded-full border border-slate-600 transition-colors"
           >
             Maior despesa
           </button>
        </div>

        <form onSubmit={handleCustomQuery} className="relative">
          <input
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder="Faça uma pergunta sobre suas finanças..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button 
            type="submit"
            disabled={loading || !customQuery.trim()}
            className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};