'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from '../../components/Sidebar';
import { useLabels } from '../../lib/LabelsContext';
import { LABEL_GROUPS } from '../../lib/labels';

export default function SettingsPage() {
  const router = useRouter();
  const { t, labels, saveLabels } = useLabels();
  const [checkingSession, setCheckingSession] = useState(true);
  const [factors, setFactors] = useState([]);
  const [enrollData, setEnrollData] = useState(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // local editable copy of every label, so typing doesn't save on every keystroke
  const [labelDrafts, setLabelDrafts] = useState({});
  const [labelsSaving, setLabelsSaving] = useState(false);

  useEffect(() => {
    setLabelDrafts(labels);
  }, [labels]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/login');
      } else {
        setCheckingSession(false);
        refreshFactors();
      }
    });
  }, [router]);

  async function refreshFactors() {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors(data?.totp || []);
  }

  async function startEnroll() {
    setError('');
    const { data, error: err } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (err) { setError(err.message); return; }
    setEnrollData({ factorId: data.id, qrCode: data.totp.uri, secret: data.totp.secret });
  }

  async function confirmEnroll(e) {
    e.preventDefault();
    setError('');
    const { data: challenge, error: challErr } = await supabase.auth.mfa.challenge({
      factorId: enrollData.factorId,
    });
    if (challErr) { setError(challErr.message); return; }

    const { error: verErr } = await supabase.auth.mfa.verify({
      factorId: enrollData.factorId,
      challengeId: challenge.id,
      code: verifyCode,
    });
    if (verErr) { setError('رمز غير صحيح — حاول مرة أخرى.'); return; }

    setMessage('تم تفعيل تطبيق المصادقة. سيُطلب منك إدخال الرمز في كل تسجيل دخول.');
    setEnrollData(null);
    setVerifyCode('');
    refreshFactors();
  }

  async function removeFactor(factorId) {
    if (!confirm('إيقاف تطبيق المصادقة (التحقق بخطوتين)؟')) return;
    await supabase.auth.mfa.unenroll({ factorId });
    refreshFactors();
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    if (err) { setError(err.message); return; }
    setMessage('تم تحديث كلمة المرور.');
    setNewPassword('');
  }

  function handleLabelDraftChange(key, value) {
    setLabelDrafts((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSaveLabels(keys) {
    setLabelsSaving(true);
    const changes = {};
    keys.forEach((k) => { changes[k] = labelDrafts[k]; });
    await saveLabels(changes);
    setLabelsSaving(false);
    setMessage('تم حفظ النصوص.');
  }

  if (checkingSession) return <div className="loading-screen">جارٍ التحميل…</div>;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <div className="top-row">
          <div>
            <h1 className="page-title">{t('settings_title')}</h1>
            <p className="page-subtitle">{t('settings_subtitle')}</p>
          </div>
        </div>

        <div className="panel" style={{ maxWidth: 480 }}>
          <div className="panel-header">
            <div className="panel-icon" style={{ background: 'var(--teal-600)' }}>🔐</div>
            <h3 className="panel-title">{t('settings_2fa_title')}</h3>
          </div>

          {factors.length > 0 ? (
            <div>
              <p>{t('settings_2fa_enabled')}</p>
              {factors.map((f) => (
                <button key={f.id} className="remove-btn" onClick={() => removeFactor(f.id)}>
                  {t('settings_2fa_disable_btn')}
                </button>
              ))}
            </div>
          ) : enrollData ? (
            <div className="qr-box">
              <p>{t('settings_2fa_scan_hint')}</p>
              <QRCodeSVG value={enrollData.qrCode} size={180} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {t('settings_2fa_manual_hint')} <code dir="ltr">{enrollData.secret}</code>
              </p>
              <form onSubmit={confirmEnroll} style={{ width: '100%' }}>
                <div className="field">
                  <label>{t('settings_2fa_confirm_label')}</label>
                  <input
                    type="text"
                    dir="ltr"
                    inputMode="numeric"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    required
                  />
                </div>
                <button className="primary-btn">{t('settings_2fa_confirm_btn')}</button>
              </form>
            </div>
          ) : (
            <button className="primary-btn" onClick={startEnroll}>{t('settings_2fa_enable_btn')}</button>
          )}
          {error && <p className="error-text">{error}</p>}
          {message && <p style={{ color: 'var(--green-600)', fontSize: 13 }}>{message}</p>}
        </div>

        <div className="panel" style={{ maxWidth: 480 }}>
          <div className="panel-header">
            <div className="panel-icon" style={{ background: 'var(--orange-500)' }}>🔑</div>
            <h3 className="panel-title">{t('settings_password_title')}</h3>
          </div>
          <form onSubmit={handlePasswordChange}>
            <div className="field">
              <label>{t('settings_password_label')}</label>
              <input
                type="password"
                dir="ltr"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <button className="primary-btn">{t('settings_password_btn')}</button>
          </form>
        </div>

        <div className="panel" style={{ maxWidth: 640 }}>
          <div className="panel-header">
            <div className="panel-icon" style={{ background: 'var(--teal-500)' }}>✏️</div>
            <h3 className="panel-title">{t('settings_labels_title')}</h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: -6, marginBottom: 14 }}>
            {t('settings_labels_subtitle')}
          </p>

          {LABEL_GROUPS.map((group) => (
            <div key={group.title} style={{ marginBottom: 20 }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--teal-900)', marginBottom: 8 }}>
                {group.title}
              </p>
              {group.keys.map((key) => (
                <div className="field" key={key}>
                  <input
                    value={labelDrafts[key] ?? ''}
                    onChange={(e) => handleLabelDraftChange(key, e.target.value)}
                  />
                </div>
              ))}
              <button
                className="add-row-btn"
                disabled={labelsSaving}
                onClick={() => handleSaveLabels(group.keys)}
              >
                {t('settings_labels_save_btn')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
