'use client';

import { supabase } from './supabaseClient';

// Every table the app uses. Order matters for RESTORE only — tables other
// rows reference (branches, earning_sources, sms_sources, column_sources)
// must be restored before the tables that point to them, or a restored
// child row could fail to insert if its parent hasn't been recreated yet.
const TABLES_IN_RESTORE_ORDER = [
  'branches',
  'earning_sources',
  'sms_sources',
  'column_sources',
  'monthly_branch_data',
  'monthly_deductions',
  'monthly_earning_source_data',
  'monthly_other_deductions',
  'monthly_extra_earning_sources',
  'text_styles',
  'labels',
  'yearly_manual_totals',
  'branch_yearly_manual_net',
];

// Each table's primary key(s), used so restoring updates the exact same
// row instead of creating a duplicate.
const CONFLICT_KEYS = {
  branches: 'id',
  earning_sources: 'id',
  sms_sources: 'id',
  column_sources: 'id',
  monthly_branch_data: 'id',
  monthly_deductions: 'id',
  monthly_earning_source_data: 'id',
  monthly_other_deductions: 'id',
  monthly_extra_earning_sources: 'id',
  text_styles: 'target_type,target_id',
  labels: 'key',
  yearly_manual_totals: 'year',
  branch_yearly_manual_net: 'id',
};

export async function downloadBackup() {
  const backup = {
    created_at: new Date().toISOString(),
    version: 1,
    data: {},
  };

  for (const table of TABLES_IN_RESTORE_ORDER) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw new Error(`${table}: ${error.message}`);
    backup.data[table] = data || [];
  }

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `نسخة-احتياطية-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return backup.data;
}

export async function restoreBackup(file, onProgress) {
  const text = await file.text();
  let backup;
  try {
    backup = JSON.parse(text);
  } catch {
    throw new Error('الملف غير صالح — تأكد من اختيار ملف النسخة الاحتياطية الصحيح.');
  }
  if (!backup || !backup.data) {
    throw new Error('الملف غير صالح — لا يحتوي على بيانات نسخة احتياطية.');
  }

  const results = {};
  for (const table of TABLES_IN_RESTORE_ORDER) {
    const rows = backup.data[table];
    if (!rows || rows.length === 0) {
      results[table] = 0;
      continue;
    }
    const conflictKey = CONFLICT_KEYS[table] || 'id';
    const chunkSize = 500; // stay well under Supabase's per-request row limits
    let count = 0;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error } = await supabase.from(table).upsert(chunk, { onConflict: conflictKey });
      if (error) throw new Error(`فشل استعادة "${table}": ${error.message}`);
      count += chunk.length;
    }
    results[table] = count;
    if (onProgress) onProgress(table, count);
  }

  return results;
}
