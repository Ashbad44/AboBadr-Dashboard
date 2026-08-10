'use client';

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from 'recharts';
import { fmtMoney } from '../lib/utils';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e6e9ec', borderRadius: 8,
      padding: '10px 12px', fontSize: 13, boxShadow: '0 4px 14px rgba(14,59,61,0.12)',
    }}>
      <p style={{ margin: '0 0 6px 0', fontWeight: 700, color: '#16292b' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ margin: '2px 0', color: p.color }}>
          {p.name}: {fmtMoney(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function BranchesCompareChart({ data, labels }) {
  return (
    <div dir="ltr" style={{ width: '100%', height: 340 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6e9ec" />
          <XAxis dataKey="branch" tick={{ fontSize: 12, fill: '#6b7c7e' }} />
          <YAxis tick={{ fontSize: 12, fill: '#6b7c7e' }} tickFormatter={(v) => fmtMoney(v)} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Bar dataKey="income" name={labels.income} fill="#14877f" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name={labels.expenses} fill="#e8823a" radius={[4, 4, 0, 0]} />
          <Bar dataKey="net" name={labels.net} fill="#1f9d55" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
