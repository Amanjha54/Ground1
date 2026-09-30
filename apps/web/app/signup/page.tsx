'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, User, Phone, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { signUpWithEmail } from '../../lib/auth/actions';
import type { UserRole } from '../../lib/types/auth';

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('CITIZEN');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      setError('You must accept the terms of service and physical verification ethics agreement.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('phone', phone);
    formData.append('role', role);

    try {
      const res = await signUpWithEmail(formData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(res.redirectTo || '/profile');
        }, 1200);
      } else {
        setError(res.error || 'Registration failed. Please check your details.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080A] text-[#E2E8F0] flex flex-col justify-center items-center px-4 py-12">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[340px] bg-[#d4af37]/5 blur-[120px] rounded-full pointer-events-none" />

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
          Create Your Verification Identity
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="w-full max-w-lg bg-[#0F1015]/90 border border-[#232632] rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white">Register Ground0 Account</h1>
          <p className="text-xs text-[#94A3B8] mt-1">Join the public infrastructure verification network</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/40 border border-red-800/60 rounded-lg flex items-start space-x-3 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg flex items-start space-x-3 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Registration successful! Redirecting to command portal...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1 uppercase tracking-wider">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-[#94A3B8]" />
              <input
                id="signup-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aman Jha"
                className="w-full bg-[#08080A] border border-[#232632] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-[#94A3B8]" />
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@ground0.local"
                className="w-full bg-[#08080A] border border-[#232632] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
              />
            </div>
          </div>

          {/* Password & Phone Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-[#94A3B8]" />
                <input
                  id="signup-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#08080A] border border-[#232632] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1 uppercase tracking-wider">
                Mobile (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-[#94A3B8]" />
                <input
                  id="signup-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#08080A] border border-[#232632] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1 uppercase tracking-wider">
              Account Role
            </label>
            <select
              id="signup-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full bg-[#08080A] border border-[#232632] rounded-lg px-4 py-2.5 text-sm text-[#E2E8F0] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
            >
              <option value="CITIZEN">Citizen (Report issues & verify Before/After)</option>
              <option value="FIELD_WORKER">Field Worker (Capture Before/After on-site)</option>
              <option value="CONTRACTOR">Contractor Firm (Manage field work crews)</option>
              <option value="INSPECTOR">Municipal Inspector (Review Verification Lab)</option>
              <option value="ORGANIZATION_ADMIN">Organization Admin (Manage municipal ops)</option>
              <option value="AUDITOR">Auditor (Independent oversight & logs)</option>
            </select>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start space-x-2 pt-2">
            <input
              id="signup-terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#232632] bg-[#08080A] text-[#d4af37] focus:ring-0"
            />
            <label htmlFor="signup-terms" className="text-xs text-[#94A3B8] leading-relaxed">
              I agree to the Ground0 Terms of Service and certify that all physical evidence uploaded conforms to Zero Trust evidentiary standards.
            </label>
          </div>

          <button
            id="signup-submit-button"
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-gradient-to-r from-[#d4af37] via-[#e2c563] to-[#aa8524] text-[#08080A] font-semibold text-sm rounded-lg hover:brightness-110 active:brightness-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Creating Identity...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#94A3B8]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#d4af37] font-medium hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
