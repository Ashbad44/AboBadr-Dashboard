'use client';

export function FilterBar({ children }) {
  return (
    <div className="filter-bar">
      <div className="filter-badge">
        <span className="filter-badge-icon">🎛️</span>
        <span>المرشحات</span>
      </div>
      <div className="filter-fields">
        {children}
      </div>
    </div>
  );
}

export function FilterField({ label, icon = '📅', value, onChange, options }) {
  return (
    <div className="filter-field">
      <span className="filter-field-label">{label}</span>
      <div className="filter-select-wrap">
        <span className="filter-chevron">▾</span>
        <select
          className="filter-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="filter-icon">{icon}</span>
      </div>
    </div>
  );
}
