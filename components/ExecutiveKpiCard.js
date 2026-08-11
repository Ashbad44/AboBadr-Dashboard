'use client';

import { fmtMoney } from '../lib/utils';

function ChangeBadge({ label, value }) {
  const isUp = value >= 0;
  const color = isUp ? 'var(--green-600)' : '#c0392b';
  const arrow = isUp ? '▲' : '▼';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4 }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color, fontWeight: 700 }} dir="ltr">{arrow} {Math.abs(value).toFixed(1)}%</span>
    </div>
  );
}

export default function ExecutiveKpiCard({ icon, color, title, value, momChange, momLabel, yoyChange, yoyLabel }) {
  return (
    <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="stat-icon" style={{ background: color }}>{icon}</div>
        <p className="stat-title" style={{ margin: 0 }}>{title}</p>
      </div>
      <p className="stat-value" style={{ margin: 0 }}>{fmtMoney(value)}</p>
      <div>
        <ChangeBadge label={momLabel} value={momChange} />
        <ChangeBadge label={yoyLabel} value={yoyChange} />
      </div>
    </div>
  );
}
