'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { currentMonthValue, toNumber, isBranchVisibleForMonth } from '../../lib/utils';
import Sidebar from '../../components/Sidebar';
import SummaryCards from '../../components/SummaryCards';
import MonthPicker from '../../components/MonthPicker';
import BranchesTable from '../../components/BranchesTable';
import DeductionsOverviewPanel from '../../components/DeductionsOverviewPanel';
import FinalReviewPanel from '../../components/FinalReviewPanel';
import EarningSourcesTable from '../../components/EarningSourcesTable';
import SmsLedgerPanel from '../../components/SmsLedgerPanel';
import CashColumnsPanel from '../../components/CashColumnsPanel';
import Tabs from '../../components/Tabs';
import PrintButton from '../../components/PrintButton';
import ExcelExportButton from '../../components/ExcelExportButton';
import SkeletonCards from '../../components/SkeletonCards';
import SkeletonPanel from '../../components/SkeletonPanel';
import { useLabels } from '../../lib/LabelsContext';
import { useTextStyles, styleToCss } from '../../lib/TextStylesContext';
import { exportToExcel } from '../../lib/excelExport';

const EMPTY_DEDUCTIONS = {
  other_deduction: 0,
  electricity_water: 0,
  salaries: 0,
  other_payment: 0,
  salary_handover: 0,
  government_fees: 0,
};

