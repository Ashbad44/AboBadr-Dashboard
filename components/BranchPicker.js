'use client';

import { FilterBar, FilterField } from './FilterBar';

export default function BranchPicker({ branches, value, onChange }) {
  const options = branches.map((b) => ({ value: b.id, label: b.name }));

  return (
    <FilterBar>
      <FilterField
        label="الفرع"
        icon="🏢"
        value={value || ''}
        onChange={onChange}
        options={options}
      />
    </FilterBar>
  );
}
