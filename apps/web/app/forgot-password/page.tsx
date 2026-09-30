'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { resetPassword } from '../../lib/auth/actions';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('email', email);

    try {
      const res = await resetPassword(formData);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'Password reset request failed.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080A] text-[#E2E8F0] flex flex-col justify-center items-center px-4 py-12">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#15171e] p-[1px]">
            <div className="w-full h-full bg-[#08080A] rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-widest text-[#E2E8F0] uppercase">
            Ground<span className="text-[#d4af37]">0</span>
          </span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-[#0F1015]/90 border border-[#232632] rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-white">Reset Account Access</h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/40 border border-red-800/60 rounded-lg flex items-start space-x-3 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl space-y-3">
            <div className="flex items-center space-x-2 text-emerald-300 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5" />
              <span>Recovery Link Dispatched</span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              If an account with <span className="text-white font-mono">{email}</span> exists, we have sent a secure recovery link.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center space-x-2 text-xs text-[#d4af37] hover:underline pt-2 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-[#94A3B8]" />
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.gov"
                  className="w-full bg-[#08080A] border border-[#232632] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                />
              </div>
            </div>

            <button
              id="reset-submit-button"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#d4af37] via-[#e2c563] to-[#aa8524] text-[#08080A] font-semibold text-sm rounded-lg hover:brightness-110 active:brightness-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? <span>Dispatching...</span> : <span>Send Reset Instructions</span>}
            </button>

            <div className="pt-4 text-center">
              <Link
                href="/login"
                className="inline-flex items-center space-x-1.5 text-xs text-[#94A3B8] hover:text-[#d4af37] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
