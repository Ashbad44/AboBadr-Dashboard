'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { fmtMoney } from '../lib/utils';
import { useLabels } from '../lib/LabelsContext';

// Fetches one source's JSON and sums the "amount" field across all rows.
async function fetchSourceTotal(source) {
  const sep = source.url.includes('?') ? '&' : '?';
  const res = await fetch(`${source.url}${sep}secret=${encodeURIComponent(source.secret)}`);
  if (!res.ok) throw new Error('bad response');
  const data = await res.json();
  const rows = data.rows || [];
  const total = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  return { total, count: rows.length };
}

export default function SmsLedgerPanel({ sources, onRenameSource }) {
  const { t } = useLabels();
  // { [sourceId]: { status: 'loading'|'ok'|'error', total, count } }
  const [results, setResults] = useState({});

  const refreshAll = useCallback(async () => {
    sources.forEach((s) => {
      setResults((prev) => ({ ...prev, [s.id]: { status: 'loading' } }));
      fetchSourceTotal(s)
        .then(({ total, count }) => {
          setResults((prev) => ({ ...prev, [s.id]: { status: 'ok', total, count } }));
        })
        .catch(() => {
          setResults((prev) => ({ ...prev, [s.id]: { status: 'error' } }));
        });
    });
  }, [sources]);

  // Fetch once when the source list first becomes available.
  const didInitialFetch = useRef(false);
  useEffect(() => {
    if (!didInitialFetch.current && sources.length > 0) {
      didInitialFetch.current = true;
      refreshAll();
    }
  }, [sources, refreshAll]);

  const grandTotal = Object.values(results).reduce(
    (sum, r) => sum + (r.status === 'ok' ? r.total : 0),
    0
  );

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-icon" style={{ background: 'var(--blue-500)' }}>📱</div>
        <h3 className="panel-title">{t('sms_panel_title')}</h3>
      </div>
      <table className="grid-table">
        <thead>
          <tr>
            <th>{t('sms_col_bank')}</th>
            <th className="right">{t('sms_col_count')}</th>
            <th className="right">{t('sms_col_total')}</th>
          </tr>
        </thead>
        <tbody>
          {sources.map((s) => {
            const r = results[s.id];
            return (
              <tr key={s.id}>
                <td>
                  <input
                    className="branch-name-input"
                    value={s.name}
                    onChange={(e) => onRenameSource(s.id, e.target.value)}
                  />
                </td>
                <td className="right" dir="ltr">
                  {r?.status === 'ok' ? r.count : r?.status === 'loading' ? '…' : '-'}
                </td>
                <td className="right">
                  {r?.status === 'ok' && fmtMoney(r.total)}
                  {r?.status === 'loading' && t('sms_loading')}
                  {r?.status === 'error' && <span style={{ color: '#c0392b' }}>{t('sms_error')}</span>}
                  {!r && '-'}
                </td>
              </tr>
            );
          })}
          <tr className="total-row">
            <td>{t('sms_col_total')}</td>
            <td></td>
            <td className="right">{fmtMoney(grandTotal)}</td>
          </tr>
        </tbody>
      </table>
      <button className="add-row-btn" onClick={refreshAll}>{t('sms_refresh_btn')}</button>
    </div>
  );
}
