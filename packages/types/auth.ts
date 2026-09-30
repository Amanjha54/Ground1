// ==============================================================================
// GROUND0 ROLE-BASED ACCESS CONTROL & AUTH TYPES
// ==============================================================================

export type UserRole =
  | 'CITIZEN'
  | 'FIELD_WORKER'
  | 'CONTRACTOR'
  | 'INSPECTOR'
  | 'PROJECT_MANAGER'
  | 'ORGANIZATION_ADMIN'
  | 'AUDITOR'
  | 'SUPER_ADMIN';

export type OrganizationType = 'MUNICIPALITY' | 'CONTRACTOR' | 'AUDITOR' | 'AGENCY';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  org_type: OrganizationType;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AuthSessionState {
  user: {
    id: string;
    email: string;
  } | null;
  profile: UserProfile | null;
  organization: Organization | null;
  isLoading: boolean;
}

/**
 * Route protection permission matrix.
 * Defines which roles are granted access to specific route prefixes.
 */
export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/dashboard': ['INSPECTOR', 'PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'AUDITOR', 'SUPER_ADMIN'],
  '/complaints': ['CITIZEN', 'INSPECTOR', 'PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'AUDITOR', 'SUPER_ADMIN'],
  '/report': ['CITIZEN', 'SUPER_ADMIN'],
  '/work-orders': ['FIELD_WORKER', 'CONTRACTOR', 'INSPECTOR', 'PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN'],
  '/work-orders/new': ['PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN'],
  '/capture': ['FIELD_WORKER', 'SUPER_ADMIN'],
  '/verification-lab': ['INSPECTOR', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN'],
  '/cameras': ['ORGANIZATION_ADMIN', 'SUPER_ADMIN'],
  '/analytics': ['PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'AUDITOR', 'SUPER_ADMIN'],
  '/audit': ['AUDITOR', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN'],
  '/admin': ['ORGANIZATION_ADMIN', 'SUPER_ADMIN'],
  '/profile': ['CITIZEN', 'FIELD_WORKER', 'CONTRACTOR', 'INSPECTOR', 'PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'AUDITOR', 'SUPER_ADMIN'],
};
