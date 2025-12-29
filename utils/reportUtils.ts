
import { Transaction, TransactionType } from '../types';
import { formatCurrency, formatDate } from '../constants';

export const generateMonthlyReport = (transactions: Transaction[], month: number, year: number, userName: string) => {
  // 1. Filter transactions for the selected month/year
  const filteredTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (filteredTransactions.length === 0) {
    alert("Não há transações para o mês selecionado.");
    return;
  }

  // 2. Calculate Totals
  const totalIncome = filteredTransactions
    .filter(t => t.type === TransactionType.INCOME && t.status === 'paid')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === TransactionType.EXPENSE && t.status === 'paid')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalPending = filteredTransactions
    .filter(t => t.type === TransactionType.EXPENSE && t.status !== 'paid')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const monthName = new Date(year, month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // 3. Generate HTML
  const printContent = `
    <html>
      <head>
        <title>Extrato - ${monthName}</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 20px; color: #1e293b; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
          .header h1 { margin: 0; color: #334155; font-size: 24px; }
          .header p { margin: 5px 0 0; color: #64748b; font-size: 14px; }
          
          .summary { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .summary-item { text-align: center; }
          .summary-label { display: block; font-size: 12px; text-transform: uppercase; color: #64748b; margin-bottom: 5px; letter-spacing: 0.05em; }
          .summary-value { font-size: 18px; font-weight: bold; }
          .text-green { color: #10b981; }
          .text-red { color: #ef4444; }
          .text-blue { color: #3b82f6; }
          
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { text-align: left; padding: 10px; border-bottom: 1px solid #cbd5e1; color: #475569; text-transform: uppercase; font-size: 10px; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
          tr:last-child td { border-bottom: none; }
          
          .status-badge { padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
          .status-paid { background: #dcfce7; color: #166534; }
          .status-pending { background: #fef9c3; color: #854d0e; }
          .status-overdue { background: #fee2e2; color: #991b1b; }

          .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BE AION - Extrato Mensal</h1>
          <p>Usuário: ${userName} • Período: ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}</p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <span class="summary-label">Entradas (Pagas)</span>
            <span class="summary-value text-green">${formatCurrency(totalIncome)}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Saídas (Pagas)</span>
            <span class="summary-value text-red">${formatCurrency(totalExpense)}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">A Pagar (Pendente)</span>
            <span class="summary-value text-blue">${formatCurrency(totalPending)}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Saldo Realizado</span>
            <span class="summary-value ${balance >= 0 ? 'text-green' : 'text-red'}">${formatCurrency(balance)}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Status</th>
              <th style="text-align: right;">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTransactions.map(t => `
              <tr>
                <td>${formatDate(t.date)}</td>
                <td>
                  <strong>${t.description}</strong>
                  ${t.installmentTotal ? `<br/><span style="color:#64748b; font-size:10px;">Parcela ${t.installmentCurrent}/${t.installmentTotal}</span>` : ''}
                </td>
                <td>${t.category}</td>
                <td>
                  <span class="status-badge status-${t.status}">
                    ${t.status === 'paid' ? 'Pago' : t.status === 'pending' ? 'Pendente' : 'Atrasado'}
                  </span>
                </td>
                <td style="text-align: right; color: ${t.type === 'INCOME' ? '#10b981' : '#1e293b'}; font-weight: 500;">
                  ${t.type === 'EXPENSE' ? '-' : ''}${formatCurrency(t.amount)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Gerado automaticamente por BE AION em ${new Date().toLocaleString('pt-BR')}
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
  } else {
    alert("Por favor, permita pop-ups para imprimir o relatório.");
  }
};
