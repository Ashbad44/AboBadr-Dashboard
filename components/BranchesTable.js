'use client';

import { fmtMoney, toNumber } from '../lib/utils';

export default function BranchesTable({
  branches,
  branchData,
  onChangeCell,
  onRenameBranch,
  onAddBranch,
  onRemoveBranch,
}) {
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
    <div className="panel">
      <div className="panel-header">
        <div className="panel-icon" style={{ background: 'var(--teal-600)' }}>🏦</div>
        <h3 className="panel-title">Income Summary by Branch</h3>
      </div>
      <table className="grid-table">
        <thead>
          <tr>
            <th>Branch</th>
            <th className="right">Total Income</th>
            <th className="right">Total Expenses</th>
            <th className="right">Net Income</th>
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
                  <input
                    className="branch-name-input"
                    value={b.name}
                    onChange={(e) => onRenameBranch(b.id, e.target.value)}
                  />
                </td>
                <td className="right">
                  <input
                    className="cell-input"
                    type="number"
                    value={row.income}
                    onChange={(e) => onChangeCell(b.id, 'income', e.target.value)}
                  />
                </td>
                <td className="right">
                  <input
                    className="cell-input"
                    type="number"
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
            <td>Total</td>
            <td className="right">{fmtMoney(totals.income)}</td>
            <td className="right">{fmtMoney(totals.expenses)}</td>
            <td className="right">{fmtMoney(totalNet)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <button className="add-row-btn" onClick={onAddBranch}>+ Add branch</button>
    </div>
  );
}
