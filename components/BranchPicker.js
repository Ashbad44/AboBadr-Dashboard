'use client';

export default function BranchPicker({ branches, value, onChange, placeholder }) {
  return (
    <select
      className="month-select"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    >
      {branches.map((b) => (
        <option key={b.id} value={b.id}>{b.name}</option>
      ))}
    </select>
  );
}
