'use client';

import { recentYearOptions } from '../lib/utils';
import { FilterBar, FilterField } from './FilterBar';

export default function YearPicker({ value, onChange }) {
  const years = recentYearOptions(8).map((y) => ({ value: String(y), label: String(y) }));

  return (
    <FilterBar>
      <FilterField
        label="السنة"
        value={String(value)}
        onChange={(v) => onChange(Number(v))}
        options={years}
      />
    </FilterBar>
  );
}
