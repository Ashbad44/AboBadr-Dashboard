'use client';

import { fmtMoney } from '../lib/utils';

export default function SummaryCards({ totals }) {
  const cards = [
    {
      title: 'Total Income',
      value: totals.totalIncome,
      note: 'From all branches',
      color: 'var(--teal-600)',
      icon: '💼',
    },
    {
      title: 'Total Expenses',
      value: totals.totalExpenses,
      note: 'All expenses',
      color: 'var(--orange-500)',
      icon: '🧾',
    },
    {
      title: 'Income Before Deductions',
      value: totals.incomeBeforeDeductions,
      note: 'Income − Expenses',
      color: 'var(--green-600)',
      icon: '📈',
    },
    {
      title: 'Total Deductions',
      value: totals.totalDeductions,
      note: 'Other deductions',
      color: 'var(--blue-500)',
      icon: '⬇️',
    },
    {
      title: 'Final Total Income',
      value: totals.finalTotalIncome,
      note: 'After all deductions',
      color: 'var(--teal-900)',
      icon: '💰',
    },
  ];

  return (
    <div className="cards-row">
      {cards.map((c) => (
        <div className="stat-card" key={c.title}>
          <div className="stat-icon" style={{ background: c.color }}>{c.icon}</div>
          <div>
            <p className="stat-title">{c.title}</p>
            <p className="stat-value">{fmtMoney(c.value)}</p>
            <p className="stat-note">{c.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
