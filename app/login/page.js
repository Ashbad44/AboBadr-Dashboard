'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { useLabels } from '../../lib/LabelsContext';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLabels();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState('password'); // 'password' | 'otp'
  const [factorId, setFactorId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (aal.nextLevel === 'aal2' && aal.nextLevel !== aal.currentLevel) {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.[0];
      if (totpFactor) {
        setFactorId(totpFactor.id);
        setStage('otp');
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    router.replace('/dashboard');
  }

  async function handleOtpSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });
    if (challengeError) {
      setError(challengeError.message);
      setLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: otp,
    });

    if (verifyError) {
      setError('رمز غير صحيح — حاول مرة أخرى.');
      setLoading(false);
      return;
    }

    setLoading(false);
    router.replace('/dashboard');
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        {stage === 'password' ? (
          <>
            <h1 className="auth-title">{t('login_title')}</h1>
            <p className="auth-sub">{t('login_subtitle')}</p>
            <form onSubmit={handlePasswordSubmit}>
              <div className="field">
                <label>{t('login_email')}</label>
                <input
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="field">
                <label>{t('login_password')}</label>
                <input
                  type="password"
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button className="primary-btn" disabled={loading}>
                {loading ? t('login_submit_loading') : t('login_submit')}
              </button>
              {error && <p className="error-text">{error}</p>}
            </form>
          </>
        ) : (
          <>
            <h1 className="auth-title">{t('login_otp_title')}</h1>
            <p className="auth-sub">{t('login_otp_subtitle')}</p>
            <form onSubmit={handleOtpSubmit}>
              <div className="field">
                <label>{t('login_otp_label')}</label>
                <input
                  type="text"
                  dir="ltr"
                  inputMode="numeric"
                  lang="en"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <button className="primary-btn" disabled={loading}>
                {loading ? t('login_otp_submit_loading') : t('login_otp_submit')}
              </button>
              {error && <p className="error-text">{error}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
