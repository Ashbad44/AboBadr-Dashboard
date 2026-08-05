'use client';

import { fmtMoney } from '../lib/utils';
import { useLabels } from '../lib/LabelsContext';

export default function DeductionsPanel({ totals, deductions, onChangeDeduction }) {
  const { t } = useLabels();

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <div className="panel-icon" style={{ background: 'var(--orange-500)' }}>📋</div>
          <h3 className="panel-title">{t('deductions_panel_title')}</h3>
        </div>
        <div className="kv-list">
          <div className="kv-row">
            <span className="kv-label">{t('deductions_income_before')}</span>
            <span>{fmtMoney(totals.incomeBeforeDeductions)}</span>
          </div>
          <div className="kv-row">
            <span className="kv-label">{t('deductions_other')}</span>
            <input
              className="cell-input"
              type="number"
              dir="ltr"
              value={deductions.other_deduction}
              onChange={(e) => onChangeDeduction('other_deduction', e.target.value)}
            />
          </div>
          <div className="kv-row highlight">
            <span className="kv-label">{t('deductions_final_income')}</span>
            <span>{fmtMoney(totals.finalTotalIncome)}</span>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-icon" style={{ background: 'var(--green-600)' }}>👁️</div>
          <h3 className="panel-title">{t('review_panel_title')}</h3>
        </div>
        <div className="kv-list">
          <div className="kv-row">
            <span className="kv-label">{t('review_from_upper_table')}</span>
            <span>{fmtMoney(totals.finalTotalIncome)}</span>
          </div>
          <div className="kv-row">
            <span className="kv-label">{t('review_electricity_water')}</span>
            <input
              className="cell-input"
              type="number"
              dir="ltr"
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
              value={deductions.salaries}
              onChange={(e) => onChangeDeduction('salaries', e.target.value)}
            />
          </div>
          <div className="kv-row">
            <span className="kv-label">{t('review_other_payment')}</span>
            <input
              className="cell-input"
              type="number"
              dir="ltr"
              value={deductions.other_payment}
              onChange={(e) => onChangeDeduction('other_payment', e.target.value)}
            />
          </div>
        </div>
        <div className="final-banner">
          <span>{t('review_final_banner')}</span>
          <span>{fmtMoney(totals.finalMonthlyReview)}</span>
        </div>
      </div>
    </>
  );
}
