'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
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

    // Check whether this account needs a second factor (TOTP)
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
      setError('Incorrect code — try again.');
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
            <h1 className="auth-title">Sign in</h1>
            <p className="auth-sub">Monthly Earning Report</p>
            <form onSubmit={handlePasswordSubmit}>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button className="primary-btn" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
              {error && <p className="error-text">{error}</p>}
            </form>
          </>
        ) : (
          <>
            <h1 className="auth-title">Enter your code</h1>
            <p className="auth-sub">Open your authenticator app and enter the 6-digit code</p>
            <form onSubmit={handleOtpSubmit}>
              <div className="field">
                <label>Authenticator code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <button className="primary-btn" disabled={loading}>
                {loading ? 'Verifying…' : 'Verify'}
              </button>
              {error && <p className="error-text">{error}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
