import type { ComplaintStatus, StatusHistoryStep } from '../types/complaints';

export const COMPLAINT_LIFECYCLE: { status: ComplaintStatus; title: string; description: string }[] = [
  {
    status: 'SUBMITTED',
    title: 'Report Submitted',
    description: 'Complaint registered and assigned unique public tracking identifier.',
  },
  {
    status: 'UNDER_REVIEW',
    title: 'AI Triage & Deduplication',
    description: 'Automated geospatial clustering and preliminary severity assessment.',
  },
  {
    status: 'ACCEPTED',
    title: 'Authority Accepted',
    description: 'Municipal authority validated the issue and confirmed jurisdiction.',
  },
  {
    status: 'WORK_ASSIGNED',
    title: 'Work Order Formulated',
    description: 'Contracted crew assigned with quantifiable completion criteria.',
  },
  {
    status: 'IN_PROGRESS',
    title: 'Physical Work In Progress',
    description: 'Field worker initiated cryptographically challenged Before-capture on-site.',
  },
  {
    status: 'VERIFYING',
    title: 'Ground0 AI Verification',
    description: 'Autonomous 10-stage pipeline: Integrity, Location, Scene identity, Change detection.',
  },
  {
    status: 'INSPECTOR_REVIEW',
    title: 'Inspector Decision Support',
    description: 'Municipal official inspecting dual-viewport verification artifacts and risk brief.',
  },
  {
    status: 'RESOLVED',
    title: 'Resolved & Citizen Verified',
    description: 'Physical work certified complete. Citizen Before/After comparison active.',
  },
];

/**
 * Calculates the status stepper history for a given current status
 */
export function getStatusHistory(currentStatus: ComplaintStatus, createdAt: string): StatusHistoryStep[] {
  if (currentStatus === 'REOPENED') {
    return [
      ...COMPLAINT_LIFECYCLE.map((step) => ({
        ...step,
        isCompleted: true,
        isCurrent: false,
      })),
      {
        status: 'REOPENED' as ComplaintStatus,
        title: 'Dispute / Reopened by Citizen',
        description: 'Citizen reported defect remains or submitted supplementary evidence.',
        isCompleted: false,
        isCurrent: true,
        timestamp: new Date().toISOString(),
      },
    ];
  }

  const currentIndex = COMPLAINT_LIFECYCLE.findIndex((item) => item.status === currentStatus);
  const effectiveIndex = currentIndex === -1 ? 0 : currentIndex;

  return COMPLAINT_LIFECYCLE.map((step, idx) => ({
    ...step,
    isCompleted: idx < effectiveIndex,
    isCurrent: idx === effectiveIndex,
    timestamp: idx === 0 ? createdAt : undefined,
  }));
}
