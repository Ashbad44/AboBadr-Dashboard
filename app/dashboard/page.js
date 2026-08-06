'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { currentMonthValue, monthLabel, toNumber } from '../../lib/utils';
import Sidebar from '../../components/Sidebar';
import SummaryCards from '../../components/SummaryCards';
import MonthPicker from '../../components/MonthPicker';
import BranchesTable from '../../components/BranchesTable';
import DeductionsPanel from '../../components/DeductionsPanel';
import EarningSourcesTable from '../../components/EarningSourcesTable';
import SmsLedgerPanel from '../../components/SmsLedgerPanel';
import CashColumnsPanel from '../../components/CashColumnsPanel';
import { useLabels } from '../../lib/LabelsContext';

const EMPTY_DEDUCTIONS = {
  other_deduction: 0,
  electricity_water: 0,
  salaries: 0,
  other_payment: 0,
};

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLabels();
  const [checkingSession, setCheckingSession] = useState(true);

  const [month, setMonth] = useState(currentMonthValue());
  const [branches, setBranches] = useState([]);
  const [sources, setSources] = useState([]);
  const [smsSources, setSmsSources] = useState([]);
  const [cashSources, setCashSources] = useState([]);
  const [otherDeductionTypes, setOtherDeductionTypes] = useState([]);
  const [otherDeductionData, setOtherDeductionData] = useState({}); // { typeId: {amount} }
  const [branchData, setBranchData] = useState({}); // { branchId: {income, expenses} }
  const [sourceData, setSourceData] = useState({}); // { sourceId: {amount} }
  const [deductions, setDeductions] = useState(EMPTY_DEDUCTIONS);
  const [loadingMonth, setLoadingMonth] = useState(true);
  const [saving, setSaving] = useState(false);

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

    const { data: odtRows } = await supabase
      .from('other_deduction_types')
      .select('*')
      .eq('archived', false)
      .order('sort_order', { ascending: true });
    setOtherDeductionTypes(odtRows || []);
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
    } : EMPTY_DEDUCTIONS);

    const { data: odd } = await supabase
      .from('monthly_other_deduction_data')
      .select('*')
      .eq('month', monthValue);
    const oddMap = {};
    (odd || []).forEach((r) => { oddMap[r.deduction_type_id] = { amount: r.amount }; });
    setOtherDeductionData(oddMap);

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
        }, { onConflict: 'month' });
      });
      return next;
    });
  }

  function handleChangeOtherDeductionAmount(typeId, value) {
    setOtherDeductionData((prev) => {
      const next = { ...prev, [typeId]: { amount: value } };
      scheduleSave(async () => {
        await supabase.from('monthly_other_deduction_data').upsert({
          month,
          deduction_type_id: typeId,
          amount: toNumber(value),
        }, { onConflict: 'month,deduction_type_id' });
      });
      return next;
    });
  }

  async function handleRenameOtherDeductionType(typeId, name) {
    setOtherDeductionTypes((prev) => prev.map((d) => (d.id === typeId ? { ...d, name } : d)));
    scheduleSave(async () => {
      await supabase.from('other_deduction_types').update({ name }).eq('id', typeId);
    });
  }

  async function handleAddOtherDeductionType() {
    const { data, error } = await supabase
      .from('other_deduction_types')
      .insert({ name: `مدفوعات أخرى ${otherDeductionTypes.length + 1}`, sort_order: otherDeductionTypes.length + 1 })
      .select()
      .single();
    if (!error && data) setOtherDeductionTypes((prev) => [...prev, data]);
  }

  async function handleRemoveOtherDeductionType(typeId) {
    if (!confirm('إزالة بند الاستقطاع هذا؟ ستبقى بيانات الأشهر السابقة محفوظة.')) return;
    await supabase.from('other_deduction_types').update({ archived: true }).eq('id', typeId);
    setOtherDeductionTypes((prev) => prev.filter((d) => d.id !== typeId));
  }

  // --- derived totals (all client-side, live, like Excel formulas) ---
  const totalIncome = branches.reduce((s, b) => s + toNumber((branchData[b.id] || {}).income), 0);
  const totalExpenses = branches.reduce((s, b) => s + toNumber((branchData[b.id] || {}).expenses), 0);
  const incomeBeforeDeductions = totalIncome - totalExpenses;
  const totalDeductions = toNumber(deductions.other_deduction);
  const finalTotalIncome = incomeBeforeDeductions - totalDeductions;
  const otherDeductionsTotal = otherDeductionTypes.reduce(
    (sum, dt) => sum + toNumber((otherDeductionData[dt.id] || {}).amount),
    0
  );
  const finalMonthlyReview =
    incomeBeforeDeductions +
    toNumber(deductions.electricity_water) +
    toNumber(deductions.salaries) +
    otherDeductionsTotal;

  const totals = {
    totalIncome,
    totalExpenses,
    incomeBeforeDeductions,
    totalDeductions,
    finalTotalIncome,
    finalMonthlyReview,
  };

  if (checkingSession) return <div className="loading-screen">جارٍ التحميل…</div>;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <div className="top-row">
          <div>
            <h1 className="page-title">{t('app_title')}</h1>
            <p className="page-subtitle">
              {t('app_subtitle')}{saving ? ` ${t('saving_note')}` : ''}
            </p>
          </div>
          <MonthPicker value={month} onChange={setMonth} />
        </div>

        {loadingMonth ? (
          <div className="loading-screen" style={{ minHeight: 200 }}>جارٍ تحميل {monthLabel(month)}…</div>
        ) : (
          <>
            <SummaryCards totals={totals} />
            <div className="panels-grid">
              <div>
                <BranchesTable
                  branches={branches}
                  branchData={branchData}
                  onChangeCell={handleChangeCell}
                  onRenameBranch={handleRenameBranch}
                  onAddBranch={handleAddBranch}
                  onRemoveBranch={handleRemoveBranch}
                />
                <EarningSourcesTable
                  sources={sources}
                  sourceData={sourceData}
                  onChangeAmount={handleChangeAmount}
                  onRenameSource={handleRenameSource}
                  onAddSource={handleAddSource}
                  onRemoveSource={handleRemoveSource}
                />
              </div>
              <div>
                <DeductionsPanel
                  totals={totals}
                  deductions={deductions}
                  onChangeDeduction={handleChangeDeduction}
                  otherDeductionTypes={otherDeductionTypes}
                  otherDeductionData={otherDeductionData}
                  onChangeOtherDeductionAmount={handleChangeOtherDeductionAmount}
                  onRenameOtherDeductionType={handleRenameOtherDeductionType}
                  onAddOtherDeductionType={handleAddOtherDeductionType}
                  onRemoveOtherDeductionType={handleRemoveOtherDeductionType}
                />
                <SmsLedgerPanel
                  sources={smsSources}
                  onRenameSource={handleRenameSmsSource}
                />
                <CashColumnsPanel sources={cashSources} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
