'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';

const TextStylesContext = createContext({
  getStyle: () => ({}),
  setStyle: async () => {},
  loading: true,
});

function keyFor(type, id) {
  return `${type}:${id}`;
}

export function TextStylesProvider({ children }) {
  const [styles, setStyles] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from('text_styles').select('*');
    if (data) {
      const map = {};
      data.forEach((row) => {
        map[keyFor(row.target_type, row.target_id)] = {
          bold: row.bold,
          color: row.color,
          fontSize: row.font_size,
        };
      });
      setStyles(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function getStyle(type, id) {
    return styles[keyFor(type, id)] || {};
  }

  async function setStyle(type, id, patch) {
    const k = keyFor(type, id);
    const next = { ...(styles[k] || {}), ...patch };
    setStyles((prev) => ({ ...prev, [k]: next }));
    await supabase.from('text_styles').upsert({
      target_type: type,
      target_id: id,
      bold: !!next.bold,
      color: next.color || null,
      font_size: next.fontSize || null,
    }, { onConflict: 'target_type,target_id' });
  }

  return (
    <TextStylesContext.Provider value={{ getStyle, setStyle, loading }}>
      {children}
    </TextStylesContext.Provider>
  );
}

export function useTextStyles() {
  return useContext(TextStylesContext);
}

// Turns a stored style object into a React inline-style object.
export function styleToCss(style) {
  if (!style) return undefined;
  const css = {};
  if (style.bold) css.fontWeight = 700;
  if (style.color) css.color = style.color;
  if (style.fontSize) css.fontSize = `${style.fontSize}px`;
  return css;
}
