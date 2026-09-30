// ==============================================================================
// GROUND0 CITIZEN COMPLAINT TYPES & ENUMS
// ==============================================================================

export type ComplaintCategory =
  | 'pothole'
  | 'garbage'
  | 'drain_blockage'
  | 'water_leakage'
  | 'broken_streetlight'
  | 'road_damage'
  | 'illegal_dumping'
  | 'damaged_infrastructure'
  | 'environmental_issue'
  | 'other';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'WORK_ASSIGNED'
  | 'IN_PROGRESS'
  | 'VERIFYING'
  | 'INSPECTOR_REVIEW'
  | 'RESOLVED'
  | 'REOPENED';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AIClassificationResult {
  issue_type: string;
  severity: ComplaintPriority;
  confidence: number;
  short_description: string;
  recommended_category: ComplaintCategory;
}

export interface Complaint {
  id: string;
  public_id: string;
  citizen_id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  latitude: number;
  longitude: number;
  location_accuracy_m: number;
  address_text: string | null;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  ai_classification: AIClassificationResult | Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface StatusHistoryStep {
  status: ComplaintStatus;
  title: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  timestamp?: string;
}

export const COMPLAINT_CATEGORIES: {
  id: ComplaintCategory;
  label: string;
  description: string;
  iconName: string;
}[] = [
  { id: 'pothole', label: 'Pothole', description: 'Road cavities, surface craters, asphalt gaps', iconName: 'AlertTriangle' },
  { id: 'garbage', label: 'Garbage Accumulation', description: 'Solid waste, roadside litter, overflowing bins', iconName: 'Trash2' },
  { id: 'drain_blockage', label: 'Drain Blockage', description: 'Clogged storm drains, water stagnation', iconName: 'Droplets' },
  { id: 'water_leakage', label: 'Water Leakage', description: 'Burst municipal supply pipes, main line bursts', iconName: 'Waves' },
  { id: 'broken_streetlight', label: 'Broken Streetlight', description: 'Non-functioning public illumination or damaged poles', iconName: 'Lightbulb' },
  { id: 'road_damage', label: 'Road Damage', description: 'Subsidence, surface cracks, crumbling pavement', iconName: 'Construction' },
  { id: 'illegal_dumping', label: 'Illegal Dumping', description: 'Industrial dumping or unauthorized debris disposal', iconName: 'ShieldAlert' },
  { id: 'damaged_infrastructure', label: 'Damaged Infrastructure', description: 'Broken guardrails, collapsed curbs, bridge damage', iconName: 'Building' },
  { id: 'environmental_issue', label: 'Environmental Issue', description: 'Hazardous spills, park neglect, tree hazards', iconName: 'Leaf' },
  { id: 'other', label: 'Other Infrastructure Defect', description: 'Civil issues not listed above', iconName: 'HelpCircle' },
];
