'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from '../../components/Sidebar';

export default function SettingsPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [factors, setFactors] = useState([]);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollData, setEnrollData] = useState(null); // { factorId, qrCode, secret }
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');

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
    setEnrolling(true);
    const { data, error: err } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (err) {
      setError(err.message);
      setEnrolling(false);
      return;
    }
    setEnrollData({
      factorId: data.id,
      qrCode: data.totp.uri,
      secret: data.totp.secret,
    });
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
    if (verErr) { setError('Incorrect code — try again.'); return; }

    setMessage('Authenticator app enabled. You will be asked for a code next time you sign in.');
    setEnrollData(null);
    setEnrolling(false);
    setVerifyCode('');
    refreshFactors();
  }

  async function removeFactor(factorId) {
    if (!confirm('Turn off authenticator app 2FA?')) return;
    await supabase.auth.mfa.unenroll({ factorId });
    refreshFactors();
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    if (err) { setError(err.message); return; }
    setMessage('Password updated.');
    setNewPassword('');
  }

  if (checkingSession) return <div className="loading-screen">Loading…</div>;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <div className="top-row">
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Security and account settings</p>
          </div>
        </div>

        <div className="panel" style={{ maxWidth: 480 }}>
          <div className="panel-header">
            <div className="panel-icon" style={{ background: 'var(--teal-600)' }}>🔐</div>
            <h3 className="panel-title">Authenticator App (2FA)</h3>
          </div>

          {factors.length > 0 ? (
            <div>
              <p>Authenticator app 2FA is <strong>enabled</strong>.</p>
              {factors.map((f) => (
                <button key={f.id} className="remove-btn" onClick={() => removeFactor(f.id)}>
                  Turn off 2FA
                </button>
              ))}
            </div>
          ) : enrollData ? (
            <div className="qr-box">
              <p>Scan this with Google Authenticator, Microsoft Authenticator, or Authy:</p>
              <QRCodeSVG value={enrollData.qrCode} size={180} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Can't scan? Enter this key manually: <code>{enrollData.secret}</code>
              </p>
              <form onSubmit={confirmEnroll} style={{ width: '100%' }}>
                <div className="field">
                  <label>Enter the 6-digit code to confirm</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    required
                  />
                </div>
                <button className="primary-btn">Confirm & enable</button>
              </form>
            </div>
          ) : (
            <button className="primary-btn" onClick={startEnroll}>Enable authenticator app 2FA</button>
          )}
          {error && <p className="error-text">{error}</p>}
          {message && <p style={{ color: 'var(--green-600)', fontSize: 13 }}>{message}</p>}
        </div>

        <div className="panel" style={{ maxWidth: 480 }}>
          <div className="panel-header">
            <div className="panel-icon" style={{ background: 'var(--orange-500)' }}>🔑</div>
            <h3 className="panel-title">Change Password</h3>
          </div>
          <form onSubmit={handlePasswordChange}>
            <div className="field">
              <label>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <button className="primary-btn">Update password</button>
          </form>
        </div>
      </div>
    </div>
  );
}
