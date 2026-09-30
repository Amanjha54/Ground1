'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, HardHat, Building2, AlertCircle } from 'lucide-react';
import { signInWithEmail } from '../../lib/auth/actions';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Quick Demo Accounts to facilitate immediate evaluation
  const demoAccounts = [
    { role: 'Citizen', email: 'citizen@ground0.local', pass: 'demoCitizen2026!', icon: UserCheck, desc: 'Report issues & verify Before/After' },
    { role: 'Field Worker', email: 'worker@ground0.local', pass: 'demoWorker2026!', icon: HardHat, desc: 'Capture cryptographically nonced evidence' },
    { role: 'Inspector', email: 'inspector@ground0.local', pass: 'demoInspector2026!', icon: ShieldCheck, desc: 'Verification Lab & audit approval' },
    { role: 'Org Admin', email: 'admin@metro-civil.gov', pass: 'demoAdmin2026!', icon: Building2, desc: 'Triage complaints, assign work orders' },
  ];

  const handleQuickSelect = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('redirectTo', redirectTo);

    try {
      const res = await signInWithEmail(formData);
      if (res.success) {
        router.push(res.redirectTo || '/dashboard');
      } else {
        setError(res.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#0F1015]/90 border border-[#232632] rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Sign In to Command Center</h1>
        <p className="text-xs text-[#94A3B8] mt-1">Access verified infrastructure records and field audits</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-950/40 border border-red-800/60 rounded-lg flex items-start space-x-3 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#94A3B8] mb-1 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-[#94A3B8]" />
            <input
              id="email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@organization.gov"
              className="w-full bg-[#08080A] border border-[#232632] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#d4af37] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-[#94A3B8]" />
            <input
              id="password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#08080A] border border-[#232632] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
            />
          </div>
        </div>

        <button
          id="login-submit-button"
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 bg-gradient-to-r from-[#d4af37] via-[#e2c563] to-[#aa8524] text-[#08080A] font-semibold text-sm rounded-lg hover:brightness-110 active:brightness-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <span>Enter Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo Fast-Switch Pills */}
      <div className="mt-8 pt-6 border-t border-[#232632]">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8] mb-3">
          Demo Credentials (Quick Select)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {demoAccounts.map((account) => {
            const Icon = account.icon;
            const isSelected = email === account.email;
            return (
              <button
                key={account.role}
                type="button"
                onClick={() => handleQuickSelect(account.email, account.pass)}
                className={`p-2.5 rounded-lg border text-left transition-all flex flex-col ${
                  isSelected
                    ? 'border-[#d4af37] bg-[#d4af37]/10'
                    : 'border-[#232632] bg-[#08080A]/60 hover:border-[#64748B]'
                }`}
              >
                <div className="flex items-center space-x-1.5 text-xs font-medium text-[#E2E8F0]">
                  <Icon className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>{account.role}</span>
                </div>
                <span className="text-[10px] text-[#94A3B8] truncate mt-0.5">
                  {account.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-6 text-center text-xs text-[#94A3B8]">
        Need an account?{' '}
        <Link href="/signup" className="text-[#d4af37] font-medium hover:underline">
          Register as Citizen or Organization
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#08080A] text-[#E2E8F0] flex flex-col justify-center items-center px-4 py-12">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[320px] bg-[#d4af37]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-8 relative z-10">
        <Link href="/" className="inline-flex items-center space-x-3 group">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#15171e] p-[1px] shadow-[0_0_20px_rgba(212,175,55,0.25)]">
            <div className="w-full h-full bg-[#08080A] rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#d4af37]" />
            </div>
          </div>
          <span className="text-2xl font-bold tracking-widest text-[#E2E8F0] uppercase">
            Ground<span className="text-[#d4af37]">0</span>
          </span>
        </Link>
        <p className="mt-2 text-xs uppercase tracking-widest text-[#94A3B8]">
          Verify the Work. Reveal the Reality.
        </p>
      </div>

      <Suspense fallback={<div className="w-full max-w-md h-[400px] bg-[#0F1015]/60 rounded-2xl animate-pulse" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
