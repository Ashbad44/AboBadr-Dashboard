'use client';

import { useState } from 'react';
import { useTextStyles } from '../lib/TextStylesContext';

const SIZES = [
  { label: 'ص', px: 12 },
  { label: 'م', px: 14 },
  { label: 'ك', px: 18 },
  { label: 'ك+', px: 24 },
];

export default function StyleToolbar({ type, id }) {
  const { getStyle, setStyle } = useTextStyles();
  const [open, setOpen] = useState(false);
  const style = getStyle(type, id);

  return (
    <span className="style-toolbar-wrap">
      <button
        type="button"
        className="style-toolbar-toggle"
        onClick={() => setOpen((o) => !o)}
        title="تنسيق النص"
      >
        Aa
      </button>
      {open && (
        <div className="style-toolbar-popover">
          <button
            type="button"
            className={`style-toolbar-bold ${style.bold ? 'active' : ''}`}
            onClick={() => setStyle(type, id, { bold: !style.bold })}
          >
            B
          </button>
          <input
            type="color"
            className="style-toolbar-color"
            value={style.color || '#16292b'}
            onChange={(e) => setStyle(type, id, { color: e.target.value })}
          />
          <select
            className="style-toolbar-size"
            value={style.fontSize || ''}
            onChange={(e) => setStyle(type, id, { fontSize: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">افتراضي</option>
            {SIZES.map((s) => (
              <option key={s.px} value={s.px}>{s.label}</option>
            ))}
          </select>
          <button
            type="button"
            className="style-toolbar-reset"
            title="إعادة تعيين"
            onClick={() => setStyle(type, id, { bold: false, color: null, fontSize: null })}
          >
            ↺
          </button>
        </div>
      )}
    </span>
  );
}
