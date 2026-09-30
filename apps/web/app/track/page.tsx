'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Search, ArrowRight, ArrowLeft, Clock, FileText, CheckCircle2 } from 'lucide-react';

export default function TrackPage() {
  const router = useRouter();
  const [publicId, setPublicId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sampleTrackIds = [
    { id: 'GR0-2941', title: 'Severe Road Surface Defect near Overpass', status: 'SUBMITTED' },
    { id: 'GR0-1048', title: 'Overflowing Waste Accumulation on Sector 4', status: 'IN_PROGRESS' },
    { id: 'GR0-3189', title: 'Blocked Storm Drain at North Ward', status: 'VERIFYING' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = publicId.trim().toUpperCase();

    if (!cleanId) {
      setError('Please enter a valid tracking ID (e.g. GR0-2941).');
      return;
    }

    router.push(`/complaint/${cleanId}`);
  };

  return (
    <div className="min-h-screen bg-[#08080A] text-[#E2E8F0] px-4 py-8 md:py-16">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs text-[#94A3B8] hover:text-[#d4af37] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/report"
            className="text-xs text-[#d4af37] hover:underline font-medium"
          >
            Submit New Report
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#15171e] p-[1px] mx-auto mb-4 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            <div className="w-full h-full bg-[#08080A] rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 text-[#d4af37]" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Track Verification Status
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#94A3B8]">
            Enter your public identifier to monitor verification stages and inspector approvals in real time.
          </p>
        </div>

        <div className="bg-[#0F1015]/90 border border-[#232632] rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
                Public Identifier (GR0-XXXX)
              </label>
              <div className="relative">
                <input
                  id="tracking-id-input"
                  type="text"
                  required
                  value={publicId}
                  onChange={(e) => {
                    setPublicId(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. GR0-2941"
                  className="w-full bg-[#08080A] border border-[#232632] rounded-xl px-4 py-3.5 text-base font-mono uppercase tracking-widest text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-5 bg-gradient-to-r from-[#d4af37] to-[#aa8524] text-[#08080A] font-bold text-xs uppercase tracking-wider rounded-lg hover:brightness-110 active:brightness-95 transition-all flex items-center space-x-1.5"
                >
                  <span>Track</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}
          </form>

          {/* Sample quick links */}
          <div className="mt-8 pt-6 border-t border-[#232632]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-3">
              Sample Active Reports (Instant Lookup)
            </p>
            <div className="space-y-2">
              {sampleTrackIds.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => router.push(`/complaint/${item.id}`)}
                  className="w-full p-3 rounded-xl bg-[#08080A]/60 border border-[#232632] hover:border-[#d4af37]/60 text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold text-[#d4af37] group-hover:underline">
                      {item.id}
                    </span>
                    <span className="text-xs text-[#E2E8F0] line-clamp-1">{item.title}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded uppercase font-semibold bg-[#232632] text-[#94A3B8]">
                    {item.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
