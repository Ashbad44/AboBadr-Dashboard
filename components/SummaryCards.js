'use client';

import { fmtMoney } from '../lib/utils';
import { useLabels } from '../lib/LabelsContext';

export default function SummaryCards({ totals }) {
  const { t } = useLabels();

  const cards = [
    {
      title: t('card_total_income'),
      value: totals.totalIncome,
      note: t('card_total_income_note'),
      color: 'var(--teal-600)',
      icon: '💼',
    },
    {
      title: t('card_total_expenses'),
      value: totals.totalExpenses,
      note: t('card_total_expenses_note'),
      color: 'var(--orange-500)',
      icon: '🧾',
    },
    {
      title: t('card_income_before_deductions'),
      value: totals.incomeBeforeDeductions,
      note: t('card_income_before_deductions_note'),
      color: 'var(--green-600)',
      icon: '📈',
    },
    {
      title: t('card_total_deductions'),
      value: totals.totalDeductions,
      note: t('card_total_deductions_note'),
      color: 'var(--blue-500)',
      icon: '⬇️',
    },
    {
      title: t('card_final_total_income'),
      value: totals.finalTotalIncome,
      note: t('card_final_total_income_note'),
      color: 'var(--teal-900)',
      icon: '💰',
    },
  ];

  return (
    <div className="cards-row">
      {cards.map((c, i) => (
        <div className={`stat-card ${i === cards.length - 1 ? 'highlight-card' : ''}`} key={c.title}>
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
