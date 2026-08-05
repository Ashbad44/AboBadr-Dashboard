'use client';

import { fmtMoney } from '../lib/utils';

export default function DeductionsPanel({ totals, deductions, onChangeDeduction }) {
  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <div className="panel-icon" style={{ background: 'var(--orange-500)' }}>📋</div>
          <h3 className="panel-title">Income & Deductions Overview</h3>
        </div>
        <div className="kv-list">
          <div className="kv-row">
            <span className="kv-label">Total Income Before Other Deductions</span>
            <span>{fmtMoney(totals.incomeBeforeDeductions)}</span>
          </div>
          <div className="kv-row">
            <span className="kv-label">Other Deduction</span>
            <input
              className="cell-input"
              type="number"
              value={deductions.other_deduction}
              onChange={(e) => onChangeDeduction('other_deduction', e.target.value)}
            />
          </div>
          <div className="kv-row highlight">
            <span className="kv-label">Final Total Income</span>
            <span>{fmtMoney(totals.finalTotalIncome)}</span>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-icon" style={{ background: 'var(--green-600)' }}>👁️</div>
          <h3 className="panel-title">Final Monthly Review</h3>
        </div>
        <div className="kv-list">
          <div className="kv-row">
            <span className="kv-label">From the Upper Table</span>
            <span>{fmtMoney(totals.finalTotalIncome)}</span>
          </div>
          <div className="kv-row">
            <span className="kv-label">Electricity and Water Bill</span>
            <input
              className="cell-input"
              type="number"
              value={deductions.electricity_water}
              onChange={(e) => onChangeDeduction('electricity_water', e.target.value)}
            />
          </div>
          <div className="kv-row">
            <span className="kv-label">Salaries</span>
            <input
              className="cell-input"
              type="number"
              value={deductions.salaries}
              onChange={(e) => onChangeDeduction('salaries', e.target.value)}
            />
          </div>
          <div className="kv-row">
            <span className="kv-label">Other Payment</span>
            <input
              className="cell-input"
              type="number"
              value={deductions.other_payment}
              onChange={(e) => onChangeDeduction('other_payment', e.target.value)}
            />
          </div>
        </div>
        <div className="final-banner">
          <span>Final Total Income + Electricity, Water, Salaries & Other Payments</span>
          <span>{fmtMoney(totals.finalMonthlyReview)}</span>
        </div>
      </div>
    </>
  );
}
