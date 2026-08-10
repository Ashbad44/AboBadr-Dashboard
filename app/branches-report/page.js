'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { toNumber, fmtMoney } from '../../lib/utils';
import Sidebar from '../../components/Sidebar';
import YearPicker from '../../components/YearPicker';
import BranchesCompareChart from '../../components/BranchesCompareChart';
import PrintButton from '../../components/PrintButton';
import { useLabels } from '../../lib/LabelsContext';
import { useTextStyles, styleToCss } from '../../lib/TextStylesContext';

export default function BranchesReportPage() {
  const router = useRouter();
  const { t, labels } = useLabels();
  const { getStyle } = useTextStyles();
  const ls = (key) => styleToCss(getStyle('label', key));

  const [checkingSession, setCheckingSession] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/login');
      else setCheckingSession(false);
    });
  }, [router]);

  const loadYear = useCallback(async (y) => {
    setLoading(true);
    const start = `${y}-01-01`;
    const end = `${y}-12-01`;

    const { data: branches } = await supabase
      .from('branches')
      .select('*')
      .eq('archived', false)
      .order('sort_order', { ascending: true });

    const { data: branchData } = await supabase
      .from('monthly_branch_data')
      .select('*')
      .gte('month', start)
      .lte('month', end);

    const result = (branches || []).map((b) => {
      const matching = (branchData || []).filter((r) => r.branch_id === b.id);
      const income = matching.reduce((s, r) => s + toNumber(r.income), 0);
      const expenses = matching.reduce((s, r) => s + toNumber(r.expenses), 0);
      return { id: b.id, name: b.name, income, expenses, net: income - expenses };
    });

    setRows(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!checkingSession) loadYear(year);
  }, [checkingSession, year, loadYear]);

  const textScale = parseInt(labels.ui_text_scale, 10) || 100;

  if (checkingSession) return <div className="loading-screen">جارٍ التحميل…</div>;

  const totals = rows.reduce((acc, r) => ({
    income: acc.income + r.income,
    expenses: acc.expenses + r.expenses,
    net: acc.net + r.net,
  }), { income: 0, expenses: 0, net: 0 });

  return (
    <div className="app-shell" style={{ zoom: `${textScale}%` }}>
      <Sidebar />
      <div className="main">
        <div className="top-row">
          <div>
            <h1 className="page-title" style={ls('branches_report_title')}>{t('branches_report_title')}</h1>
            <p className="page-subtitle" style={ls('branches_report_subtitle')}>{t('branches_report_subtitle')}</p>
          </div>
          <div className="top-controls">
            <YearPicker value={year} onChange={setYear} />
            <span className="print-month-label">{year}</span>
          </div>
        </div>

        {loading ? (
          <div className="loading-screen" style={{ minHeight: 200 }}>جارٍ التحميل…</div>
        ) : (
          <div className="tab-page">
            <div className="panel panel-large">
              <div className="panel-header">
                <div className="panel-icon" style={{ background: 'var(--teal-500)' }}>📊</div>
                <h3 className="panel-title" style={ls('branches_report_chart_title')}>{t('branches_report_chart_title')}</h3>
              </div>
              <BranchesCompareChart
                data={rows.map((r) => ({ branch: r.name, income: r.income, expenses: r.expenses, net: r.net }))}
                labels={{
                  income: t('annual_chart_income'),
                  expenses: t('annual_chart_expenses'),
                  net: t('annual_chart_net'),
                }}
              />
            </div>

            <div className="panel panel-large">
              <table className="grid-table">
                <thead>
                  <tr>
                    <th style={ls('branches_report_col_branch')}>{t('branches_report_col_branch')}</th>
                    <th className="right" style={ls('branches_report_col_income')}>{t('branches_report_col_income')}</th>
                    <th className="right" style={ls('branches_report_col_expenses')}>{t('branches_report_col_expenses')}</th>
                    <th className="right" style={ls('branches_report_col_net')}>{t('branches_report_col_net')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td className="right">{fmtMoney(r.income)}</td>
                      <td className="right">{fmtMoney(r.expenses)}</td>
                      <td className="right">{fmtMoney(r.net)}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td style={ls('branches_report_total_row')}>{t('branches_report_total_row')}</td>
                    <td className="right">{fmtMoney(totals.income)}</td>
                    <td className="right">{fmtMoney(totals.expenses)}</td>
                    <td className="right">{fmtMoney(totals.net)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <PrintButton />
          </div>
        )}
      </div>
    </div>
  );
}
