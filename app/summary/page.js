'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import {
  toNumber, fmtMoney, currentMonthValue, shiftMonth, pctChange, shortMonthLabel,
} from '../../lib/utils';
import Sidebar from '../../components/Sidebar';
import MonthPicker from '../../components/MonthPicker';
import PrintButton from '../../components/PrintButton';
import ExcelExportButton from '../../components/ExcelExportButton';
import SkeletonCards from '../../components/SkeletonCards';
import SkeletonPanel from '../../components/SkeletonPanel';
import ExecutiveKpiCard from '../../components/ExecutiveKpiCard';
import IncomeTrendLineChart from '../../components/IncomeTrendLineChart';
import BranchRankingList from '../../components/BranchRankingList';
import { useLabels } from '../../lib/LabelsContext';
import { exportToExcel } from '../../lib/excelExport';

export default function ExecutiveSummaryPage() {
  const router = useRouter();
  const { t, labels } = useLabels();

  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refMonth, setRefMonth] = useState(currentMonthValue());
  const [kpis, setKpis] = useState(null);
  const [trend, setTrend] = useState([]);
  const [branchRows, setBranchRows] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/login');
      else setCheckingSession(false);
    });
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);

    const current = refMonth;
    const lastMonth = shiftMonth(current, -1);
    const lastYear = shiftMonth(current, -12);
    const rangeStart = shiftMonth(current, -12);

    const { data: branches } = await supabase
      .from('branches')
      .select('*')
      .eq('archived', false)
      .order('sort_order', { ascending: true });

    const { data: rows } = await supabase
      .from('monthly_branch_data')
      .select('*')
      .gte('month', rangeStart)
      .lte('month', current);

    // Aggregate by month for the trend chart + KPI comparisons
    const byMonth = {};
    (rows || []).forEach((r) => {
      if (!byMonth[r.month]) byMonth[r.month] = { income: 0, expenses: 0 };
      byMonth[r.month].income += toNumber(r.income);
      byMonth[r.month].expenses += toNumber(r.expenses);
    });

    const thisM = byMonth[current] || { income: 0, expenses: 0 };
    const lastM = byMonth[lastMonth] || { income: 0, expenses: 0 };
    const lastY = byMonth[lastYear] || { income: 0, expenses: 0 };

    const thisNet = thisM.income - thisM.expenses;
    const lastNet = lastM.income - lastM.expenses;
    const lastYNet = lastY.income - lastY.expenses;

    setKpis({
      income: { value: thisM.income, mom: pctChange(thisM.income, lastM.income), yoy: pctChange(thisM.income, lastY.income) },
      expenses: { value: thisM.expenses, mom: pctChange(thisM.expenses, lastM.expenses), yoy: pctChange(thisM.expenses, lastY.expenses) },
      net: { value: thisNet, mom: pctChange(thisNet, lastNet), yoy: pctChange(thisNet, lastYNet) },
    });

    // 12-month income trend
    const trendData = [];
    for (let i = 11; i >= 0; i--) {
      const mv = shiftMonth(current, -i);
      trendData.push({ month: shortMonthLabel(mv), income: (byMonth[mv] || { income: 0 }).income });
    }
    setTrend(trendData);

    // Per-branch this month + last month (for growth rate)
    const branchResult = (branches || []).map((b) => {
      const thisRows = (rows || []).filter((r) => r.branch_id === b.id && r.month === current);
      const lastRows = (rows || []).filter((r) => r.branch_id === b.id && r.month === lastMonth);
      const income = thisRows.reduce((s, r) => s + toNumber(r.income), 0);
      const expenses = thisRows.reduce((s, r) => s + toNumber(r.expenses), 0);
      const net = income - expenses;
      const lastIncome = lastRows.reduce((s, r) => s + toNumber(r.income), 0);
      const lastExpenses = lastRows.reduce((s, r) => s + toNumber(r.expenses), 0);
      const lastNetB = lastIncome - lastExpenses;
      return {
        id: b.id,
        name: b.name,
        income,
        expenses,
        net,
        expenseRatio: income > 0 ? (expenses / income) * 100 : 0,
        growth: pctChange(net, lastNetB),
      };
    });
    setBranchRows(branchResult);

    setLoading(false);
  }, [refMonth]);

  useEffect(() => {
    if (!checkingSession) load();
  }, [checkingSession, refMonth, load]);

  if (checkingSession) return <div className="loading-screen">جارٍ التحميل…</div>;

  const textScale = parseInt(labels.ui_text_scale, 10) || 100;

  const topBranches = [...branchRows].sort((a, b) => b.net - a.net).slice(0, 3);
  const bottomBranches = [...branchRows].sort((a, b) => a.net - b.net).slice(0, 3);

  function handleExport() {
    exportToExcel('الملخص-التنفيذي', [
      {
        name: 'ملخص',
        rows: [
          { البند: t('exec_kpi_income'), القيمة: kpis?.income.value || 0 },
          { البند: t('exec_kpi_expenses'), القيمة: kpis?.expenses.value || 0 },
          { البند: t('exec_kpi_net'), القيمة: kpis?.net.value || 0 },
        ],
      },
      {
        name: 'اتجاه 12 شهر',
        rows: trend.map((r) => ({ الشهر: r.month, الإيرادات: r.income })),
      },
      {
        name: 'ترتيب الفروع',
        rows: branchRows.map((b) => ({
          الفرع: b.name,
          الإيرادات: b.income,
          المصروفات: b.expenses,
          الصافي: b.net,
          'نسبة المصروفات %': b.expenseRatio.toFixed(1),
          'نسبة النمو %': b.growth.toFixed(1),
        })),
      },
    ]);
  }

  return (
    <div className="app-shell" style={{ zoom: `${textScale}%` }}>
      <Sidebar />
      <div className="main">
        <div className="top-row">
          <div>
            <h1 className="page-title">{t('exec_summary_title')}</h1>
            <p className="page-subtitle">{t('exec_summary_subtitle')}</p>
          </div>
          <MonthPicker value={refMonth} onChange={setRefMonth} />
        </div>

        {loading ? (
          <>
            <SkeletonCards count={3} />
            <SkeletonPanel rows={6} />
            <SkeletonPanel rows={5} />
          </>
        ) : (
          <div className="tab-page fade-in-transition" key={refMonth}>
            <div className="cards-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              <ExecutiveKpiCard
                icon="💼" color="var(--teal-600)"
                title={t('exec_kpi_income')} value={kpis.income.value}
                momChange={kpis.income.mom} momLabel={t('exec_vs_last_month')}
                yoyChange={kpis.income.yoy} yoyLabel={t('exec_vs_last_year')}
              />
              <ExecutiveKpiCard
                icon="🧾" color="var(--orange-500)"
                title={t('exec_kpi_expenses')} value={kpis.expenses.value}
                momChange={kpis.expenses.mom} momLabel={t('exec_vs_last_month')}
                yoyChange={kpis.expenses.yoy} yoyLabel={t('exec_vs_last_year')}
              />
              <ExecutiveKpiCard
                icon="📈" color="var(--green-600)"
                title={t('exec_kpi_net')} value={kpis.net.value}
                momChange={kpis.net.mom} momLabel={t('exec_vs_last_month')}
                yoyChange={kpis.net.yoy} yoyLabel={t('exec_vs_last_year')}
              />
            </div>

            <div className="panel panel-large">
              <div className="panel-header">
                <div className="panel-icon" style={{ background: 'var(--teal-500)' }}>📊</div>
                <h3 className="panel-title">{t('exec_trend_chart_title')}</h3>
              </div>
              <IncomeTrendLineChart data={trend} />
            </div>

            <div className="panels-grid">
              <div className="panel panel-large">
                <div className="panel-header">
                  <div className="panel-icon" style={{ background: 'var(--green-600)' }}>🥇</div>
                  <h3 className="panel-title">{t('exec_top_branches_title')}</h3>
                </div>
                <table className="grid-table">
                  <tbody>
                    {topBranches.map((b) => (
                      <tr key={b.id}>
                        <td>{b.name}</td>
                        <td className="right">{fmtMoney(b.net)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="panel panel-large">
                <div className="panel-header">
                  <div className="panel-icon" style={{ background: '#c0392b' }}>⚠️</div>
                  <h3 className="panel-title">{t('exec_bottom_branches_title')}</h3>
                </div>
                <table className="grid-table">
                  <tbody>
                    {bottomBranches.map((b) => (
                      <tr key={b.id}>
                        <td>{b.name}</td>
                        <td className="right">{fmtMoney(b.net)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <BranchRankingList branches={branchRows} />

            <div className="action-buttons-row">
              <PrintButton />
              <ExcelExportButton onClick={handleExport} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
