'use client';

import { fmtMoney, toNumber } from '../lib/utils';
import { useLabels } from '../lib/LabelsContext';

export default function EarningSourcesTable({
  sources,
  sourceData,
  onChangeAmount,
  onRenameSource,
  onAddSource,
  onRemoveSource,
}) {
  const { t } = useLabels();
  const total = sources.reduce((sum, s) => sum + toNumber((sourceData[s.id] || {}).amount), 0);

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-icon" style={{ background: 'var(--teal-500)' }}>💼</div>
        <h3 className="panel-title">{t('sources_panel_title')}</h3>
      </div>
      <table className="grid-table">
        <thead>
          <tr>
            <th>{t('sources_col_source')}</th>
            <th className="right">{t('sources_col_amount')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sources.map((s) => {
            const row = sourceData[s.id] || { amount: 0 };
            return (
              <tr key={s.id}>
                <td>
                  <input
                    className="branch-name-input"
                    value={s.name}
                    onChange={(e) => onRenameSource(s.id, e.target.value)}
                  />
                </td>
                <td className="right">
                  <input
                    className="cell-input"
                    type="number"
                    dir="ltr"
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
            <td>{t('sources_total_row')}</td>
            <td className="right">{fmtMoney(total)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <button className="add-row-btn" onClick={onAddSource}>{t('sources_add_btn')}</button>
    </div>
  );
}
