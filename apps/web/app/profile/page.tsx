import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldCheck, User, Building, LogOut, CheckCircle, Clock, Calendar, ArrowLeft, Key } from 'lucide-react';
import { getCurrentProfile, getCurrentUser, signOut } from '../../lib/auth/actions';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();

  if (!user) {
    redirect('/login?redirectTo=/profile');
  }

  const roleColors: Record<string, { bg: string; text: string; border: string }> = {
    CITIZEN: { bg: 'bg-blue-950/40', text: 'text-blue-300', border: 'border-blue-800/60' },
    FIELD_WORKER: { bg: 'bg-amber-950/40', text: 'text-amber-300', border: 'border-amber-800/60' },
    CONTRACTOR: { bg: 'bg-indigo-950/40', text: 'text-indigo-300', border: 'border-indigo-800/60' },
    INSPECTOR: { bg: 'bg-emerald-950/40', text: 'text-emerald-300', border: 'border-emerald-800/60' },
    PROJECT_MANAGER: { bg: 'bg-purple-950/40', text: 'text-purple-300', border: 'border-purple-800/60' },
    ORGANIZATION_ADMIN: { bg: 'bg-yellow-950/40', text: 'text-yellow-300', border: 'border-yellow-800/60' },
    AUDITOR: { bg: 'bg-teal-950/40', text: 'text-teal-300', border: 'border-teal-800/60' },
    SUPER_ADMIN: { bg: 'bg-rose-950/40', text: 'text-rose-300', border: 'border-rose-800/60' },
  };

  const currentRole = profile?.role || 'CITIZEN';
  const roleStyle = roleColors[currentRole] || roleColors.CITIZEN;

  return (
    <div className="min-h-screen bg-[#08080A] text-[#E2E8F0] px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 text-xs text-[#94A3B8] hover:text-[#d4af37] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Command Center</span>
          </Link>

          <form action={signOut}>
            <button
              id="profile-signout-button"
              type="submit"
              className="inline-flex items-center space-x-2 px-3.5 py-2 bg-[#0F1015] border border-[#232632] hover:border-red-800/80 hover:bg-red-950/20 text-xs font-medium text-[#94A3B8] hover:text-red-300 rounded-lg transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>

        {/* Profile Identity Card */}
        <div className="bg-[#0F1015]/90 border border-[#232632] rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Subtle gold line accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#232632]">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37]/30 to-[#08080A] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-wide">
                  {profile?.full_name || 'Ground0 Operator'}
                </h1>
                <p className="text-xs text-[#94A3B8] mt-0.5 font-mono">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
                {currentRole.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Identity Parameters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-[#08080A]/60 border border-[#232632] rounded-xl space-y-1">
              <div className="flex items-center space-x-2 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                <Key className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Operator Identifier (UUID)</span>
              </div>
              <p className="text-xs font-mono text-[#E2E8F0] break-all">{user.id}</p>
            </div>

            <div className="p-4 bg-[#08080A]/60 border border-[#232632] rounded-xl space-y-1">
              <div className="flex items-center space-x-2 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                <Building className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Organization Node</span>
              </div>
              <p className="text-xs text-[#E2E8F0]">
                {profile?.organization_id ? (
                  <span className="font-mono text-xs">{profile.organization_id}</span>
                ) : (
                  <span className="text-[#94A3B8] italic">Independent Citizen Node</span>
                )}
              </p>
            </div>

            <div className="p-4 bg-[#08080A]/60 border border-[#232632] rounded-xl space-y-1">
              <div className="flex items-center space-x-2 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Verification Enrolled Since</span>
              </div>
              <p className="text-xs text-[#E2E8F0]">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Active'}
              </p>
            </div>

            <div className="p-4 bg-[#08080A]/60 border border-[#232632] rounded-xl space-y-1">
              <div className="flex items-center space-x-2 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Evidentiary Clearance</span>
              </div>
              <p className="text-xs text-[#10B981] font-semibold">
                ACTIVE & CRYPTOGRAPHICALLY SECURED
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
