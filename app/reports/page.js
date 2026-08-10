'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { toNumber, fmtMoney, shortMonthLabel } from '../../lib/utils';
import Sidebar from '../../components/Sidebar';
import YearPicker from '../../components/YearPicker';
import AnnualTrendChart from '../../components/AnnualTrendChart';
import PrintButton from '../../components/PrintButton';
import { useLabels } from '../../lib/LabelsContext';
import { useTextStyles, styleToCss } from '../../lib/TextStylesContext';

export default function AnnualReportPage() {
  const router = useRouter();
  const { t, labels } = useLabels();
  const { getStyle } = useTextStyles();
  const ls = (key) => styleToCss(getStyle('label', key));

  const [checkingSession, setCheckingSession] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [monthlyRows, setMonthlyRows] = useState([]);
  const [totals, setTotals] = useState({
    totalIncome: 0, totalExpenses: 0, netIncome: 0, totalDeduction: 0, finalIncome: 0,
  });

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

    const { data: branchRows } = await supabase
      .from('monthly_branch_data')
      .select('*')
      .gte('month', start)
      .lte('month', end);

    const { data: dedRows } = await supabase
      .from('monthly_deductions')
      .select('*')
      .gte('month', start)
      .lte('month', end);

    const monthMap = {};
    for (let m = 1; m <= 12; m++) {
      const value = `${y}-${String(m).padStart(2, '0')}-01`;
      monthMap[value] = { month: shortMonthLabel(value), income: 0, expenses: 0, net: 0 };
    }
    (branchRows || []).forEach((r) => {
      if (!monthMap[r.month]) return;
      monthMap[r.month].income += toNumber(r.income);
      monthMap[r.month].expenses += toNumber(r.expenses);
    });
    Object.values(monthMap).forEach((m) => { m.net = m.income - m.expenses; });

    const totalIncome = (branchRows || []).reduce((s, r) => s + toNumber(r.income), 0);
    const totalExpenses = (branchRows || []).reduce((s, r) => s + toNumber(r.expenses), 0);
    const netIncome = totalIncome - totalExpenses;
    const totalDeduction = (dedRows || []).reduce((s, r) => s + toNumber(r.other_deduction), 0);
    const finalIncome = netIncome - totalDeduction;

    setMonthlyRows(Object.values(monthMap));
    setTotals({ totalIncome, totalExpenses, netIncome, totalDeduction, finalIncome });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!checkingSession) loadYear(year);
  }, [checkingSession, year, loadYear]);

  const textScale = parseInt(labels.ui_text_scale, 10) || 100;

  if (checkingSession) return <div className="loading-screen">جارٍ التحميل…</div>;

  const cards = [
    { key: 'annual_card_total_income', value: totals.totalIncome, color: 'var(--teal-600)', icon: '💼' },
    { key: 'annual_card_total_expenses', value: totals.totalExpenses, color: 'var(--orange-500)', icon: '🧾' },
    { key: 'annual_card_net_income', value: totals.netIncome, color: 'var(--green-600)', icon: '📈' },
    { key: 'annual_card_deduction', value: totals.totalDeduction, color: 'var(--blue-500)', icon: '⬇️' },
    { key: 'annual_card_final_income', value: totals.finalIncome, color: 'var(--teal-900)', icon: '💰' },
  ];

  return (
    <div className="app-shell" style={{ zoom: `${textScale}%` }}>
      <Sidebar />
      <div className="main">
        <div className="top-row">
          <div>
            <h1 className="page-title" style={ls('annual_report_title')}>{t('annual_report_title')}</h1>
            <p className="page-subtitle" style={ls('annual_report_subtitle')}>{t('annual_report_subtitle')}</p>
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
            <div className="cards-row">
              {cards.map((c, i) => (
                <div className={`stat-card ${i === cards.length - 1 ? 'highlight-card' : ''}`} key={c.key}>
                  <div className="stat-icon" style={{ background: c.color }}>{c.icon}</div>
                  <div>
                    <p className="stat-title" style={ls(c.key)}>{t(c.key)}</p>
                    <p className="stat-value">{fmtMoney(c.value)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="panel panel-large">
              <div className="panel-header">
                <div className="panel-icon" style={{ background: 'var(--teal-500)' }}>📊</div>
                <h3 className="panel-title" style={ls('annual_chart_title')}>{t('annual_chart_title')}</h3>
              </div>
              <AnnualTrendChart
                data={monthlyRows}
                labels={{
                  income: t('annual_chart_income'),
                  expenses: t('annual_chart_expenses'),
                  net: t('annual_chart_net'),
                }}
              />
            </div>
            <PrintButton />
          </div>
        )}
      </div>
    </div>
  );
}
