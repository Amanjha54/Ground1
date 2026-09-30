import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

interface ErrorPageProps {
  searchParams: Promise<{
    code?: string;
    message?: string;
  }>;
}

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const { code, message } = await searchParams;
  const isUnauthorized = code === 'unauthorized';

  return (
    <div className="min-h-screen bg-[#08080A] text-[#E2E8F0] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-[#0F1015]/90 border border-[#232632] rounded-2xl p-8 backdrop-blur-xl shadow-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-400 flex items-center justify-center mx-auto mb-5 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          {isUnauthorized ? <Lock className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
        </div>

        <h1 className="text-xl font-bold text-white mb-2">
          {isUnauthorized ? 'Access Clearance Denied' : 'Operational Anomaly'}
        </h1>

        <p className="text-xs text-[#94A3B8] leading-relaxed mb-6">
          {message ||
            (isUnauthorized
              ? 'Your current role credentials do not possess authorized clearance for this operational sector.'
              : 'An unexpected error was encountered while communicating with the verification network.')}
        </p>

        <div className="flex flex-col space-y-3">
          <Link
            href="/login"
            className="w-full py-2.5 bg-gradient-to-r from-[#d4af37] via-[#e2c563] to-[#aa8524] text-[#08080A] font-semibold text-xs rounded-lg hover:brightness-110 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            Authenticate with Authorized Credentials
          </Link>

          <Link
            href="/"
            className="w-full py-2.5 bg-[#08080A] border border-[#232632] text-xs text-[#94A3B8] hover:text-[#E2E8F0] rounded-lg transition-colors flex items-center justify-center space-x-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
