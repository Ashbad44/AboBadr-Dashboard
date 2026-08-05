'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { DEFAULT_LABELS } from './labels';

const LabelsContext = createContext({
  t: (key) => DEFAULT_LABELS[key] || key,
  labels: DEFAULT_LABELS,
  loading: true,
  saveLabels: async () => {},
});

export function LabelsProvider({ children }) {
  const [labels, setLabels] = useState(DEFAULT_LABELS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from('labels').select('key, value');
    if (data && data.length) {
      const map = { ...DEFAULT_LABELS };
      data.forEach((row) => { map[row.key] = row.value; });
      setLabels(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function t(key) {
    return labels[key] || DEFAULT_LABELS[key] || key;
  }

  // Saves a batch of { key, value } changes and updates local state immediately.
  async function saveLabels(changes) {
    setLabels((prev) => ({ ...prev, ...changes }));
    const rows = Object.entries(changes).map(([key, value]) => ({ key, value }));
    await supabase.from('labels').upsert(rows, { onConflict: 'key' });
  }

  return (
    <LabelsContext.Provider value={{ t, labels, loading, saveLabels }}>
      {children}
    </LabelsContext.Provider>
  );
}

export function useLabels() {
  return useContext(LabelsContext);
}
