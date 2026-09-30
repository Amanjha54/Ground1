'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  MapPin,
  AlertTriangle,
  Trash2,
  Droplets,
  Waves,
  Lightbulb,
  Construction,
  ShieldAlert,
  Building,
  Leaf,
  HelpCircle,
  ArrowRight,
  Crosshair,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { COMPLAINT_CATEGORIES, type ComplaintCategory } from '../../lib/types/complaints';
import { createComplaint } from '../../lib/complaints/actions';

export default function ReportPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('pothole');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [addressText, setAddressText] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-acquire approximate geolocation on mount
  useEffect(() => {
    handleAcquireLocation();
  }, []);

  const handleAcquireLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setAccuracy(Math.round(position.coords.accuracy));
        setGeoLoading(false);
        if (!addressText) {
          setAddressText(`GPS Coordinates: ${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`);
        }
      },
      (err) => {
        setGeoError(`Location notice: ${err.message}. Using default municipal zone.`);
        // Fallback demo coordinates (Metro Center)
        setLatitude(28.62501);
        setLongitude(77.21503);
        setAccuracy(15);
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const getCategoryIcon = (id: ComplaintCategory) => {
    switch (id) {
      case 'pothole': return AlertTriangle;
      case 'garbage': return Trash2;
      case 'drain_blockage': return Droplets;
      case 'water_leakage': return Waves;
      case 'broken_streetlight': return Lightbulb;
      case 'road_damage': return Construction;
      case 'illegal_dumping': return ShieldAlert;
      case 'damaged_infrastructure': return Building;
      case 'environmental_issue': return Leaf;
      default: return HelpCircle;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Please provide an issue title and description.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('latitude', latitude ? latitude.toString() : '28.62501');
    formData.append('longitude', longitude ? longitude.toString() : '77.21503');
    formData.append('accuracy', accuracy ? accuracy.toString() : '10.0');
    formData.append('addressText', addressText || 'Public Right-of-Way');

    try {
      const res = await createComplaint(formData);
      if (res.success && res.publicId) {
        router.push(`/complaint/${res.publicId}`);
      } else {
        setError(res.error || 'Failed to submit complaint. Please retry.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080A] text-[#E2E8F0] px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs text-[#94A3B8] hover:text-[#d4af37] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/track"
            className="text-xs text-[#d4af37] hover:underline font-medium"
          >
            Track Existing Report
          </Link>
        </div>

        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0F1015] border border-[#232632] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="text-[11px] uppercase tracking-wider text-[#94A3B8]">
              Citizen Public Intake Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Report a Physical Issue
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#94A3B8] max-w-lg mx-auto">
            Provide details of visible defects. Ground0 verifies work orders against actual evidence upon completion.
          </p>
        </div>

        {/* Main Intake Form Card */}
        <div className="bg-[#0F1015]/90 border border-[#232632] rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
          {error && (
            <div className="mb-6 p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl flex items-start space-x-3 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2.5">
                Select Defect Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {COMPLAINT_CATEGORIES.map((cat) => {
                  const Icon = getCategoryIcon(cat.id);
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#d4af37] bg-[#d4af37]/10 shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                          : 'border-[#232632] bg-[#08080A]/60 hover:border-[#64748B]'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#d4af37]' : 'text-[#94A3B8]'}`} />
                        <span className="text-xs font-medium text-white">{cat.label}</span>
                      </div>
                      <span className="text-[10px] text-[#94A3B8] mt-1 line-clamp-1">
                        {cat.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                Issue Summary / Title
              </label>
              <input
                id="complaint-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deep pothole causing vehicle damage near bus stop"
                className="w-full bg-[#08080A] border border-[#232632] rounded-xl px-4 py-3 text-sm text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                Detailed Observation
              </label>
              <textarea
                id="complaint-desc-input"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe size, depth, safety hazard, traffic obstruction, or visible landmarks..."
                className="w-full bg-[#08080A] border border-[#232632] rounded-xl px-4 py-3 text-sm text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] resize-none"
              />
            </div>

            {/* Geolocation Telemetry */}
            <div className="p-4 bg-[#08080A]/80 border border-[#232632] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-[#d4af37]" />
                  <span>Geospatial Verification Coordinates</span>
                </div>
                <button
                  type="button"
                  onClick={handleAcquireLocation}
                  disabled={geoLoading}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0F1015] border border-[#232632] hover:border-[#d4af37] text-xs text-[#d4af37] font-medium transition-all"
                >
                  <Crosshair className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
                  <span>{geoLoading ? 'Acquiring...' : 'Refresh GPS'}</span>
                </button>
              </div>

              {latitude && longitude ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#0F1015] border border-[#232632]">
                    <span className="text-[10px] text-[#94A3B8] block uppercase">Latitude</span>
                    <span className="font-mono text-white font-medium">{latitude.toFixed(6)}°</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0F1015] border border-[#232632]">
                    <span className="text-[10px] text-[#94A3B8] block uppercase">Longitude</span>
                    <span className="font-mono text-white font-medium">{longitude.toFixed(6)}°</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0F1015] border border-[#232632] col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-[#94A3B8] block uppercase">Accuracy Radius</span>
                    <span className="font-mono text-[#10B981] font-medium">±{accuracy || 10} meters</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#94A3B8] italic">Click Refresh GPS to attach high-accuracy coordinates.</p>
              )}

              {geoError && <p className="text-[11px] text-amber-400">{geoError}</p>}

              <div>
                <label className="block text-[11px] font-medium text-[#94A3B8] mb-1 uppercase tracking-wider">
                  Landmark / Street Address
                </label>
                <input
                  id="complaint-address-input"
                  type="text"
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  placeholder="e.g. Opposite Pillar 14, Main Arterial Road"
                  className="w-full bg-[#0F1015] border border-[#232632] rounded-lg px-3 py-2 text-xs text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            {/* Submission Action */}
            <button
              id="submit-complaint-btn"
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] via-[#e2c563] to-[#aa8524] text-[#08080A] font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 active:brightness-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)] flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>Registering Complaint...</span>
              ) : (
                <>
                  <span>Submit Physical Report</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
