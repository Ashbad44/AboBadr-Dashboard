'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from '../../components/Sidebar';
import { downloadBackup, restoreBackup } from '../../lib/backup';

export default function BackupPage() {
  const router = useRouter();

  const [checkingSession, setCheckingSession] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState('');
  const [restoreResult, setRestoreResult] = useState(null);
  const [restoreError, setRestoreError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/login');
      else setCheckingSession(false);
    });
  }, [router]);

  async function handleDownload() {
    setDownloading(true);
    setDownloadMsg('');
    try {
      const data = await downloadBackup();
      const totalRows = Object.values(data).reduce((sum, rows) => sum + rows.length, 0);
      setDownloadMsg(`تم التنزيل بنجاح — ${totalRows} سجل محفوظ.`);
    } catch (err) {
      setDownloadMsg(`تعذر إنشاء النسخة الاحتياطية: ${err.message}`);
    }
    setDownloading(false);
  }

  async function handleRestoreClick() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    if (!confirm(
      'هذا سيستبدل كل البيانات المطابقة الحالية بالبيانات الموجودة في هذا الملف. ' +
      'أي تعديل تم بعد تاريخ هذه النسخة الاحتياطية سيبقى كما هو ولن يُحذف، لكن أي شيء تم تعديله على سجل موجود في الملف سيعود لقيمته القديمة. هل تريد المتابعة؟'
    )) return;

    setRestoring(true);
    setRestoreError('');
    setRestoreResult(null);
    setRestoreProgress('جارٍ الاستعادة…');

    try {
      const results = await restoreBackup(file, (table, count) => {
        setRestoreProgress(`تمت استعادة ${table} (${count} سجل)…`);
      });
      setRestoreResult(results);
      setRestoreProgress('');
    } catch (err) {
      setRestoreError(err.message);
      setRestoreProgress('');
    }

    setRestoring(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  if (checkingSession) return <div className="loading-screen">جارٍ التحميل…</div>;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <div className="top-row">
          <div>
            <h1 className="page-title">النسخ الاحتياطي</h1>
            <p className="page-subtitle">احفظ نسخة من كل بياناتك، أو استعدها إذا حذفت شيئاً بالخطأ</p>
          </div>
        </div>

        <div className="tab-page">
          <div className="panel panel-large">
            <div className="panel-header">
              <div className="panel-icon" style={{ background: 'var(--teal-600)' }}>⬇️</div>
              <h3 className="panel-title">تنزيل نسخة احتياطية</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 16 }}>
              يقوم هذا بحفظ كل شيء في موقعك — الفروع، الأشهر، الاستقطاعات، مصادر الدخل، النصوص، كل شيء —
              في ملف واحد على جهازك. احتفظ بهذا الملف في مكان آمن (بريدك الإلكتروني، Google Drive، إلخ).
              ننصح بتنزيل نسخة جديدة بشكل دوري، خصوصاً بعد إدخال بيانات شهر جديد.
            </p>
            <button className="primary-btn" style={{ maxWidth: 280 }} onClick={handleDownload} disabled={downloading}>
              {downloading ? 'جارٍ التحضير…' : '⬇️ تنزيل نسخة احتياطية الآن'}
            </button>
            {downloadMsg && (
              <p style={{ marginTop: 12, fontSize: 14, color: downloadMsg.startsWith('تعذر') ? '#c0392b' : 'var(--green-600)' }}>
                {downloadMsg}
              </p>
            )}
          </div>

          <div className="panel panel-large backup-restore-panel">
            <div className="panel-header">
              <div className="panel-icon" style={{ background: 'var(--orange-500)' }}>⬆️</div>
              <h3 className="panel-title">الاستعادة من نسخة احتياطية</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 8 }}>
              استخدم هذا فقط إذا حذفت أو غيّرت شيئاً بالخطأ وتريد إرجاعه لحالته وقت أخذ النسخة الاحتياطية.
            </p>
            <p style={{ color: '#c0392b', fontSize: 14, marginBottom: 16, fontWeight: 600 }}>
              ⚠️ ستُستبدل أي بيانات حالية تطابق ما في الملف بالقيم القديمة من النسخة الاحتياطية.
              أي بيانات جديدة أُدخلت بعد تاريخ النسخة الاحتياطية تبقى كما هي ولن تُحذف.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="backup-file-input"
            />
            <button
              className="print-btn"
              style={{ background: '#c0392b', marginInlineStart: 10 }}
              onClick={handleRestoreClick}
              disabled={restoring}
            >
              {restoring ? 'جارٍ الاستعادة…' : '⬆️ استعادة من هذا الملف'}
            </button>

            {restoreProgress && <p style={{ marginTop: 12, fontSize: 14, color: 'var(--text-muted)' }}>{restoreProgress}</p>}
            {restoreError && <p style={{ marginTop: 12, fontSize: 14, color: '#c0392b' }}>{restoreError}</p>}
            {restoreResult && (
              <div style={{ marginTop: 14 }}>
                <p style={{ fontWeight: 700, color: 'var(--green-600)', marginBottom: 6 }}>
                  ✅ تمت الاستعادة بنجاح. حدّث الصفحة (F5) لرؤية البيانات المستعادة.
                </p>
                <table className="grid-table" style={{ fontSize: 13 }}>
                  <tbody>
                    {Object.entries(restoreResult).map(([table, count]) => (
                      <tr key={table}>
                        <td>{table}</td>
                        <td className="right" dir="ltr">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
