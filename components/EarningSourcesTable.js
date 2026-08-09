'use client';

import { fmtMoney, toNumber } from '../lib/utils';
import { useLabels } from '../lib/LabelsContext';
import StyledLabel from './StyledLabel';
import StyleToolbar from './StyleToolbar';
import { useTextStyles, styleToCss } from '../lib/TextStylesContext';

export default function EarningSourcesTable({
  sources,
  sourceData,
  onChangeAmount,
  onRenameSource,
  onAddSource,
  onRemoveSource,
}) {
  const { t } = useLabels();
  const { getStyle } = useTextStyles();
  const ls = (key) => styleToCss(getStyle('label', key));
  const total = sources.reduce((sum, s) => sum + toNumber((sourceData[s.id] || {}).amount), 0);

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-icon" style={{ background: 'var(--teal-500)' }}>💼</div>
        <StyledLabel type="label" id="sources_panel_title" text={t('sources_panel_title')} as="h3" className="panel-title" />
      </div>
      <table className="grid-table">
        <thead>
          <tr>
            <th style={ls('sources_col_source')}>{t('sources_col_source')}</th>
            <th className="right" style={ls('sources_col_amount')}>{t('sources_col_amount')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sources.map((s) => {
            const row = sourceData[s.id] || { amount: 0 };
            return (
              <tr key={s.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      className="branch-name-input"
                      value={s.name}
                      onChange={(e) => onRenameSource(s.id, e.target.value)}
                      style={styleToCss(getStyle('earning_source', s.id))}
                    />
                    <StyleToolbar type="earning_source" id={s.id} />
                  </div>
                </td>
                <td className="right">
                  <input
                    className="cell-input"
                    type="text"
                    inputMode="decimal"
                    dir="ltr"
                    lang="en"
                    value={row.amount}
                    onChange={(e) => onChangeAmount(s.id, e.target.value)}
                  />
                </td>
                <td>
                  <button className="remove-btn" onClick={() => onRemoveSource(s.id)}>✕</button>
                </td>
              </tr>
            );
          })}
          <tr className="total-row">
            <td style={ls('sources_total_row')}>{t('sources_total_row')}</td>
            <td className="right">{fmtMoney(total)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <button className="add-row-btn" onClick={onAddSource} style={ls('sources_add_btn')}>{t('sources_add_btn')}</button>
    </div>
  );
}
