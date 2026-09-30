-- ==============================================================================
-- GROUND0 DATABASE MIGRATION: CORE SCHEMA
-- Migration: 20260930000001_core_schema.sql
-- Description: Creates extensions, custom types, and all 29 relational tables
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM TYPES / ENUMS
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM (
        'CITIZEN',
        'FIELD_WORKER',
        'CONTRACTOR',
        'INSPECTOR',
        'PROJECT_MANAGER',
        'ORGANIZATION_ADMIN',
        'AUDITOR',
        'SUPER_ADMIN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE organization_type AS ENUM (
        'MUNICIPALITY',
        'CONTRACTOR',
        'AUDITOR',
        'AGENCY'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE complaint_status_type AS ENUM (
        'SUBMITTED',
        'UNDER_REVIEW',
        'ACCEPTED',
        'WORK_ASSIGNED',
        'IN_PROGRESS',
        'VERIFYING',
        'INSPECTOR_REVIEW',
        'RESOLVED',
        'REOPENED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE priority_level_type AS ENUM (
        'LOW',
        'MEDIUM',
        'HIGH',
        'CRITICAL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE work_order_status_type AS ENUM (
        'DRAFT',
        'ASSIGNED',
        'IN_PROGRESS',
        'COMPLETED_PENDING_VERIFICATION',
        'VERIFIED',
        'REJECTED',
        'CLOSED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE capture_session_type AS ENUM (
        'BEFORE_WORK',
        'AFTER_WORK'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE capture_session_status_type AS ENUM (
        'ACTIVE',
        'SUBMITTED',
        'EXPIRED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE evidence_type_enum AS ENUM (
        'BEFORE',
        'AFTER',
        'IN_PROGRESS'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_run_status_type AS ENUM (
        'QUEUED',
        'PROCESSING',
        'COMPLETED',
        'FAILED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_step_status_type AS ENUM (
        'PENDING',
        'RUNNING',
        'PASSED',
        'FAILED',
        'WARNING'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE risk_level_type AS ENUM (
        'LOW',
        'MEDIUM',
        'HIGH',
        'CRITICAL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ai_recommendation_type AS ENUM (
        'READY_FOR_HUMAN_REVIEW',
        'FLAG_FOR_AUDIT',
        'INSUFFICIENT_EVIDENCE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE review_decision_type AS ENUM (
        'APPROVED',
        'REJECTED',
        'MORE_EVIDENCE_REQUESTED',
        'DISPATCH_PHYSICAL_INSPECTOR'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE camera_protocol_type AS ENUM (
        'RTSP',
        'ONVIF',
        'WEBRTC'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE camera_status_type AS ENUM (
        'ONLINE',
        'OFFLINE',
        'ERROR'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE data_source_type AS ENUM (
        'MEASURED',
        'REPORTED',
        'ESTIMATED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. COMMON TRIGGER FUNCTION FOR UPDATED_AT
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 4. TABLE DEFINITIONS (29 TABLES)
-- ==============================================================================

-- 1. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    org_type organization_type NOT NULL DEFAULT 'MUNICIPALITY',
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role_type NOT NULL DEFAULT 'CITIZEN',
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ORGANIZATION_MEMBERS
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role_type NOT NULL DEFAULT 'FIELD_WORKER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_org_user UNIQUE (organization_id, user_id)
);

-- 4. SITES
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    zone_code TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    boundary_geojson JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ASSETS
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL,
    identifier TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    budget NUMERIC(14, 2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. MASTER_ISSUES (Consolidated duplicate clusters)
CREATE TABLE IF NOT EXISTS master_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id TEXT NOT NULL UNIQUE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    status complaint_status_type NOT NULL DEFAULT 'SUBMITTED',
    priority priority_level_type NOT NULL DEFAULT 'MEDIUM',
    complaint_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. COMPLAINTS (Citizen reports)
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id TEXT NOT NULL UNIQUE,
    citizen_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    location_accuracy_m NUMERIC(8, 2) DEFAULT 10.0,
    address_text TEXT,
    status complaint_status_type NOT NULL DEFAULT 'SUBMITTED',
    priority priority_level_type NOT NULL DEFAULT 'MEDIUM',
    ai_classification JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. COMPLAINT_MEDIA
CREATE TABLE IF NOT EXISTS complaint_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('IMAGE', 'VIDEO', 'AUDIO')),
    storage_path TEXT NOT NULL,
    sha256_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. COMPLAINT_ISSUE_LINKS (Many-to-one junction)
CREATE TABLE IF NOT EXISTS complaint_issue_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    master_issue_id UUID NOT NULL REFERENCES master_issues(id) ON DELETE CASCADE,
    match_confidence NUMERIC(5, 4) NOT NULL DEFAULT 1.0000,
    linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_complaint_link UNIQUE (complaint_id)
);

-- 11. WORK_ORDERS (Contracted physical jobs)
CREATE TABLE IF NOT EXISTS work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id TEXT NOT NULL UNIQUE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    master_issue_id UUID REFERENCES master_issues(id) ON DELETE SET NULL,
    site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    issue_type TEXT NOT NULL,
    priority priority_level_type NOT NULL DEFAULT 'MEDIUM',
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    tolerance_radius_m NUMERIC(6, 2) NOT NULL DEFAULT 50.00,
    assigned_contractor_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    assigned_worker_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status work_order_status_type NOT NULL DEFAULT 'DRAFT',
    deadline TIMESTAMPTZ,
    camera_verification_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. WORK_ORDER_REQUIREMENTS (Quantifiable contractual clauses)
CREATE TABLE IF NOT EXISTS work_order_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL,
    target_area TEXT NOT NULL,
    expected_state TEXT NOT NULL,
    required_evidence_angles JSONB NOT NULL DEFAULT '["FRONT", "LEFT", "RIGHT"]'::jsonb,
    completion_threshold_pct NUMERIC(5, 2) NOT NULL DEFAULT 85.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. ASSIGNMENTS
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    assignee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. CAPTURE_SESSIONS (Anti-replay single-use tokens)
CREATE TABLE IF NOT EXISTS capture_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    session_type capture_session_type NOT NULL,
    server_nonce TEXT NOT NULL UNIQUE,
    status capture_session_status_type NOT NULL DEFAULT 'ACTIVE',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. EVIDENCE
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capture_session_id UUID NOT NULL REFERENCES capture_sessions(id) ON DELETE CASCADE,
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    evidence_type evidence_type_enum NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('IMAGE', 'VIDEO')),
    storage_path TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    altitude_m NUMERIC(8, 2),
    device_heading_deg NUMERIC(6, 2),
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. EVIDENCE_HASHES (Integrity verification)
CREATE TABLE IF NOT EXISTS evidence_hashes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_id UUID NOT NULL UNIQUE REFERENCES evidence(id) ON DELETE CASCADE,
    sha256 TEXT NOT NULL,
    phash TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. EVIDENCE_EMBEDDINGS (Scene matching vectors)
CREATE TABLE IF NOT EXISTS evidence_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_id UUID NOT NULL UNIQUE REFERENCES evidence(id) ON DELETE CASCADE,
    model_name TEXT NOT NULL,
    embedding JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. VERIFICATION_RUNS
CREATE TABLE IF NOT EXISTS verification_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    before_evidence_id UUID NOT NULL REFERENCES evidence(id) ON DELETE RESTRICT,
    after_evidence_id UUID NOT NULL REFERENCES evidence(id) ON DELETE RESTRICT,
    status verification_run_status_type NOT NULL DEFAULT 'QUEUED',
    triggered_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 19. VERIFICATION_STEPS
CREATE TABLE IF NOT EXISTS verification_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_run_id UUID NOT NULL REFERENCES verification_runs(id) ON DELETE CASCADE,
    step_name TEXT NOT NULL,
    status verification_step_status_type NOT NULL DEFAULT 'PENDING',
    score NUMERIC(5, 4),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    execution_duration_ms INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. VERIFICATION_RESULTS
CREATE TABLE IF NOT EXISTS verification_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_run_id UUID NOT NULL UNIQUE REFERENCES verification_runs(id) ON DELETE CASCADE,
    location_verified BOOLEAN NOT NULL DEFAULT FALSE,
    fresh_evidence_passed BOOLEAN NOT NULL DEFAULT FALSE,
    duplicate_check_passed BOOLEAN NOT NULL DEFAULT FALSE,
    scene_match_score NUMERIC(5, 4) NOT NULL DEFAULT 0.0000,
    physical_change_score NUMERIC(5, 4) NOT NULL DEFAULT 0.0000,
    requirement_satisfied BOOLEAN NOT NULL DEFAULT FALSE,
    overall_risk_level risk_level_type NOT NULL DEFAULT 'HIGH',
    ai_recommendation ai_recommendation_type NOT NULL DEFAULT 'INSUFFICIENT_EVIDENCE',
    explanation TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. RISK_FLAGS
CREATE TABLE IF NOT EXISTS risk_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_run_id UUID NOT NULL REFERENCES verification_runs(id) ON DELETE CASCADE,
    flag_code TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. CAMERAS
CREATE TABLE IF NOT EXISTS cameras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    rtsp_stream_url_encrypted TEXT,
    webrtc_stream_url TEXT,
    protocol camera_protocol_type NOT NULL DEFAULT 'RTSP',
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    status camera_status_type NOT NULL DEFAULT 'OFFLINE',
    last_heartbeat_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 23. CAMERA_EVENTS
CREATE TABLE IF NOT EXISTS camera_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camera_id UUID NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    snapshot_storage_path TEXT NOT NULL,
    confidence NUMERIC(5, 4) DEFAULT 1.0000,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 24. HUMAN_REVIEWS
CREATE TABLE IF NOT EXISTS human_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_run_id UUID NOT NULL REFERENCES verification_runs(id) ON DELETE CASCADE,
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    decision review_decision_type NOT NULL,
    notes TEXT,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 25. CITIZEN_FEEDBACK
CREATE TABLE IF NOT EXISTS citizen_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    citizen_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    is_resolved BOOLEAN NOT NULL DEFAULT TRUE,
    comments TEXT,
    feedback_evidence_storage_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 26. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    reference_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 27. ENVIRONMENTAL_METRICS
CREATE TABLE IF NOT EXISTS environmental_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,
    value NUMERIC(12, 4) NOT NULL,
    data_source data_source_type NOT NULL DEFAULT 'ESTIMATED',
    calculation_basis TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 28. AUDIT_EVENTS (Immutable append-only audit trail)
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    ip_address INET,
    payload_diff JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 29. INTEGRATION_CONFIGS
CREATE TABLE IF NOT EXISTS integration_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_org_service UNIQUE (organization_id, service_name)
);

-- ==============================================================================
-- 5. PERFORMANCE & AUDIT INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_org ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_geo ON complaints(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_master_issues_org ON master_issues(organization_id);
CREATE INDEX IF NOT EXISTS idx_master_issues_geo ON master_issues(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_work_orders_org ON work_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_worker ON work_orders(assigned_worker_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_contractor ON work_orders(assigned_contractor_id);
CREATE INDEX IF NOT EXISTS idx_capture_sessions_nonce ON capture_sessions(server_nonce);
CREATE INDEX IF NOT EXISTS idx_evidence_work_order ON evidence(work_order_id);
CREATE INDEX IF NOT EXISTS idx_evidence_hashes_sha ON evidence_hashes(sha256);
CREATE INDEX IF NOT EXISTS idx_evidence_hashes_phash ON evidence_hashes(phash);
CREATE INDEX IF NOT EXISTS idx_verification_runs_wo ON verification_runs(work_order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_events_resource ON audit_events(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created ON audit_events(created_at DESC);

-- ==============================================================================
-- 6. AUTOMATIC TIMESTAMP TRIGGERS
-- ==============================================================================
DROP TRIGGER IF EXISTS set_timestamp_organizations ON organizations;
CREATE TRIGGER set_timestamp_organizations BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_profiles ON profiles;
CREATE TRIGGER set_timestamp_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_sites ON sites;
CREATE TRIGGER set_timestamp_sites BEFORE UPDATE ON sites FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_projects ON projects;
CREATE TRIGGER set_timestamp_projects BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_master_issues ON master_issues;
CREATE TRIGGER set_timestamp_master_issues BEFORE UPDATE ON master_issues FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_complaints ON complaints;
CREATE TRIGGER set_timestamp_complaints BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_work_orders ON work_orders;
CREATE TRIGGER set_timestamp_work_orders BEFORE UPDATE ON work_orders FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_cameras ON cameras;
CREATE TRIGGER set_timestamp_cameras BEFORE UPDATE ON cameras FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
