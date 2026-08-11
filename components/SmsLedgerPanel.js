'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { fmtMoney } from '../lib/utils';
import { useLabels } from '../lib/LabelsContext';
import StyledLabel from './StyledLabel';
import StyleToolbar from './StyleToolbar';
import { useTextStyles, styleToCss } from '../lib/TextStylesContext';

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

export default function SmsLedgerPanel({ sources, onRenameSource, onResultsChange }) {
  const { t } = useLabels();
  const { getStyle } = useTextStyles();
  const ls = (key) => styleToCss(getStyle('label', key));
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

  // Report current results up to the parent (for Excel export), whenever they change.
  useEffect(() => {
    if (!onResultsChange) return;
    onResultsChange(sources.map((s) => ({
      name: s.name,
      count: results[s.id]?.status === 'ok' ? results[s.id].count : 0,
      total: results[s.id]?.status === 'ok' ? results[s.id].total : 0,
    })));
  }, [results, sources, onResultsChange]);

  return (
    <div className="panel sms-panel">
      <div className="panel-header">
        <div className="panel-icon" style={{ background: 'var(--blue-500)' }}>📱</div>
        <StyledLabel type="label" id="sms_panel_title" text={t('sms_panel_title')} as="h3" className="panel-title" />
      </div>
      <table className="grid-table">
        <thead>
          <tr>
            <th style={ls('sms_col_bank')}>{t('sms_col_bank')}</th>
            <th className="right" style={ls('sms_col_count')}>{t('sms_col_count')}</th>
            <th className="right" style={ls('sms_col_total')}>{t('sms_col_total')}</th>
          </tr>
        </thead>
        <tbody>
          {sources.map((s) => {
            const r = results[s.id];
            return (
              <tr key={s.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      className="branch-name-input"
                      value={s.name}
                      onChange={(e) => onRenameSource(s.id, e.target.value)}
                      style={styleToCss(getStyle('sms_source', s.id))}
                    />
                    <StyleToolbar type="sms_source" id={s.id} />
                  </div>
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
            <td style={ls('sms_col_total')}>{t('sms_col_total')}</td>
            <td></td>
            <td className="right">{fmtMoney(grandTotal)}</td>
          </tr>
        </tbody>
      </table>
      <button className="add-row-btn" onClick={refreshAll} style={ls('sms_refresh_btn')}>{t('sms_refresh_btn')}</button>
    </div>
  );
}
