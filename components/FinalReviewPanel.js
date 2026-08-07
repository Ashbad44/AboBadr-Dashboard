'use client';

import { fmtMoney } from '../lib/utils';
import { useLabels } from '../lib/LabelsContext';

export default function FinalReviewPanel({
  totals,
  deductions,
  onChangeDeduction,
  otherDeductionTypes,
  otherDeductionData,
  onChangeOtherDeductionAmount,
  onRenameOtherDeductionType,
  onAddOtherDeductionType,
  onRemoveOtherDeductionType,
}) {
  const { t } = useLabels();

  return (
    <div className="panel panel-large">
      <div className="panel-header">
        <div className="panel-icon" style={{ background: 'var(--green-600)' }}>👁️</div>
        <h3 className="panel-title">{t('review_panel_title')}</h3>
      </div>
      <div className="kv-list">
        <div className="kv-row">
          <span className="kv-label">{t('review_from_upper_table')}</span>
          <span>{fmtMoney(totals.incomeBeforeDeductions)}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">{t('review_electricity_water')}</span>
          <input
            className="cell-input"
            type="number"
            dir="ltr"
            lang="en"
            value={deductions.electricity_water}
            onChange={(e) => onChangeDeduction('electricity_water', e.target.value)}
          />
        </div>
        <div className="kv-row">
          <span className="kv-label">{t('review_salaries')}</span>
          <input
            className="cell-input"
            type="number"
            dir="ltr"
            lang="en"
            value={deductions.salaries}
            onChange={(e) => onChangeDeduction('salaries', e.target.value)}
          />
        </div>

        {/* Editable, addable list of "other payment" line items */}
        {otherDeductionTypes.map((dt) => {
          const row = otherDeductionData[dt.id] || { amount: 0 };
          return (
            <div className="kv-row" key={dt.id}>
              <input
                className="branch-name-input"
                style={{ maxWidth: 200 }}
                value={dt.name}
                onChange={(e) => onRenameOtherDeductionType(dt.id, e.target.value)}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  className="cell-input"
                  type="number"
                  dir="ltr"
                  lang="en"
                  value={row.amount}
                  onChange={(e) => onChangeOtherDeductionAmount(dt.id, e.target.value)}
                />
                <button className="remove-btn" onClick={() => onRemoveOtherDeductionType(dt.id)}>✕</button>
              </div>
            </div>
          );
        })}
      </div>
      <button className="add-row-btn" onClick={onAddOtherDeductionType}>
        {t('other_deductions_add_btn')}
      </button>
      <div className="final-banner">
        <span>{t('review_final_banner')}</span>
        <span>{fmtMoney(totals.finalMonthlyReview)}</span>
      </div>
    </div>
  );
}
