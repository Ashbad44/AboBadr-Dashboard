'use client';

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tab-nav">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`tab-button ${active === tab.key ? 'active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
