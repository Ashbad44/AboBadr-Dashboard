'use client';

import { fmtMoney, toNumber } from '../lib/utils';
import { useLabels } from '../lib/LabelsContext';
import StyledLabel from './StyledLabel';
import StyleToolbar from './StyleToolbar';
import { useTextStyles, styleToCss } from '../lib/TextStylesContext';

export default function BranchesTable({
  branches,
  branchData,
  onChangeCell,
  onRenameBranch,
  onAddBranch,
  onRemoveBranch,
}) {
  const { t } = useLabels();
  const { getStyle } = useTextStyles();
  const ls = (key) => styleToCss(getStyle('label', key));

  const totals = branches.reduce(
    (acc, b) => {
      const row = branchData[b.id] || { income: 0, expenses: 0 };
      acc.income += toNumber(row.income);
      acc.expenses += toNumber(row.expenses);
      return acc;
    },
    { income: 0, expenses: 0 }
  );
  const totalNet = totals.income - totals.expenses;

  return (
    <div className="panel branches-panel">
      <div className="panel-header">
        <div className="panel-icon" style={{ background: 'var(--teal-600)' }}>🏦</div>
        <StyledLabel type="label" id="branches_panel_title" text={t('branches_panel_title')} as="h3" className="panel-title" />
      </div>
      <table className="grid-table">
        <thead>
          <tr>
            <th style={ls('branches_col_branch')}>{t('branches_col_branch')}</th>
            <th className="right" style={ls('branches_col_income')}>{t('branches_col_income')}</th>
            <th className="right" style={ls('branches_col_expenses')}>{t('branches_col_expenses')}</th>
            <th className="right" style={ls('branches_col_net')}>{t('branches_col_net')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {branches.map((b) => {
            const row = branchData[b.id] || { income: 0, expenses: 0 };
            const net = toNumber(row.income) - toNumber(row.expenses);
            return (
              <tr key={b.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      className="branch-name-input"
                      value={b.name}
                      onChange={(e) => onRenameBranch(b.id, e.target.value)}
                      style={styleToCss(getStyle('branch', b.id))}
                    />
                    <StyleToolbar type="branch" id={b.id} />
                  </div>
                </td>
                <td className="right">
                  <input
                    className="cell-input"
                    type="text"
                    inputMode="decimal"
                    dir="ltr"
                    lang="en"
                    value={row.income}
                    onChange={(e) => onChangeCell(b.id, 'income', e.target.value)}
                  />
                </td>
                <td className="right">
                  <input
                    className="cell-input"
                    type="text"
                    inputMode="decimal"
                    dir="ltr"
                    lang="en"
                    value={row.expenses}
                    onChange={(e) => onChangeCell(b.id, 'expenses', e.target.value)}
                  />
                </td>
                <td className="right">{fmtMoney(net)}</td>
                <td>
                  <button className="remove-btn" onClick={() => onRemoveBranch(b.id)}>✕</button>
                </td>
              </tr>
            );
          })}
          <tr className="total-row">
            <td style={ls('branches_total_row')}>{t('branches_total_row')}</td>
            <td className="right">{fmtMoney(totals.income)}</td>
            <td className="right">{fmtMoney(totals.expenses)}</td>
            <td className="right">{fmtMoney(totalNet)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <button className="add-row-btn" onClick={onAddBranch} style={ls('branches_add_btn')}>{t('branches_add_btn')}</button>
    </div>
  );
}
