'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { toNumber, fmtMoney, pctChange } from '../../lib/utils';
import Sidebar from '../../components/Sidebar';
import BranchPicker from '../../components/BranchPicker';
import AnnualTrendChart from '../../components/AnnualTrendChart';
import PrintButton from '../../components/PrintButton';
import ExcelExportButton from '../../components/ExcelExportButton';
import SkeletonCards from '../../components/SkeletonCards';
import SkeletonPanel from '../../components/SkeletonPanel';
import { useLabels } from '../../lib/LabelsContext';
import { useTextStyles, styleToCss } from '../../lib/TextStylesContext';
import { exportToExcel } from '../../lib/excelExport';

const FIRST_YEAR = 2010;

export default function BranchNetIncomePage() {
  const router = useRouter();
  const { t, labels } = useLabels();
  const { getStyle } = useTextStyles();
  const ls = (key) => styleToCss(getStyle('label', key));

  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [autoByYear, setAutoByYear] = useState({});   // { year: { net, hasData } } — from تقرير الفروع's source data
  const [manualByYear, setManualByYear] = useState({}); // { year: netIncome } — typed by hand
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

  // Load the branch list once, and default to the first branch.
  useEffect(() => {
    if (checkingSession) return;
    (async () => {
      const { data } = await supabase
        .from('branches')
        .select('*')
        .eq('archived', false)
        .order('sort_order', { ascending: true });
      setBranches(data || []);
      if (data && data.length > 0) setSelectedBranchId((prev) => prev || data[0].id);
    })();
  }, [checkingSession]);

  const loadBranchData = useCallback(async (branchId) => {
    if (!branchId) return;
    setLoading(true);

    // Same source تقرير الفروع reads from — monthly_branch_data for this branch.
    const { data: rows } = await supabase
      .from('monthly_branch_data')
      .select('month, income, expenses')
      .eq('branch_id', branchId);

    const auto = {};
    (rows || []).forEach((r) => {
      const y = Number(String(r.month).slice(0, 4));
      if (!auto[y]) auto[y] = { net: 0, hasData: false };
      auto[y].net += toNumber(r.income) - toNumber(r.expenses);
      auto[y].hasData = true;
    });
    setAutoByYear(auto);

    const { data: manual } = await supabase
      .from('branch_yearly_manual_net')
      .select('*')
      .eq('branch_id', branchId);
    const manualMap = {};
    (manual || []).forEach((r) => { manualMap[r.year] = r.net_income; });
    setManualByYear(manualMap);

    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedBranchId) loadBranchData(selectedBranchId);
  }, [selectedBranchId, loadBranchData]);

  function isAuto(year) {
    return !!(autoByYear[year] && autoByYear[year].hasData);
  }

  function valueFor(year) {
    if (isAuto(year)) return toNumber(autoByYear[year].net);
    return toNumber(manualByYear[year]);
  }

  function hasAnyValue(year) {
    return isAuto(year) || manualByYear[year] !== undefined;
  }

  function handleManualChange(year, value) {
    setManualByYear((prev) => {
      const next = { ...prev, [year]: value };

      setSaving(true);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        await supabase.from('branch_yearly_manual_net').upsert({
          branch_id: selectedBranchId,
          year,
          net_income: toNumber(value),
        }, { onConflict: 'branch_id,year' });
        setSaving(false);
      }, 600);

      return next;
    });
  }

  if (checkingSession) return <div className="loading-screen">جارٍ التحميل…</div>;

  const textScale = parseInt(labels.ui_text_scale, 10) || 100;
  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  // --- derived KPIs ---
  const yearsWithData = years.filter((y) => hasAnyValue(y));
  const totalNet = yearsWithData.reduce((sum, y) => sum + valueFor(y), 0);
  const currentYearNet = hasAnyValue(currentYear) ? valueFor(currentYear) : 0;
  const previousYearNet = hasAnyValue(currentYear - 1) ? valueFor(currentYear - 1) : 0;
  const yoy = pctChange(currentYearNet, previousYearNet);

  // --- chart data, oldest to newest ---
  const chartData = [...years].reverse()
    .filter((y) => hasAnyValue(y))
    .map((y) => ({ month: String(y), net: valueFor(y) }));

  function handleExport() {
    exportToExcel(`صافي-الدخل-${selectedBranch ? selectedBranch.name : ''}`, [
      {
        name: 'السنوات',
        rows: [
          ...years.filter((y) => hasAnyValue(y)).map((y) => ({
            [t('bni_col_year')]: y,
            [t('bni_col_net')]: valueFor(y),
            [t('bni_col_type')]: isAuto(y) ? t('bni_badge_auto') : t('bni_badge_manual'),
          })),
          { [t('bni_col_year')]: t('bni_total_row'), [t('bni_col_net')]: totalNet, [t('bni_col_type')]: '' },
        ],
      },
    ]);
  }

  return (
    <div className="app-shell" style={{ zoom: `${textScale}%` }}>
      <Sidebar />
      <div className="main">
        <div className="top-row">
          <div>
            <h1 className="page-title" style={ls('bni_title')}>{t('bni_title')}</h1>
            <p className="page-subtitle" style={ls('bni_subtitle')}>
              {t('bni_subtitle')}{saving ? ` ${t('saving_note')}` : ''}
            </p>
          </div>
          <div className="top-controls">
            <BranchPicker branches={branches} value={selectedBranchId} onChange={setSelectedBranchId} />
          </div>
        </div>

        {loading ? (
          <>
            <SkeletonCards count={5} />
            <SkeletonPanel rows={6} />
          </>
        ) : (
          <div className="tab-page fade-in-transition" key={selectedBranchId}>
            <div className="cards-row">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--teal-900)' }}>💰</div>
                <div>
                  <p className="stat-title" style={ls('bni_kpi_total')}>{t('bni_kpi_total')}</p>
                  <p className="stat-value">{fmtMoney(totalNet)}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--teal-600)' }}>📈</div>
                <div>
                  <p className="stat-title" style={ls('bni_kpi_current_year')}>{t('bni_kpi_current_year')}</p>
                  <p className="stat-value">{fmtMoney(currentYearNet)}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--orange-500)' }}>📅</div>
                <div>
                  <p className="stat-title" style={ls('bni_kpi_previous_year')}>{t('bni_kpi_previous_year')}</p>
                  <p className="stat-value">{fmtMoney(previousYearNet)}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--blue-500)' }}>{yoy >= 0 ? '▲' : '▼'}</div>
                <div>
                  <p className="stat-title" style={ls('bni_kpi_yoy')}>{t('bni_kpi_yoy')}</p>
                  <p className="stat-value" dir="ltr">{yoy >= 0 ? '+' : ''}{yoy.toFixed(1)}%</p>
                </div>
              </div>
              <div className="stat-card highlight-card">
                <div className="stat-icon" style={{ background: 'var(--green-600)' }}>🗓️</div>
                <div>
                  <p className="stat-title" style={ls('bni_kpi_years_count')}>{t('bni_kpi_years_count')}</p>
                  <p className="stat-value">{yearsWithData.length}</p>
                </div>
              </div>
            </div>

            <div className="panel panel-large">
              <div className="panel-header">
                <div className="panel-icon" style={{ background: 'var(--teal-500)' }}>📊</div>
                <h3 className="panel-title" style={ls('bni_chart_title')}>{t('bni_chart_title')}</h3>
              </div>
              <AnnualTrendChart data={chartData} labels={{ net: selectedBranch ? selectedBranch.name : t('bni_col_net') }} />
            </div>

            <div className="panel panel-large">
              <div className="panel-header">
                <div className="panel-icon" style={{ background: 'var(--orange-500)' }}>📋</div>
                <h3 className="panel-title" style={ls('bni_table_title')}>{t('bni_table_title')}</h3>
              </div>
              <table className="grid-table">
                <thead>
                  <tr>
                    <th style={ls('bni_col_year')}>{t('bni_col_year')}</th>
                    <th className="right" style={ls('bni_col_net')}>{t('bni_col_net')}</th>
                    <th style={ls('bni_col_type')}>{t('bni_col_type')}</th>
                    <th className="right" style={ls('bni_col_trend')}>{t('bni_col_trend')}</th>
                  </tr>
                </thead>
                <tbody>
                  {years.map((y) => {
                    const auto = isAuto(y);
                    const hasPrev = hasAnyValue(y - 1);
                    const change = hasPrev ? pctChange(valueFor(y), valueFor(y - 1)) : null;
                    return (
                      <tr key={y}>
                        <td dir="ltr" style={{ fontWeight: 700 }}>{y}</td>
                        <td className="right">
                          {auto ? (
                            fmtMoney(autoByYear[y].net)
                          ) : (
                            <input
                              className="cell-input"
                              type="text"
                              inputMode="decimal"
                              dir="ltr"
                              lang="en"
                              value={manualByYear[y] ?? ''}
                              onChange={(e) => handleManualChange(y, e.target.value)}
                            />
                          )}
                        </td>
                        <td>
                          {hasAnyValue(y) && (
                            <span className={auto ? 'badge-auto' : 'badge-manual'}>
                              {auto ? t('bni_badge_auto') : t('bni_badge_manual')}
                            </span>
                          )}
                        </td>
                        <td className="right" dir="ltr">
                          {change === null ? '-' : (
                            <span style={{ color: change >= 0 ? 'var(--green-600)' : '#c0392b', fontWeight: 700 }}>
                              {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="total-row">
                    <td style={ls('bni_total_row')}>{t('bni_total_row')}</td>
                    <td className="right">{fmtMoney(totalNet)}</td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
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
