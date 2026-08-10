'use client';

import { fmtMoney } from '../lib/utils';
import { useLabels } from '../lib/LabelsContext';
import StyledLabel from './StyledLabel';
import { useTextStyles, styleToCss } from '../lib/TextStylesContext';

export default function DeductionsOverviewPanel({ totals, deductions, onChangeDeduction }) {
  const { t } = useLabels();
  const { getStyle } = useTextStyles();
  const ls = (key) => styleToCss(getStyle('label', key));

  return (
    <div className="panel panel-large deductions-panel">
      <div className="panel-header">
        <div className="panel-icon" style={{ background: 'var(--orange-500)' }}>📋</div>
        <StyledLabel type="label" id="deductions_panel_title" text={t('deductions_panel_title')} as="h3" className="panel-title" />
      </div>
      <div className="kv-list">
        <div className="kv-row">
          <span className="kv-label" style={ls('deductions_income_before')}>{t('deductions_income_before')}</span>
          <span>{fmtMoney(totals.incomeBeforeDeductions)}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label" style={ls('deductions_other')}>{t('deductions_other')}</span>
          <input
            className="cell-input"
            type="text"
                    inputMode="decimal"
            dir="ltr"
            lang="en"
            value={deductions.other_deduction}
            onChange={(e) => onChangeDeduction('other_deduction', e.target.value)}
          />
        </div>
        <div className="kv-row highlight">
          <span className="kv-label" style={ls('deductions_final_income')}>{t('deductions_final_income')}</span>
          <span>{fmtMoney(totals.finalTotalIncome)}</span>
        </div>
      </div>
    </div>
  );
}
