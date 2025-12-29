
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export type TransactionStatus = 'paid' | 'pending' | 'overdue';

export interface Transaction {
  id: string;
  groupId?: string; // Links recurring or installment transactions together
  cardId?: string; // Links transaction to a credit card
  description: string;
  amount: number;
  date: string;
  paidAt?: string; // Data real em que foi marcado como pago
  type: TransactionType;
  category: string;
  status: TransactionStatus;
  isRecurring?: boolean;
  installmentCurrent?: number;
  installmentTotal?: number;
  paymentMethod?: 'credit_card' | 'boleto' | 'pix' | 'cash' | 'other';
}

export interface FinancialSummary {
  paidThisMonth: number;
  remainingThisMonth: number;
}

export interface CreditCard {
  id: string;
  name: string; // e.g. "Nubank"
  holderName: string; // e.g. "Giovana Massarim"
  limitTotal: number;
  closingDay: number;
  dueDay: number;
  color?: string; // Hex color for icon/theme
  isArchived?: boolean; // Propriedade para arquivamento
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  createdAt: string;
}

// Vault Types
// Added 'reminder' type
export type VaultItemType = 'login' | 'note' | 'pix' | 'reminder';

export interface VaultItem {
  id: string;
  type: VaultItemType;
  title: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  // PIX specific fields
  pixKey?: string;
  beneficiary?: string;
  // Reminder specific fields
  reminderDate?: string; // Start date
  endDate?: string;     // End date (optional)
  createdAt: string;
}
