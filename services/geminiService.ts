
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

// Initialize the GoogleGenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFinances = async (transactions: Transaction[], customPrompt?: string): Promise<string> => {
  try {
    const dataSummary = transactions.slice(0, 20).map(t => 
      `- ${t.date.split('T')[0]}: ${t.description} (${t.type}) R$${t.amount.toFixed(2)} [${t.category}]`
    ).join('\n');

    const prompt = customPrompt || `
      Analise os seguintes dados financeiros de um usuário e forneça 3 insights ou conselhos breves, práticos e profissionais em Português do Brasil.
      Foque em economia, padrões de gastos ou oportunidades de investimento.
      Use formatação Markdown simples (negrito, listas).
      
      Dados:
      ${dataSummary}
    `;

    // Use ai.models.generateContent with the recommended model for basic text tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é um consultor financeiro pessoal especialista e objetivo.",
        temperature: 0.7,
      }
    });

    // Access the .text property directly from the response object.
    return response.text || "Não foi possível gerar uma análise no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erro ao conectar com o consultor financeiro IA. Verifique sua chave API.";
  }
};
