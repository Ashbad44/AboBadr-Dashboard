'use client';

import { monthLabel } from '../lib/utils';
import { FilterBar, FilterField } from './FilterBar';

const FIRST_YEAR = 2010;

const MONTH_NAMES = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

export default function MonthPicker({ value, onChange }) {
  const [year, month] = value.split('-'); // "YYYY", "MM"
  const currentYear = new Date().getFullYear();

  const years = [];
  for (let y = currentYear; y >= FIRST_YEAR; y--) years.push({ value: String(y), label: String(y) });

  const months = MONTH_NAMES.map((name, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: name,
  }));

  function handleYearChange(newYear) {
    onChange(`${newYear}-${month}-01`);
  }

  function handleMonthChange(newMonth) {
    onChange(`${year}-${newMonth}-01`);
  }

  return (
    <>
      <FilterBar>
        <FilterField label="السنة" value={year} onChange={handleYearChange} options={years} />
        <FilterField label="الشهر" value={month} onChange={handleMonthChange} options={months} />
      </FilterBar>
      {/* Shown only when printing, since the filter bar is hidden then —
          already includes the full month + year, e.g. "أغسطس 2026". */}
      <span className="print-month-label">{monthLabel(value)}</span>
    </>
  );
}
