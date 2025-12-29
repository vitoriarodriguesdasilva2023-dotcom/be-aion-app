import { Transaction, TransactionType } from '../types';
import { formatCurrency } from '../constants';

// Helper to format date for Google Calendar URL (YYYYMMDD)
const formatDateForUrl = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toISOString().replace(/-|:|\.\d\d\d/g, "").split("T")[0];
};

// Helper to format date for ICS (YYYYMMDDTHHmmSSZ)
const formatDateForICS = (dateStr: string) => {
  const date = new Date(dateStr);
  // Set a default time (e.g., 09:00 AM)
  date.setHours(9, 0, 0);
  return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
};

export const getGoogleCalendarUrl = (transaction: Transaction) => {
  const title = encodeURIComponent(`${transaction.description} - ${formatCurrency(transaction.amount)}`);
  
  const details = encodeURIComponent(
    `Pagamento: ${transaction.description}\n` +
    `Valor: ${formatCurrency(transaction.amount)}\n` +
    `Categoria: ${transaction.category}\n` +
    `Parcela: ${transaction.installmentTotal ? `${transaction.installmentCurrent}/${transaction.installmentTotal}` : 'Única'}`
  );

  // Date format: YYYYMMDD/YYYYMMDD (All day event logic or specific time)
  // Let's create an all-day event
  const dateStr = formatDateForUrl(transaction.date);
  const dates = `${dateStr}/${dateStr}`; // Same day start/end for all-day

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
};

export const generateICSFile = (transactions: Transaction[]) => {
  // Filter only pending or overdue expenses
  const futureExpenses = transactions.filter(
    t => t.type === TransactionType.EXPENSE && (t.status === 'pending' || t.status === 'overdue')
  );

  if (futureExpenses.length === 0) return null;

  let icsContent = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//FinPro AI//Finance App//PT-BR
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

  futureExpenses.forEach(t => {
    const startDate = formatDateForICS(t.date);
    // End date is 1 hour later
    const d = new Date(t.date);
    d.setHours(10, 0, 0);
    const endDate = d.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const description = `Valor: ${formatCurrency(t.amount)}\nCategoria: ${t.category}`;

    icsContent += 
`BEGIN:VEVENT
SUMMARY:${t.description} - ${formatCurrency(t.amount)}
UID:${t.id}@finpro.app
DTSTART:${startDate}
DTEND:${endDate}
DESCRIPTION:${description}
STATUS:CONFIRMED
END:VEVENT
`;
  });

  icsContent += `END:VCALENDAR`;

  return icsContent;
};

export const downloadICS = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};