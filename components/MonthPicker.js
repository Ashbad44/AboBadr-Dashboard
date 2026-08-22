'use client';

import { monthLabel } from '../lib/utils';

const FIRST_YEAR = 2010;

const MONTH_NAMES = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

export default function MonthPicker({ value, onChange }) {
  const [year, month] = value.split('-'); // "YYYY", "MM"
  const currentYear = new Date().getFullYear();

  const years = [];
  for (let y = currentYear; y >= FIRST_YEAR; y--) years.push(y);

  function handleYearChange(newYear) {
    onChange(`${newYear}-${month}-01`);
  }

  function handleMonthChange(newMonth) {
    onChange(`${year}-${newMonth}-01`);
  }

  return (
    <div className="top-controls">
      <select className="month-select" value={month} onChange={(e) => handleMonthChange(e.target.value)}>
        {MONTH_NAMES.map((name, i) => {
          const mm = String(i + 1).padStart(2, '0');
          return <option key={mm} value={mm}>{name}</option>;
        })}
      </select>
      <select className="month-select" value={year} onChange={(e) => handleYearChange(e.target.value)}>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      {/* Shown only when printing, since both dropdowns are hidden then —
          already includes the full month + year, e.g. "أغسطس 2026". */}
      <span className="print-month-label">{monthLabel(value)}</span>
    </div>
  );
}
