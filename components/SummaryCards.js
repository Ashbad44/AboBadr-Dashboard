'use client';

import { fmtMoney } from '../lib/utils';
import { useLabels } from '../lib/LabelsContext';
import { useTextStyles, styleToCss } from '../lib/TextStylesContext';

export default function SummaryCards({ totals }) {
  const { t } = useLabels();
  const { getStyle } = useTextStyles();
  const ls = (key) => styleToCss(getStyle('label', key));

  const cards = [
    {
      titleKey: 'card_total_income',
      title: t('card_total_income'),
      value: totals.totalIncome,
      noteKey: 'card_total_income_note',
      note: t('card_total_income_note'),
      color: 'var(--teal-600)',
      icon: '💼',
    },
    {
      titleKey: 'card_total_expenses',
      title: t('card_total_expenses'),
      value: totals.totalExpenses,
      noteKey: 'card_total_expenses_note',
      note: t('card_total_expenses_note'),
      color: 'var(--orange-500)',
      icon: '🧾',
    },
    {
      titleKey: 'card_income_before_deductions',
      title: t('card_income_before_deductions'),
      value: totals.incomeBeforeDeductions,
      noteKey: 'card_income_before_deductions_note',
      note: t('card_income_before_deductions_note'),
      color: 'var(--green-600)',
      icon: '📈',
    },
    {
      titleKey: 'card_total_deductions',
      title: t('card_total_deductions'),
      value: totals.totalDeductions,
      noteKey: 'card_total_deductions_note',
      note: t('card_total_deductions_note'),
      color: 'var(--blue-500)',
      icon: '⬇️',
    },
    {
      titleKey: 'card_final_total_income',
      title: t('card_final_total_income'),
      value: totals.finalTotalIncome,
      noteKey: 'card_final_total_income_note',
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
            <p className="stat-title" style={ls(c.titleKey)}>{c.title}</p>
            <p className="stat-value">{fmtMoney(c.value)}</p>
            <p className="stat-note" style={ls(c.noteKey)}>{c.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
