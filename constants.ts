
import { Transaction, TransactionType } from './types';

// Helper to get dates relative to current month for realistic dashboard data
const getDateInCurrentMonth = (day: number) => {
  const date = new Date();
  date.setDate(day);
  return date.toISOString();
};

const getDateInPreviousMonth = (day: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  date.setDate(day);
  return date.toISOString();
};

// PRODUCTION SETUP: Initial data set to empty array.
export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const THEMES = {
  purple: {
    label: 'Roxo (Padrão)',
    colors: {
      300: '165 180 252', // indigo-300
      400: '129 140 248', // indigo-400
      500: '99 102 241',  // indigo-500
      600: '79 70 229',   // indigo-600
      900: '49 46 129',   // indigo-900
    },
    primary: '#4f46e5'
  },
  emerald: {
    label: 'Verde Prosperidade',
    colors: {
      300: '110 231 183', // emerald-300
      400: '52 211 153',  // emerald-400
      500: '16 185 129',  // emerald-500
      600: '5 150 105',   // emerald-600
      900: '6 78 59',     // emerald-900
    },
    primary: '#10b981'
  },
  blue: {
    label: 'Azul Oceano',
    colors: {
      300: '147 197 253', // blue-300
      400: '96 165 250',  // blue-400
      500: '59 130 246',  // blue-500
      600: '37 99 235',   // blue-600
      900: '30 58 138',   // blue-900
    },
    primary: '#3b82f6'
  },
  orange: {
    label: 'Laranja Bitcoin',
    colors: {
      300: '253 186 116', // orange-300
      400: '251 146 60',  // orange-400
      500: '249 115 22',  // orange-500
      600: '234 88 12',   // orange-600
      900: '124 45 18',   // orange-900
    },
    primary: '#f97316'
  }
};

export type ThemeKey = keyof typeof THEMES;
