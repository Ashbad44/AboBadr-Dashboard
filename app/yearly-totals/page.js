'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { toNumber, fmtMoney } from '../../lib/utils';
import Sidebar from '../../components/Sidebar';
import PrintButton from '../../components/PrintButton';
import ExcelExportButton from '../../components/ExcelExportButton';
import SkeletonPanel from '../../components/SkeletonPanel';
import { useLabels } from '../../lib/LabelsContext';
import { useTextStyles, styleToCss } from '../../lib/TextStylesContext';
import { exportToExcel } from '../../lib/excelExport';

// Rows shown in the table. Earliest year the app supports data for.
const FIRST_YEAR = 2010;

const FIELDS = [
  { key: 'total_income', labelKey: 'annual_card_total_income' },
  { key: 'total_expenses', labelKey: 'annual_card_total_expenses' },
  { key: 'net_income', labelKey: 'annual_card_net_income' },
  { key: 'total_deduction', labelKey: 'annual_card_deduction' },
  { key: 'final_income', labelKey: 'annual_card_final_income' },
];

const EMPTY_ROW = {
  total_income: 0, total_expenses: 0, net_income: 0, total_deduction: 0, final_income: 0,
};

export default function YearlyTotalsPage() {
  const router = useRouter();
  const { t, labels } = useLabels();
  const { getStyle } = useTextStyles();
  const ls = (key) => styleToCss(getStyle('label', key));

  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(true);
  const [autoRows, setAutoRows] = useState({});   // { year: {...} } — from dashboard data
  const [manualRows, setManualRows] = useState({}); // { year: {...} } — typed by hand
  const [saving, setSaving] = useState(false);

  const saveTimer = useRef(null);
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= FIRST_YEAR; y--) years.push(y);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/login');
      else setCheckingSession(false);
    });
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);

    // All dashboard data across every year we display
    const { data: branchData } = await supabase
      .from('monthly_branch_data')
      .select('month, income, expenses');

    const { data: dedData } = await supabase
      .from('monthly_deductions')
      .select('month, other_deduction');

    // Aggregate dashboard data per calendar year
    const auto = {};
    (branchData || []).forEach((r) => {
      const y = Number(String(r.month).slice(0, 4));
      if (!auto[y]) auto[y] = { ...EMPTY_ROW, _hasData: false };
      auto[y].total_income += toNumber(r.income);
      auto[y].total_expenses += toNumber(r.expenses);
      auto[y]._hasData = true;
    });
    (dedData || []).forEach((r) => {
      const y = Number(String(r.month).slice(0, 4));
      if (!auto[y]) auto[y] = { ...EMPTY_ROW, _hasData: false };
      auto[y].total_deduction += toNumber(r.other_deduction);
      auto[y]._hasData = true;
    });
    Object.values(auto).forEach((row) => {
      row.net_income = row.total_income - row.total_expenses;
      row.final_income = row.net_income - row.total_deduction;
    });
    setAutoRows(auto);

    // Manual figures for years with no dashboard data
    const { data: manual } = await supabase.from('yearly_manual_totals').select('*');
    const manualMap = {};
    (manual || []).forEach((r) => {
      manualMap[r.year] = {
        total_income: r.total_income,
        total_expenses: r.total_expenses,
        net_income: r.net_income,
        total_deduction: r.total_deduction,
        final_income: r.final_income,
      };
    });
    setManualRows(manualMap);

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!checkingSession) load();
  }, [checkingSession, load]);

  // A year is "automatic" when the dashboard has any data for it.
  function isAuto(year) {
    return !!(autoRows[year] && autoRows[year]._hasData);
  }

  // Value shown for a given year/field — dashboard data wins, manual otherwise.
  function valueFor(year, field) {
    if (isAuto(year)) return toNumber(autoRows[year][field]);
    return toNumber((manualRows[year] || {})[field]);
  }

  function handleManualChange(year, field, value) {
    setManualRows((prev) => {
      const next = { ...prev, [year]: { ...EMPTY_ROW, ...(prev[year] || {}), [field]: value } };

      setSaving(true);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        const row = next[year];
        await supabase.from('yearly_manual_totals').upsert({
          year,
          total_income: toNumber(row.total_income),
          total_expenses: toNumber(row.total_expenses),
          net_income: toNumber(row.net_income),
          total_deduction: toNumber(row.total_deduction),
          final_income: toNumber(row.final_income),
        }, { onConflict: 'year' });
        setSaving(false);
      }, 600);

      return next;
    });
  }

  const grandTotals = FIELDS.reduce((acc, f) => {
    acc[f.key] = years.reduce((sum, y) => sum + valueFor(y, f.key), 0);
    return acc;
  }, {});

  function handleExport() {
    exportToExcel('اجمالي-الدخل-للسنوات', [
      {
        name: 'السنوات',
        rows: [
          ...years.map((y) => {
            const row = { [t('yearly_totals_col_year')]: y };
            FIELDS.forEach((f) => { row[t(f.labelKey)] = valueFor(y, f.key); });
            return row;
          }),
          (() => {
            const row = { [t('yearly_totals_col_year')]: t('yearly_totals_total_row') };
            FIELDS.forEach((f) => { row[t(f.labelKey)] = grandTotals[f.key]; });
            return row;
          })(),
        ],
      },
    ]);
  }

  if (checkingSession) return <div className="loading-screen">جارٍ التحميل…</div>;

  const textScale = parseInt(labels.ui_text_scale, 10) || 100;

  return (
    <div className="app-shell" style={{ zoom: `${textScale}%` }}>
      <Sidebar />
      <div className="main">
        <div className="top-row">
          <div>
            <h1 className="page-title" style={ls('yearly_totals_title')}>{t('yearly_totals_title')}</h1>
            <p className="page-subtitle" style={ls('yearly_totals_subtitle')}>
              {t('yearly_totals_subtitle')}{saving ? ` ${t('saving_note')}` : ''}
            </p>
          </div>
        </div>

        {loading ? (
          <SkeletonPanel rows={8} />
        ) : (
          <div className="tab-page fade-in-transition">
            <div className="panel panel-large yearly-totals-panel">
              <div className="panel-header">
                <div className="panel-icon" style={{ background: 'var(--teal-900)' }}>📆</div>
                <h3 className="panel-title" style={ls('yearly_totals_title')}>{t('yearly_totals_title')}</h3>
              </div>

              <table className="grid-table">
                <thead>
                  <tr>
                    <th style={ls('yearly_totals_col_year')}>{t('yearly_totals_col_year')}</th>
                    {FIELDS.map((f) => (
                      <th className="right" key={f.key} style={ls(f.labelKey)}>{t(f.labelKey)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {years.map((y) => {
                    const auto = isAuto(y);
                    return (
                      <tr key={y} className={auto ? 'auto-year-row' : ''}>
                        <td dir="ltr" style={{ fontWeight: 700 }}>{y}</td>
                        {FIELDS.map((f) => (
                          <td className="right" key={f.key}>
                            {auto ? (
                              fmtMoney(autoRows[y][f.key])
                            ) : (
                              <input
                                className="cell-input"
                                type="text"
                                inputMode="decimal"
                                dir="ltr"
                                lang="en"
                                value={(manualRows[y] || {})[f.key] ?? ''}
                                onChange={(e) => handleManualChange(y, f.key, e.target.value)}
                              />
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  <tr className="total-row">
                    <td style={ls('yearly_totals_total_row')}>{t('yearly_totals_total_row')}</td>
                    {FIELDS.map((f) => (
                      <td className="right" key={f.key}>{fmtMoney(grandTotals[f.key])}</td>
                    ))}
                  </tr>
                </tbody>
              </table>

              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
                {t('yearly_totals_auto_note')} · {t('yearly_totals_manual_note')}
              </p>
            </div>

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
