'use client';

import { recentYearOptions } from '../lib/utils';

export default function YearPicker({ value, onChange }) {
  const years = recentYearOptions(8);

  return (
    <select className="month-select" value={value} onChange={(e) => onChange(Number(e.target.value))}>
      {years.map((y) => (
        <option key={y} value={y}>{y}</option>
      ))}
    </select>
  );
}
