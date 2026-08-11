'use client';

import { useState } from 'react';
import { fmtMoney } from '../lib/utils';
import { useLabels } from '../lib/LabelsContext';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function BranchRankingList({ branches }) {
  const { t } = useLabels();
  const [sortKey, setSortKey] = useState('net'); // 'net' | 'expenseRatio' | 'growth'

  const sorted = [...branches].sort((a, b) => {
    if (sortKey === 'expenseRatio') return a.expenseRatio - b.expenseRatio; // lower is better
    return b[sortKey] - a[sortKey]; // higher is better for net / growth
  });

  function formatValue(b) {
    if (sortKey === 'net') return fmtMoney(b.net);
    if (sortKey === 'expenseRatio') return `${b.expenseRatio.toFixed(1)}%`;
    return `${b.growth >= 0 ? '▲' : '▼'} ${Math.abs(b.growth).toFixed(1)}%`;
  }

  return (
    <div className="panel panel-large">
      <div className="panel-header">
        <div className="panel-icon" style={{ background: 'var(--teal-500)' }}>🏆</div>
        <h3 className="panel-title">{t('exec_ranking_title')}</h3>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {[
          { key: 'net', label: t('exec_sort_net') },
          { key: 'expenseRatio', label: t('exec_sort_expense_ratio') },
          { key: 'growth', label: t('exec_sort_growth') },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortKey(opt.key)}
            style={{
              padding: '7px 14px',
              borderRadius: 8,
              border: sortKey === opt.key ? '2px solid var(--teal-600)' : '1px solid var(--border)',
              background: sortKey === opt.key ? '#eef6f4' : '#fff',
              fontWeight: sortKey === opt.key ? 700 : 400,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <table className="grid-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{t('exec_ranking_col_branch')}</th>
            <th className="right">{t('exec_ranking_col_value')}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((b, i) => (
            <tr key={b.id}>
              <td>{MEDALS[i] || i + 1}</td>
              <td>{b.name}</td>
              <td className="right" dir="ltr">{formatValue(b)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