export default function DashboardPage() {
  const router = useRouter();
  const { t, labels } = useLabels();
  const { getStyle } = useTextStyles();
  const ls = (key) => styleToCss(getStyle('label', key));
  const [checkingSession, setCheckingSession] = useState(true);

  const [month, setMonth] = useState(currentMonthValue());
  const [branches, setBranches] = useState([]);
  const [sources, setSources] = useState([]);
  const [smsSources, setSmsSources] = useState([]);
  const [cashSources, setCashSources] = useState([]);
  const [otherDeductions, setOtherDeductions] = useState([]); // [{id, name, amount, sort_order}] — scoped to current month
  const [branchData, setBranchData] = useState({}); // { branchId: {income, expenses} }
  const [sourceData, setSourceData] = useState({}); // { sourceId: {amount} }
  const [deductions, setDeductions] = useState(EMPTY_DEDUCTIONS);
  const [loadingMonth, setLoadingMonth] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('branches');
  const [smsExportData, setSmsExportData] = useState([]);
  const [cashExportData, setCashExportData] = useState([]);

  const saveTimer = useRef(null);

  // --- auth guard ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/login');
      } else {
        setCheckingSession(false);
      }
    });
  }, [router]);

  // --- load branches & sources once ---
  const loadLists = useCallback(async () => {
    const { data: branchRows } = await supabase
      .from('branches')
      .select('*')
      .eq('archived', false)
      .order('sort_order', { ascending: true });
    setBranches(branchRows || []);

    const { data: sourceRows } = await supabase
      .from('earning_sources')
      .select('*')
      .eq('archived', false)
      .order('sort_order', { ascending: true });
    setSources(sourceRows || []);

    const { data: smsRows } = await supabase
      .from('sms_sources')
      .select('*')
      .eq('archived', false)
      .order('sort_order', { ascending: true });
    setSmsSources(smsRows || []);

    const { data: cashRows } = await supabase
      .from('column_sources')
      .select('*')
      .eq('archived', false)
      .order('sort_order', { ascending: true });
    setCashSources(cashRows || []);
  }, []);

  // --- load a given month's data ---
  const loadMonth = useCallback(async (monthValue) => {
    setLoadingMonth(true);

    const { data: bd } = await supabase
      .from('monthly_branch_data')
      .select('*')
      .eq('month', monthValue);
    const bdMap = {};
    (bd || []).forEach((r) => { bdMap[r.branch_id] = { income: r.income, expenses: r.expenses }; });
    setBranchData(bdMap);

    const { data: sd } = await supabase
      .from('monthly_earning_source_data')
      .select('*')
      .eq('month', monthValue);
    const sdMap = {};
    (sd || []).forEach((r) => { sdMap[r.source_id] = { amount: r.amount }; });
    setSourceData(sdMap);

    const { data: ded } = await supabase
      .from('monthly_deductions')
      .select('*')
      .eq('month', monthValue)
      .maybeSingle();
    setDeductions(ded ? {
      other_deduction: ded.other_deduction,
      electricity_water: ded.electricity_water,
      salaries: ded.salaries,
      other_payment: ded.other_payment,
      salary_handover: ded.salary_handover,
      government_fees: ded.government_fees,
    } : EMPTY_DEDUCTIONS);

    const { data: odd } = await supabase
      .from('monthly_other_deductions')
      .select('*')
      .eq('month', monthValue)
      .order('sort_order', { ascending: true });
    setOtherDeductions(odd || []);

    setLoadingMonth(false);
  }, []);

  useEffect(() => {
    if (!checkingSession) loadLists();
  }, [checkingSession, loadLists]);

  useEffect(() => {
    if (!checkingSession) loadMonth(month);
  }, [checkingSession, month, loadMonth]);

  // --- debounced save helpers (upsert on change) ---
  function scheduleSave(fn) {
    setSaving(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await fn();
      setSaving(false);
    }, 500);
  }

  function handleChangeCell(branchId, field, value) {
    setBranchData((prev) => {
      const next = { ...prev, [branchId]: { ...prev[branchId], [field]: value } };
      scheduleSave(async () => {
        const row = next[branchId];
        await supabase.from('monthly_branch_data').upsert({
          month,
          branch_id: branchId,
          income: toNumber(row.income),
          expenses: toNumber(row.expenses),
        }, { onConflict: 'month,branch_id' });
      });
      return next;
    });
  }

  async function handleRenameBranch(branchId, name) {
    setBranches((prev) => prev.map((b) => (b.id === branchId ? { ...b, name } : b)));
    scheduleSave(async () => {
      await supabase.from('branches').update({ name }).eq('id', branchId);
    });
  }

  async function handleAddBranch() {
    const { data, error } = await supabase
      .from('branches')
      .insert({ name: `فرع ${branches.length + 1}`, sort_order: branches.length + 1 })
      .select()
      .single();
    if (!error && data) setBranches((prev) => [...prev, data]);
  }

  async function handleRemoveBranch(branchId) {
    if (!confirm('إزالة هذا الفرع؟ ستبقى بيانات الأشهر السابقة محفوظة.')) return;
    await supabase.from('branches').update({ archived: true }).eq('id', branchId);
    setBranches((prev) => prev.filter((b) => b.id !== branchId));
  }

  function handleChangeAmount(sourceId, value) {
    setSourceData((prev) => {
      const next = { ...prev, [sourceId]: { amount: value } };
      scheduleSave(async () => {
        await supabase.from('monthly_earning_source_data').upsert({
          month,
          source_id: sourceId,
          amount: toNumber(value),
        }, { onConflict: 'month,source_id' });
      });
      return next;
    });
  }

  async function handleRenameSource(sourceId, name) {
    setSources((prev) => prev.map((s) => (s.id === sourceId ? { ...s, name } : s)));
    scheduleSave(async () => {
      await supabase.from('earning_sources').update({ name }).eq('id', sourceId);
    });
  }

  async function handleAddSource() {
    const { data, error } = await supabase
      .from('earning_sources')
      .insert({ name: `مصدر ${sources.length + 1}`, sort_order: sources.length + 1 })
      .select()
      .single();
    if (!error && data) setSources((prev) => [...prev, data]);
  }

  async function handleRemoveSource(sourceId) {
    if (!confirm('إزالة مصدر الدخل هذا؟ ستبقى بيانات الأشهر السابقة محفوظة.')) return;
    await supabase.from('earning_sources').update({ archived: true }).eq('id', sourceId);
    setSources((prev) => prev.filter((s) => s.id !== sourceId));
  }

  async function handleToggleSourceBankGroup(sourceId, value) {
    setSources((prev) => prev.map((s) => (s.id === sourceId ? { ...s, include_in_bank_total: value } : s)));
    await supabase.from('earning_sources').update({ include_in_bank_total: value }).eq('id', sourceId);
  }

  async function handleRenameSmsSource(sourceId, name) {
    setSmsSources((prev) => prev.map((s) => (s.id === sourceId ? { ...s, name } : s)));
    scheduleSave(async () => {
      await supabase.from('sms_sources').update({ name }).eq('id', sourceId);
    });
  }

  function handleChangeDeduction(field, value) {
    setDeductions((prev) => {
      const next = { ...prev, [field]: value };
      scheduleSave(async () => {
        await supabase.from('monthly_deductions').upsert({
          month,
          other_deduction: toNumber(next.other_deduction),
          electricity_water: toNumber(next.electricity_water),
          salaries: toNumber(next.salaries),
          other_payment: toNumber(next.other_payment),
          salary_handover: toNumber(next.salary_handover),
          government_fees: toNumber(next.government_fees),
        }, { onConflict: 'month' });
      });
      return next;
    });
  }

  function handleChangeOtherDeductionAmount(id, value) {
    setOtherDeductions((prev) => prev.map((d) => (d.id === id ? { ...d, amount: value } : d)));
    scheduleSave(async () => {
      await supabase.from('monthly_other_deductions').update({ amount: toNumber(value) }).eq('id', id);
    });
  }

  function handleRenameOtherDeductionType(id, name) {
    setOtherDeductions((prev) => prev.map((d) => (d.id === id ? { ...d, name } : d)));
    scheduleSave(async () => {
      await supabase.from('monthly_other_deductions').update({ name }).eq('id', id);
    });
  }

  async function handleAddOtherDeductionType() {
    const { data, error } = await supabase
      .from('monthly_other_deductions')
      .insert({
        month,
        name: `مدفوعات أخرى ${otherDeductions.length + 1}`,
        amount: 0,
        sort_order: otherDeductions.length + 1,
      })
      .select()
      .single();
    if (!error && data) setOtherDeductions((prev) => [...prev, data]);
  }

  async function handleRemoveOtherDeductionType(id) {
    if (!confirm('إزالة بند الاستقطاع هذا من هذا الشهر؟')) return;
    await supabase.from('monthly_other_deductions').delete().eq('id', id);
    setOtherDeductions((prev) => prev.filter((d) => d.id !== id));
  }

  // --- branches visible for the currently selected month (date-scoped branches) ---
  const visibleBranches = branches.filter((b) => isBranchVisibleForMonth(b, month));

  // --- derived totals (all client-side, live, like Excel formulas) ---
  const totalIncome = visibleBranches.reduce((s, b) => s + toNumber((branchData[b.id] || {}).income), 0);
  const totalExpenses = visibleBranches.reduce((s, b) => s + toNumber((branchData[b.id] || {}).expenses), 0);
  const incomeBeforeDeductions = totalIncome - totalExpenses;
  const totalDeductions = toNumber(deductions.other_deduction);
  const finalTotalIncome = incomeBeforeDeductions - totalDeductions;
  const otherDeductionsTotal = otherDeductions.reduce((sum, d) => sum + toNumber(d.amount), 0);
  const finalMonthlyReview =
    incomeBeforeDeductions +
    toNumber(deductions.electricity_water) +
    toNumber(deductions.salaries) +
    toNumber(deductions.salary_handover) +
    toNumber(deductions.government_fees) +
    otherDeductionsTotal;

  const totals = {
    totalIncome,
    totalExpenses,
    incomeBeforeDeductions,
    totalDeductions,
    finalTotalIncome,
    finalMonthlyReview,
  };

  function handleExportBranches() {
    exportToExcel(`الفروع-${month}`, [
      {
        name: 'الفروع',
        rows: visibleBranches.map((b) => {
          const row = branchData[b.id] || { income: 0, expenses: 0 };
          return {
            الفرع: b.name,
            'إجمالي الدخل': toNumber(row.income),
            'إجمالي المصروفات': toNumber(row.expenses),
            'صافي الدخل': toNumber(row.income) - toNumber(row.expenses),
          };
        }),
      },
      {
        name: 'نظرة عامة',
        rows: [
          { البند: 'إجمالي الدخل قبل الاستقطاعات الأخرى', القيمة: incomeBeforeDeductions },
          { البند: 'استقطاع آخر', القيمة: toNumber(deductions.other_deduction) },
          { البند: 'صافي الدخل النهائي', القيمة: finalTotalIncome },
        ],
      },
    ]);
  }

  function handleExportReconciliation() {
    exportToExcel(`المطابقة-${month}`, [
      {
        name: 'مصادر الدخل',
        rows: sources.map((s) => ({
          المصدر: s.name,
          المبلغ: toNumber((sourceData[s.id] || {}).amount),
        })),
      },
      {
        name: 'المراجعة الشهرية',
        rows: [
          { البند: 'من الجدول أعلاه', القيمة: incomeBeforeDeductions },
          { البند: 'فاتورة الكهرباء والماء', القيمة: toNumber(deductions.electricity_water) },
          { البند: 'الرواتب', القيمة: toNumber(deductions.salaries) },
          { البند: 'تسليم رواتب', القيمة: toNumber(deductions.salary_handover) },
          { البند: 'رسوم حكومية', القيمة: toNumber(deductions.government_fees) },
          ...otherDeductions.map((d) => ({ البند: d.name, القيمة: toNumber(d.amount) })),
          { البند: 'الإجمالي', القيمة: finalMonthlyReview },
        ],
      },
    ]);
  }

  function handleExportTransfers() {
    exportToExcel(`التحويلات-${month}`, [
      {
        name: 'SMS البنوك',
        rows: smsExportData.map((r) => ({
          البنك: r.name,
          'عدد العمليات': r.count,
          الإجمالي: r.total,
        })),
      },
      {
        name: 'الكاش',
        rows: cashExportData.map((r) => ({
          المصدر: r.source,
          الفرع: r.branch,
          الإجمالي: r.total,
        })),
      },
    ]);
  }

  if (checkingSession) return <div className="loading-screen">جارٍ التحميل…</div>;

  return (
    <div className="app-shell" style={{ zoom: `${parseInt(labels.ui_text_scale, 10) || 100}%` }}>
      <Sidebar />
      <div className="main">
        <div className="top-row">
          <div>
            <h1 className="page-title" style={ls('app_title')}>{t('app_title')}</h1>
            <p className="page-subtitle" style={ls('app_subtitle')}>
              {t('app_subtitle')}{saving ? ` ${t('saving_note')}` : ''}
            </p>
          </div>
          <MonthPicker value={month} onChange={setMonth} />
        </div>

        {loadingMonth ? (
          <>
            <SkeletonCards count={5} />
            <SkeletonPanel rows={5} />
            <SkeletonPanel rows={4} />
          </>
        ) : (
          <>
            <SummaryCards totals={totals} />

            <Tabs
              tabs={[
                { key: 'branches', label: t('tab_branches') },
                { key: 'reconciliation', label: t('tab_reconciliation') },
                { key: 'transfers', label: t('tab_transfers') },
              ]}
              active={activeTab}
              onChange={setActiveTab}
            />

            {activeTab === 'branches' && (
              <div className="tab-page fade-in-transition" key={`branches-${month}`}>
                <BranchesTable
                  branches={visibleBranches}
                  branchData={branchData}
                  onChangeCell={handleChangeCell}
                  onRenameBranch={handleRenameBranch}
                  onAddBranch={handleAddBranch}
                  onRemoveBranch={handleRemoveBranch}
                />
                <DeductionsOverviewPanel
                  totals={totals}
                  deductions={deductions}
                  onChangeDeduction={handleChangeDeduction}
                />
                <div className="action-buttons-row">
                  <PrintButton />
                  <ExcelExportButton onClick={handleExportBranches} />
                </div>
              </div>
            )}

            {activeTab === 'reconciliation' && (
              <div className="tab-page fade-in-transition" key={`reconciliation-${month}`}>
                <FinalReviewPanel
                  totals={totals}
                  deductions={deductions}
                  onChangeDeduction={handleChangeDeduction}
                  otherDeductions={otherDeductions}
                  onChangeOtherDeductionAmount={handleChangeOtherDeductionAmount}
                  onRenameOtherDeductionType={handleRenameOtherDeductionType}
                  onAddOtherDeductionType={handleAddOtherDeductionType}
                  onRemoveOtherDeductionType={handleRemoveOtherDeductionType}
                />
                <EarningSourcesTable
                  sources={sources}
                  sourceData={sourceData}
                  onChangeAmount={handleChangeAmount}
                  onRenameSource={handleRenameSource}
                  onAddSource={handleAddSource}
                  onRemoveSource={handleRemoveSource}
                  onToggleBankGroup={handleToggleSourceBankGroup}
                />
                <div className="action-buttons-row">
                  <PrintButton />
                  <ExcelExportButton onClick={handleExportReconciliation} />
                </div>
              </div>
            )}

            {activeTab === 'transfers' && (
              <div className="tab-page fade-in-transition" key={`transfers-${month}`}>
                <SmsLedgerPanel
                  sources={smsSources}
                  onRenameSource={handleRenameSmsSource}
                  onResultsChange={setSmsExportData}
                />
                <CashColumnsPanel sources={cashSources} onResultsChange={setCashExportData} />
                <div className="action-buttons-row">
                  <PrintButton />
                  <ExcelExportButton onClick={handleExportTransfers} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
