'use client';

import { fmtMoney } from '../lib/utils';
import { useLabels } from '../lib/LabelsContext';
import StyledLabel from './StyledLabel';
import StyleToolbar from './StyleToolbar';
import { useTextStyles, styleToCss } from '../lib/TextStylesContext';

export default function FinalReviewPanel({
  totals,
  deductions,
  onChangeDeduction,
  otherDeductions,
  onChangeOtherDeductionAmount,
  onRenameOtherDeductionType,
  onAddOtherDeductionType,
  onRemoveOtherDeductionType,
}) {
  const { t } = useLabels();
  const { getStyle } = useTextStyles();
  const ls = (key) => styleToCss(getStyle('label', key));

  return (
    <div className="panel panel-large review-panel">
      <div className="panel-header">
        <div className="panel-icon" style={{ background: 'var(--green-600)' }}>👁️</div>
        <StyledLabel type="label" id="review_panel_title" text={t('review_panel_title')} as="h3" className="panel-title" />
      </div>
      <div className="kv-list">
        <div className="kv-row">
          <span className="kv-label" style={ls('review_from_upper_table')}>{t('review_from_upper_table')}</span>
          <span>{fmtMoney(totals.incomeBeforeDeductions)}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label" style={ls('review_electricity_water')}>{t('review_electricity_water')}</span>
          <input
            className="cell-input"
            type="text"
                    inputMode="decimal"
            dir="ltr"
            lang="en"
            value={deductions.electricity_water}
            onChange={(e) => onChangeDeduction('electricity_water', e.target.value)}
          />
        </div>
        <div className="kv-row">
          <span className="kv-label" style={ls('review_salaries')}>{t('review_salaries')}</span>
          <input
            className="cell-input"
            type="text"
                    inputMode="decimal"
            dir="ltr"
            lang="en"
            value={deductions.salaries}
            onChange={(e) => onChangeDeduction('salaries', e.target.value)}
          />
        </div>
        <div className="kv-row">
          <span className="kv-label" style={ls('review_salary_handover')}>{t('review_salary_handover')}</span>
          <input
            className="cell-input"
            type="text"
            inputMode="decimal"
            dir="ltr"
            lang="en"
            value={deductions.salary_handover}
            onChange={(e) => onChangeDeduction('salary_handover', e.target.value)}
          />
        </div>
        <div className="kv-row">
          <span className="kv-label" style={ls('review_government_fees')}>{t('review_government_fees')}</span>
          <input
            className="cell-input"
            type="text"
            inputMode="decimal"
            dir="ltr"
            lang="en"
            value={deductions.government_fees}
            onChange={(e) => onChangeDeduction('government_fees', e.target.value)}
          />
        </div>

        {/* Editable, addable list of "other payment" line items — scoped to this month only */}
        {otherDeductions.map((d) => (
            <div className="kv-row" key={d.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  className="branch-name-input"
                  style={{ maxWidth: 180, ...styleToCss(getStyle('other_deduction_type', d.id)) }}
                  value={d.name}
                  onChange={(e) => onRenameOtherDeductionType(d.id, e.target.value)}
                />
                <StyleToolbar type="other_deduction_type" id={d.id} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  className="cell-input"
                  type="text"
                  inputMode="decimal"
                  dir="ltr"
                  lang="en"
                  value={d.amount}
                  onChange={(e) => onChangeOtherDeductionAmount(d.id, e.target.value)}
                />
                <button className="remove-btn" onClick={() => onRemoveOtherDeductionType(d.id)}>✕</button>
              </div>
            </div>
        ))}
      </div>
      <button className="add-row-btn" onClick={onAddOtherDeductionType} style={ls('other_deductions_add_btn')}>
        {t('other_deductions_add_btn')}
      </button>
      <div className="final-banner">
        <span style={ls('review_final_banner')}>{t('review_final_banner')}</span>
        <span>{fmtMoney(totals.finalMonthlyReview)}</span>
      </div>
    </div>
  );
}
