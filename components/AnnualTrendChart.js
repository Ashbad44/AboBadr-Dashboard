'use client';

import { useEffect } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { fmtMoney } from '../lib/utils';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e6e9ec', borderRadius: 8,
      padding: '10px 12px', fontSize: 13, boxShadow: '0 4px 14px rgba(14,59,61,0.12)',
    }}>
      <p style={{ margin: '0 0 4px 0', fontWeight: 700, color: '#16292b' }}>{label}</p>
      <p style={{ margin: 0, color: '#0e3b3d', fontWeight: 700 }}>{fmtMoney(payload[0].value)}</p>
    </div>
  );
}

export default function AnnualTrendChart({ data, labels }) {
  // Charts measure their size via ResizeObserver, which doesn't fire correctly
  // when the print dialog opens — this forces a re-measure right before printing
  // so the chart doesn't stay stuck at a tiny/incorrect size on the printed page.
  useEffect(() => {
    const handler = () => window.dispatchEvent(new Event('resize'));
    window.addEventListener('beforeprint', handler);
    return () => window.removeEventListener('beforeprint', handler);
  }, []);

  return (
    <div dir="ltr" style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="netIncomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0e3b3d" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#0e3b3d" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6e9ec" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7c7e' }} />
          <YAxis tick={{ fontSize: 12, fill: '#6b7c7e' }} tickFormatter={(v) => fmtMoney(v)} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="net"
            name={labels.net}
            stroke="#0e3b3d"
            strokeWidth={3}
            fill="url(#netIncomeGradient)"
            dot={{ r: 4, fill: '#0e3b3d', strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
