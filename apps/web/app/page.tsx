import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowRight,
  HardHat,
  Search,
  CheckCircle2,
  Building2,
  Camera,
  Activity,
  Layers,
  ChevronRight,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#08080A] text-[#E2E8F0] relative overflow-hidden flex flex-col justify-between">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#d4af37]/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[600px] h-[500px] bg-[#10b981]/5 blur-[180px] rounded-full pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-20 border-b border-[#232632]/80 backdrop-blur-md bg-[#08080A]/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#15171e] p-[1px] shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            <div className="w-full h-full bg-[#08080A] rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
            </div>
          </div>
          <div>
            <span className="text-xl font-bold tracking-widest uppercase text-white">
              Ground<span className="text-[#d4af37]">0</span>
            </span>
            <span className="hidden sm:inline-block ml-3 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30">
              Zero Trust Verification
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="text-xs uppercase tracking-wider font-medium text-[#94A3B8] hover:text-[#d4af37] transition-colors"
          >
            Command Login
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa8524] text-[#08080A] text-xs font-semibold uppercase tracking-wider rounded-lg hover:brightness-110 active:brightness-95 transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)]"
          >
            Create Identity
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-16 sm:py-24 text-center flex-1 flex flex-col justify-center items-center">
        {/* Verification Status Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#0F1015] border border-[#232632] mb-8 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-[11px] uppercase tracking-widest text-[#94A3B8]">
            AI-Powered Proof of Physical Work Platform
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1]">
          Verify the Work.{' '}
          <span className="gold-gradient-text block mt-2">Reveal the Reality.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-sm sm:text-base md:text-lg text-[#94A3B8] max-w-2xl leading-relaxed">
          Ground0 bridges claimed municipal completions and ground reality through cryptographically challenged capture, DINOv2 scene matching, and transparent human-in-the-loop audit pipelines.
        </p>

        {/* Primary CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <Link
            href="/login?redirectTo=/report"
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#d4af37] via-[#e2c563] to-[#aa8524] text-[#08080A] font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 active:brightness-95 transition-all shadow-[0_0_25px_rgba(212,175,55,0.3)] flex items-center justify-center space-x-2"
          >
            <span>Report an Issue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0F1015] border border-[#232632] text-xs font-semibold uppercase tracking-widest text-[#E2E8F0] hover:border-[#d4af37] hover:text-[#d4af37] rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
            <span>Enter Command Center</span>
          </Link>
        </div>

        {/* Role Quadrant Cards */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left w-full">
          <div className="p-5 rounded-2xl bg-[#0F1015]/80 border border-[#232632] hover:border-[#d4af37]/60 transition-all backdrop-blur-md group">
            <div className="w-9 h-9 rounded-lg bg-[#08080A] border border-[#232632] flex items-center justify-center mb-3 group-hover:border-[#d4af37]">
              <Search className="w-4 h-4 text-[#d4af37]" />
            </div>
            <h3 className="text-sm font-semibold text-white">Citizens</h3>
            <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
              Report infrastructure defects and inspect verified Before ↔ After sliders before closure.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F1015]/80 border border-[#232632] hover:border-[#d4af37]/60 transition-all backdrop-blur-md group">
            <div className="w-9 h-9 rounded-lg bg-[#08080A] border border-[#232632] flex items-center justify-center mb-3 group-hover:border-[#d4af37]">
              <HardHat className="w-4 h-4 text-[#d4af37]" />
            </div>
            <h3 className="text-sm font-semibold text-white">Field Workers</h3>
            <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
              Capture time-bound, cryptographically nonced physical evidence preventing replay attacks.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F1015]/80 border border-[#232632] hover:border-[#d4af37]/60 transition-all backdrop-blur-md group">
            <div className="w-9 h-9 rounded-lg bg-[#08080A] border border-[#232632] flex items-center justify-center mb-3 group-hover:border-[#d4af37]">
              <Activity className="w-4 h-4 text-[#10b981]" />
            </div>
            <h3 className="text-sm font-semibold text-white">AI Verification</h3>
            <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
              Autonomous 10-stage pipeline: SHA-256 integrity, DINOv2 scene matching, and mask diff delta.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F1015]/80 border border-[#232632] hover:border-[#d4af37]/60 transition-all backdrop-blur-md group">
            <div className="w-9 h-9 rounded-lg bg-[#08080A] border border-[#232632] flex items-center justify-center mb-3 group-hover:border-[#d4af37]">
              <Building2 className="w-4 h-4 text-[#d4af37]" />
            </div>
            <h3 className="text-sm font-semibold text-white">Authorities</h3>
            <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
              Triage master issues, contract work orders, and review evidence in the 3D Verification Lab.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#232632]/80 bg-[#08080A]/80 px-6 py-6 text-center text-xs text-[#94A3B8]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Ground0. All Rights Reserved. Protected by Row Level Security & Zero Trust Evidence Protocols.</p>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="hover:text-[#d4af37] transition-colors">
              Operator Sign In
            </Link>
            <span className="text-[#232632]">•</span>
            <Link href="/profile" className="hover:text-[#d4af37] transition-colors">
              Access Clearance
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
