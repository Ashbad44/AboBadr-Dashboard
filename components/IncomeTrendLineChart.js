'use client';

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { useEffect } from 'react';
import { fmtMoney } from '../lib/utils';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e6e9ec', borderRadius: 8,
      padding: '10px 12px', fontSize: 13, boxShadow: '0 4px 14px rgba(14,59,61,0.12)',
    }}>
      <p style={{ margin: '0 0 4px 0', fontWeight: 700, color: '#16292b' }}>{label}</p>
      <p style={{ margin: 0, color: '#14877f' }}>{fmtMoney(payload[0].value)}</p>
    </div>
  );
}

export default function IncomeTrendLineChart({ data }) {
  useEffect(() => {
    const handler = () => window.dispatchEvent(new Event('resize'));
    window.addEventListener('beforeprint', handler);
    return () => window.removeEventListener('beforeprint', handler);
  }, []);

  return (
    <div dir="ltr" style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6e9ec" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7c7e' }} />
          <YAxis tick={{ fontSize: 12, fill: '#6b7c7e' }} tickFormatter={(v) => fmtMoney(v)} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#14877f"
            strokeWidth={3}
            dot={{ r: 4, fill: '#14877f' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
