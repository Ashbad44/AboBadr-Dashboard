'use client';

import { recentMonthOptions } from '../lib/utils';

export default function MonthPicker({ value, onChange }) {
  const options = recentMonthOptions(36);
  const year = value.split('-')[0];

  return (
    <div className="top-controls">
      <select className="month-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span className="year-pill">{year}</span>
    </div>
  );
}
