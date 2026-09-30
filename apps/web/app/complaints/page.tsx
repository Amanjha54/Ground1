import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Plus, ArrowLeft, ArrowRight, AlertTriangle, Trash2, Droplets, Clock, MapPin, Eye } from 'lucide-react';
import { getCitizenComplaints } from '../../lib/complaints/actions';
import type { Complaint } from '../../lib/types/complaints';

export default async function ComplaintsPage() {
  const userComplaints = await getCitizenComplaints();

  // Baseline demo complaints if DB is fresh
  const displayComplaints: Complaint[] = userComplaints.length > 0 ? userComplaints : [
    {
      id: 'demo-1',
      public_id: 'GR0-2941',
      citizen_id: 'citizen-demo-uuid',
      title: 'Severe Road Surface Defect near Overpass',
      description: 'Pothole defect on Outer Ring Road causing severe traffic swerving and hazard.',
      category: 'pothole',
      latitude: 28.6250100,
      longitude: 77.2150300,
      location_accuracy_m: 6.5,
      address_text: 'Sector 4 Highway Overpass, Pillar 12',
      status: 'SUBMITTED',
      priority: 'HIGH',
      ai_classification: {
        issue_type: 'pothole',
        severity: 'HIGH',
        confidence: 0.93,
        short_description: 'Visible asphalt disruption and cavity',
        recommended_category: 'pothole',
      },
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      public_id: 'GR0-1048',
      citizen_id: 'citizen-demo-uuid',
      title: 'Illegal Solid Waste Dumping along North Ward Corridor',
      description: 'Accumulation of debris and plastic packaging obstructing sidewalk.',
      category: 'garbage',
      latitude: 28.6139391,
      longitude: 77.2090212,
      location_accuracy_m: 5.0,
      address_text: 'North Ward Civil Sector, Near Gate 2',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      ai_classification: {
        issue_type: 'garbage',
        severity: 'MEDIUM',
        confidence: 0.89,
        short_description: 'Solid waste accumulation on walkway',
        recommended_category: 'garbage',
      },
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      public_id: 'GR0-3189',
      citizen_id: 'citizen-demo-uuid',
      title: 'Clogged Storm Drain at North Ward',
      description: 'Storm drain grate clogged with silt causing rainwater stagnation.',
      category: 'drain_blockage',
      latitude: 28.6152000,
      longitude: 77.2110000,
      location_accuracy_m: 8.0,
      address_text: 'Intersection of Road 4 and 7',
      status: 'VERIFYING',
      priority: 'HIGH',
      ai_classification: {
        issue_type: 'drain_blockage',
        severity: 'HIGH',
        confidence: 0.91,
        short_description: 'Drain blockage and silt accumulation',
        recommended_category: 'drain_blockage',
      },
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  return (
    <div className="min-h-screen bg-[#08080A] text-[#E2E8F0] px-4 py-8 md:py-12">
      <div className="max-w-5xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-xs text-[#94A3B8] hover:text-[#d4af37] transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Command Center</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Civil Infrastructure Reports
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
              Real-time audit records of citizen-submitted physical defect claims.
            </p>
          </div>

          <Link
            href="/report"
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#aa8524] text-[#08080A] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 active:brightness-95 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            <Plus className="w-4 h-4" />
            <span>Report Issue</span>
          </Link>
        </div>

        {/* Complaints Grid */}
        <div className="space-y-3">
          {displayComplaints.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-[#0F1015]/90 border border-[#232632] hover:border-[#d4af37]/60 rounded-2xl transition-all backdrop-blur-xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-bold text-[#d4af37]">
                    {item.public_id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-[#232632] text-[#94A3B8]">
                    {item.status.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-[#94A3B8] capitalize">
                    {item.category.replace('_', ' ')}
                  </span>
                </div>

                <h2 className="text-base font-semibold text-white group-hover:text-[#d4af37] transition-colors">
                  {item.title}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#94A3B8] pt-1">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>{item.address_text || 'Civil Sector'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center sm:self-center">
                <Link
                  href={`/complaint/${item.public_id}`}
                  className="px-4 py-2 rounded-xl bg-[#08080A] border border-[#232632] hover:border-[#d4af37] text-xs font-semibold text-[#E2E8F0] group-hover:text-[#d4af37] transition-all flex items-center space-x-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Audit</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
