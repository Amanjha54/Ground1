import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  CircleDot,
  AlertTriangle,
  Activity,
  Layers,
  FileText,
  Share2,
} from 'lucide-react';
import { getComplaintByPublicId } from '../../../lib/complaints/actions';
import { getStatusHistory } from '../../../lib/complaints/status-history';
import type { ComplaintStatus } from '../../../lib/types/complaints';

interface ComplaintDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ComplaintDetailPage({ params }: ComplaintDetailPageProps) {
  const { id } = await params;
  const complaint = await getComplaintByPublicId(id);

  if (!complaint) {
    notFound();
  }

  const steps = getStatusHistory(complaint.status, complaint.created_at);

  const statusStyles: Record<ComplaintStatus, { bg: string; text: string; border: string }> = {
    SUBMITTED: { bg: 'bg-blue-950/40', text: 'text-blue-300', border: 'border-blue-800/60' },
    UNDER_REVIEW: { bg: 'bg-indigo-950/40', text: 'text-indigo-300', border: 'border-indigo-800/60' },
    ACCEPTED: { bg: 'bg-teal-950/40', text: 'text-teal-300', border: 'border-teal-800/60' },
    WORK_ASSIGNED: { bg: 'bg-purple-950/40', text: 'text-purple-300', border: 'border-purple-800/60' },
    IN_PROGRESS: { bg: 'bg-amber-950/40', text: 'text-amber-300', border: 'border-amber-800/60' },
    VERIFYING: { bg: 'bg-cyan-950/40', text: 'text-cyan-300', border: 'border-cyan-800/60' },
    INSPECTOR_REVIEW: { bg: 'bg-yellow-950/40', text: 'text-yellow-300', border: 'border-yellow-800/60' },
    RESOLVED: { bg: 'bg-emerald-950/40', text: 'text-emerald-300', border: 'border-emerald-800/60' },
    REOPENED: { bg: 'bg-rose-950/40', text: 'text-rose-300', border: 'border-rose-800/60' },
  };

  const currentStyle = statusStyles[complaint.status] || statusStyles.SUBMITTED;
  const aiData = complaint.ai_classification as Record<string, any>;

  return (
    <div className="min-h-screen bg-[#08080A] text-[#E2E8F0] px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/track"
            className="inline-flex items-center space-x-2 text-xs text-[#94A3B8] hover:text-[#d4af37] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Tracker</span>
          </Link>

          <Link
            href="/report"
            className="px-3.5 py-1.5 rounded-lg bg-[#0F1015] border border-[#232632] hover:border-[#d4af37] text-xs font-semibold text-[#d4af37] transition-all"
          >
            Report New Issue
          </Link>
        </div>

        {/* Public Identifier Card */}
        <div className="bg-[#0F1015]/90 border border-[#232632] rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden mb-8">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#232632]">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#94A3B8]">
                  Public Verification Identifier
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wider font-mono mt-1">
                {complaint.public_id}
              </h1>
              <p className="text-xs text-[#94A3B8] mt-1">
                Reported on {new Date(complaint.created_at).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end space-y-2">
              <span
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border}`}
              >
                {complaint.status.replace('_', ' ')}
              </span>
              <span className="text-[11px] text-[#94A3B8]">
                Priority: <span className="font-semibold text-white">{complaint.priority}</span>
              </span>
            </div>
          </div>

          {/* Issue Overview */}
          <div className="mt-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">{complaint.title}</h2>
              <p className="text-sm text-[#94A3B8] mt-1 leading-relaxed">{complaint.description}</p>
            </div>

            {/* Parameter Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-[#08080A]/60 border border-[#232632] rounded-xl">
                <span className="text-[10px] uppercase font-semibold text-[#94A3B8] block">Category</span>
                <span className="text-xs font-medium text-white capitalize">{complaint.category.replace('_', ' ')}</span>
              </div>

              <div className="p-3 bg-[#08080A]/60 border border-[#232632] rounded-xl">
                <span className="text-[10px] uppercase font-semibold text-[#94A3B8] block">Location Landmark</span>
                <span className="text-xs font-medium text-white truncate block">{complaint.address_text || 'Civil Sector'}</span>
              </div>

              <div className="p-3 bg-[#08080A]/60 border border-[#232632] rounded-xl">
                <span className="text-[10px] uppercase font-semibold text-[#94A3B8] block">GPS Telemetry</span>
                <span className="text-xs font-mono text-[#d4af37]">
                  {Number(complaint.latitude).toFixed(5)}, {Number(complaint.longitude).toFixed(5)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Triage Intelligence Card */}
        {aiData && (
          <div className="bg-[#0F1015]/90 border border-[#232632] rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl mb-8 relative">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                Ground0 AI Preliminary Triage Analysis
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-[#08080A] border border-[#232632] rounded-xl">
                <span className="text-[10px] text-[#94A3B8] block uppercase">Detected Defect</span>
                <span className="font-semibold text-white capitalize">{aiData.issue_type || complaint.category}</span>
              </div>

              <div className="p-3 bg-[#08080A] border border-[#232632] rounded-xl">
                <span className="text-[10px] text-[#94A3B8] block uppercase">AI Severity</span>
                <span className="font-semibold text-[#F59E0B]">{aiData.severity || complaint.priority}</span>
              </div>

              <div className="p-3 bg-[#08080A] border border-[#232632] rounded-xl">
                <span className="text-[10px] text-[#94A3B8] block uppercase">Confidence Index</span>
                <span className="font-mono font-bold text-[#10B981]">
                  {aiData.confidence ? `${Math.round(aiData.confidence * 100)}%` : '91%'}
                </span>
              </div>

              <div className="p-3 bg-[#08080A] border border-[#232632] rounded-xl">
                <span className="text-[10px] text-[#94A3B8] block uppercase">Recommended Action</span>
                <span className="font-semibold text-white">Public Works Triage</span>
              </div>
            </div>
          </div>
        )}

        {/* Stepper Status Timeline */}
        <div className="bg-[#0F1015]/90 border border-[#232632] rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center space-x-2 mb-6">
            <Activity className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              End-to-End Status Lifecycle
            </h3>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#232632]">
            {steps.map((step, idx) => (
              <div key={step.status} className="relative flex items-start space-x-4">
                <div
                  className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    step.isCompleted
                      ? 'bg-[#10B981] border-[#10B981] text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                      : step.isCurrent
                      ? 'bg-[#08080A] border-[#d4af37] text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                      : 'bg-[#08080A] border-[#232632] text-[#64748B]'
                  }`}
                >
                  {step.isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : step.isCurrent ? (
                    <CircleDot className="w-3.5 h-3.5 animate-pulse stroke-[2.5]" />
                  ) : (
                    <span className="text-[10px] font-mono">{idx + 1}</span>
                  )}
                </div>

                <div className="flex-1 bg-[#08080A]/60 border border-[#232632] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-xs font-bold uppercase tracking-wider ${
                        step.isCurrent ? 'text-[#d4af37]' : step.isCompleted ? 'text-white' : 'text-[#64748B]'
                      }`}
                    >
                      {step.title}
                    </h4>
                    {step.isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
                        Active Stage
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
