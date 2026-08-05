'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { fmtMoney } from '../lib/utils';
import { useLabels } from '../lib/LabelsContext';

// Fetches one source's JSON (shape: { columns: [{ name, total }, ...] })
async function fetchColumns(source) {
  const sep = source.url.includes('?') ? '&' : '?';
  const res = await fetch(`${source.url}${sep}secret=${encodeURIComponent(source.secret)}`);
  if (!res.ok) throw new Error('bad response');
  const data = await res.json();
  return data.columns || [];
}

export default function CashColumnsPanel({ sources }) {
  const { t } = useLabels();
  // { [sourceId]: { status: 'loading'|'ok'|'error', columns: [] } }
  const [results, setResults] = useState({});

  const refreshAll = useCallback(async () => {
    sources.forEach((s) => {
      setResults((prev) => ({ ...prev, [s.id]: { status: 'loading' } }));
      fetchColumns(s)
        .then((columns) => {
          setResults((prev) => ({ ...prev, [s.id]: { status: 'ok', columns } }));
        })
        .catch(() => {
          setResults((prev) => ({ ...prev, [s.id]: { status: 'error' } }));
        });
    });
  }, [sources]);

  const didInitialFetch = useRef(false);
  useEffect(() => {
    if (!didInitialFetch.current && sources.length > 0) {
      didInitialFetch.current = true;
      refreshAll();
    }
  }, [sources, refreshAll]);

  if (sources.length === 0) return null;

  return (
    <>
      {sources.map((s) => {
        const r = results[s.id];
        const grandTotal = r?.status === 'ok'
          ? r.columns.reduce((sum, c) => sum + (Number(c.total) || 0), 0)
          : 0;

        return (
          <div className="panel" key={s.id}>
            <div className="panel-header">
              <div className="panel-icon" style={{ background: 'var(--green-600)' }}>💵</div>
              <h3 className="panel-title">{t('cash_panel_title')}</h3>
            </div>
            <table className="grid-table">
              <thead>
                <tr>
                  <th>{t('cash_col_name')}</th>
                  <th className="right">{t('cash_col_total')}</th>
                </tr>
              </thead>
              <tbody>
                {r?.status === 'ok' && r.columns.map((c) => (
                  <tr key={c.name}>
                    <td>{c.name}</td>
                    <td className="right">{fmtMoney(c.total)}</td>
                  </tr>
                ))}
                {r?.status === 'loading' && (
                  <tr><td colSpan={2}>{t('cash_loading')}</td></tr>
                )}
                {r?.status === 'error' && (
                  <tr><td colSpan={2} style={{ color: '#c0392b' }}>{t('cash_error')}</td></tr>
                )}
                {r?.status === 'ok' && (
                  <tr className="total-row">
                    <td>{t('cash_total_row')}</td>
                    <td className="right">{fmtMoney(grandTotal)}</td>
                  </tr>
                )}
              </tbody>
            </table>
            <button className="add-row-btn" onClick={refreshAll}>{t('cash_refresh_btn')}</button>
          </div>
        );
      })}
    </>
  );
}
