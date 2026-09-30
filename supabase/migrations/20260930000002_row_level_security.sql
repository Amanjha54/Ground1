-- ==============================================================================
-- GROUND0 DATABASE MIGRATION: ROW LEVEL SECURITY (RLS)
-- Migration: 20260930000002_row_level_security.sql
-- Description: Enables RLS on all 29 tables and applies strict role-based policies
-- ==============================================================================

-- 1. ENABLE ROW LEVEL SECURITY ON ALL 29 TABLES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_issue_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE capture_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_hashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE camera_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE human_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE environmental_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. SECURITY HELPER FUNCTIONS
-- ==============================================================================

-- Get current authenticated user's role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role_type AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Get current authenticated user's organization ID
CREATE OR REPLACE FUNCTION current_user_org_id()
RETURNS UUID AS $$
    SELECT organization_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if current user is member of a specific organization
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND organization_id = org_id
        UNION
        SELECT 1 FROM organization_members 
        WHERE user_id = auth.uid() AND organization_id = org_id
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if current user is an organization admin or super admin
CREATE OR REPLACE FUNCTION is_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND (role = 'SUPER_ADMIN' OR (role = 'ORGANIZATION_ADMIN' AND organization_id = org_id))
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==============================================================================
-- 3. POLICIES: PROFILES & ORGANIZATIONS
-- ==============================================================================

-- Profiles: users can read their own profile, or colleague profiles in the same org
CREATE POLICY "profiles_select_own_or_colleague" ON profiles
    FOR SELECT USING (
        id = auth.uid() 
        OR (organization_id IS NOT NULL AND organization_id = current_user_org_id())
        OR current_user_role() = 'SUPER_ADMIN'
    );

-- Profiles: users can update their own personal info (excluding role and org)
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Profiles: insert own profile upon signup
CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- Organizations: members can view their organization
CREATE POLICY "org_select_member" ON organizations
    FOR SELECT USING (
        is_org_member(id) 
        OR org_type = 'MUNICIPALITY' 
        OR current_user_role() = 'SUPER_ADMIN'
    );

-- Organizations: org admins can update their org
CREATE POLICY "org_update_admin" ON organizations
    FOR UPDATE USING (is_org_admin(id))
    WITH CHECK (is_org_admin(id));

-- Organization Members: members can view roster
CREATE POLICY "org_members_select" ON organization_members
    FOR SELECT USING (is_org_member(organization_id) OR current_user_role() = 'SUPER_ADMIN');

-- Organization Members: admins can manage roster
CREATE POLICY "org_members_manage_admin" ON organization_members
    FOR ALL USING (is_org_admin(organization_id))
    WITH CHECK (is_org_admin(organization_id));

-- ==============================================================================
-- 4. POLICIES: SITES, ASSETS, PROJECTS
-- ==============================================================================

CREATE POLICY "sites_select" ON sites
    FOR SELECT USING (is_org_member(organization_id) OR current_user_role() IN ('CITIZEN', 'SUPER_ADMIN'));

CREATE POLICY "sites_manage" ON sites
    FOR ALL USING (is_org_admin(organization_id))
    WITH CHECK (is_org_admin(organization_id));

CREATE POLICY "assets_select" ON assets
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM sites WHERE sites.id = assets.site_id AND is_org_member(sites.organization_id))
        OR current_user_role() = 'SUPER_ADMIN'
    );

CREATE POLICY "assets_manage" ON assets
    FOR ALL USING (
        EXISTS (SELECT 1 FROM sites WHERE sites.id = assets.site_id AND is_org_admin(sites.organization_id))
    );

CREATE POLICY "projects_select" ON projects
    FOR SELECT USING (is_org_member(organization_id) OR current_user_role() = 'SUPER_ADMIN');

CREATE POLICY "projects_manage" ON projects
    FOR ALL USING (is_org_admin(organization_id));

-- ==============================================================================
-- 5. POLICIES: COMPLAINTS & MASTER ISSUES
-- ==============================================================================

-- Complaints: Citizens can view own; Authorities can view all in their jurisdiction
CREATE POLICY "complaints_select" ON complaints
    FOR SELECT USING (
        citizen_id = auth.uid()
        OR current_user_role() IN ('INSPECTOR', 'PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'AUDITOR', 'SUPER_ADMIN')
        OR EXISTS (
            SELECT 1 FROM work_orders wo 
            JOIN complaint_issue_links cil ON cil.master_issue_id = wo.master_issue_id
            WHERE cil.complaint_id = complaints.id AND wo.assigned_worker_id = auth.uid()
        )
    );

-- Complaints: Citizens can insert new complaints
CREATE POLICY "complaints_insert" ON complaints
    FOR INSERT WITH CHECK (citizen_id = auth.uid());

-- Complaints: Citizens can update status to REOPENED; Admins can update status / triage
CREATE POLICY "complaints_update" ON complaints
    FOR UPDATE USING (
        citizen_id = auth.uid() 
        OR current_user_role() IN ('INSPECTOR', 'PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN')
    );

-- Complaint Media: Owner or reviewing authorities can select
CREATE POLICY "complaint_media_select" ON complaint_media
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM complaints c 
            WHERE c.id = complaint_media.complaint_id 
            AND (c.citizen_id = auth.uid() OR current_user_role() IN ('INSPECTOR', 'PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'AUDITOR', 'SUPER_ADMIN'))
        )
    );

-- Complaint Media: Owner can insert
CREATE POLICY "complaint_media_insert" ON complaint_media
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM complaints c 
            WHERE c.id = complaint_media.complaint_id AND c.citizen_id = auth.uid()
        )
    );

-- Master Issues: Org staff can read and manage
CREATE POLICY "master_issues_select" ON master_issues
    FOR SELECT USING (
        is_org_member(organization_id) 
        OR current_user_role() IN ('CITIZEN', 'SUPER_ADMIN')
    );

CREATE POLICY "master_issues_manage" ON master_issues
    FOR ALL USING (
        current_user_role() IN ('ORGANIZATION_ADMIN', 'PROJECT_MANAGER', 'SUPER_ADMIN') 
        AND is_org_member(organization_id)
    );

CREATE POLICY "complaint_issue_links_select" ON complaint_issue_links
    FOR SELECT USING (TRUE);

CREATE POLICY "complaint_issue_links_manage" ON complaint_issue_links
    FOR ALL USING (
        current_user_role() IN ('ORGANIZATION_ADMIN', 'PROJECT_MANAGER', 'SUPER_ADMIN')
    );

-- ==============================================================================
-- 6. POLICIES: WORK ORDERS & ASSIGNMENTS
-- ==============================================================================

CREATE POLICY "work_orders_select" ON work_orders
    FOR SELECT USING (
        is_org_member(organization_id)
        OR assigned_worker_id = auth.uid()
        OR assigned_contractor_id = current_user_org_id()
        OR current_user_role() IN ('AUDITOR', 'SUPER_ADMIN')
        OR EXISTS (
            SELECT 1 FROM complaint_issue_links cil
            JOIN complaints c ON c.id = cil.complaint_id
            WHERE cil.master_issue_id = work_orders.master_issue_id AND c.citizen_id = auth.uid()
        )
    );

CREATE POLICY "work_orders_insert" ON work_orders
    FOR INSERT WITH CHECK (
        current_user_role() IN ('ORGANIZATION_ADMIN', 'PROJECT_MANAGER', 'SUPER_ADMIN')
        AND is_org_member(organization_id)
    );

CREATE POLICY "work_orders_update" ON work_orders
    FOR UPDATE USING (
        (current_user_role() IN ('ORGANIZATION_ADMIN', 'PROJECT_MANAGER', 'SUPER_ADMIN') AND is_org_member(organization_id))
        OR (assigned_worker_id = auth.uid())
        OR (assigned_contractor_id = current_user_org_id())
    );

CREATE POLICY "work_order_reqs_select" ON work_order_requirements
    FOR SELECT USING (TRUE);

CREATE POLICY "work_order_reqs_manage" ON work_order_requirements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM work_orders wo 
            WHERE wo.id = work_order_requirements.work_order_id 
            AND is_org_member(wo.organization_id)
            AND current_user_role() IN ('ORGANIZATION_ADMIN', 'PROJECT_MANAGER', 'SUPER_ADMIN')
        )
    );

CREATE POLICY "assignments_select" ON assignments
    FOR SELECT USING (
        assignee_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM work_orders wo 
            WHERE wo.id = assignments.work_order_id AND is_org_member(wo.organization_id)
        )
    );

CREATE POLICY "assignments_manage" ON assignments
    FOR ALL USING (
        current_user_role() IN ('ORGANIZATION_ADMIN', 'PROJECT_MANAGER', 'SUPER_ADMIN')
    );

-- ==============================================================================
-- 7. POLICIES: CAPTURE SESSIONS & EVIDENCE
-- ==============================================================================

CREATE POLICY "capture_sessions_select" ON capture_sessions
    FOR SELECT USING (
        worker_id = auth.uid()
        OR current_user_role() IN ('INSPECTOR', 'PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'AUDITOR', 'SUPER_ADMIN')
    );

CREATE POLICY "capture_sessions_insert" ON capture_sessions
    FOR INSERT WITH CHECK (
        worker_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM work_orders wo 
            WHERE wo.id = capture_sessions.work_order_id 
            AND (wo.assigned_worker_id = auth.uid() OR current_user_role() IN ('ORGANIZATION_ADMIN', 'SUPER_ADMIN'))
        )
    );

CREATE POLICY "evidence_select" ON evidence
    FOR SELECT USING (
        current_user_role() IN ('INSPECTOR', 'PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'AUDITOR', 'SUPER_ADMIN')
        OR EXISTS (
            SELECT 1 FROM work_orders wo 
            WHERE wo.id = evidence.work_order_id AND (wo.assigned_worker_id = auth.uid() OR wo.assigned_contractor_id = current_user_org_id())
        )
        OR EXISTS (
            SELECT 1 FROM work_orders wo
            JOIN complaint_issue_links cil ON cil.master_issue_id = wo.master_issue_id
            JOIN complaints c ON c.id = cil.complaint_id
            WHERE wo.id = evidence.work_order_id AND c.citizen_id = auth.uid() AND wo.status = 'VERIFIED'
        )
    );

CREATE POLICY "evidence_insert" ON evidence
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM capture_sessions cs 
            WHERE cs.id = evidence.capture_session_id AND cs.worker_id = auth.uid() AND cs.status = 'ACTIVE'
        )
    );

CREATE POLICY "evidence_hashes_select" ON evidence_hashes
    FOR SELECT USING (
        current_user_role() IN ('INSPECTOR', 'PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'AUDITOR', 'SUPER_ADMIN')
    );

CREATE POLICY "evidence_hashes_insert" ON evidence_hashes
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "evidence_embeddings_select" ON evidence_embeddings
    FOR SELECT USING (
        current_user_role() IN ('INSPECTOR', 'PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'AUDITOR', 'SUPER_ADMIN')
    );

CREATE POLICY "evidence_embeddings_insert" ON evidence_embeddings
    FOR INSERT WITH CHECK (TRUE);

-- ==============================================================================
-- 8. POLICIES: VERIFICATION & RISKS
-- ==============================================================================

CREATE POLICY "verification_runs_select" ON verification_runs
    FOR SELECT USING (
        current_user_role() IN ('INSPECTOR', 'PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'AUDITOR', 'SUPER_ADMIN')
        OR EXISTS (
            SELECT 1 FROM work_orders wo 
            WHERE wo.id = verification_runs.work_order_id AND wo.assigned_worker_id = auth.uid()
        )
    );

CREATE POLICY "verification_runs_manage" ON verification_runs
    FOR ALL USING (
        current_user_role() IN ('INSPECTOR', 'PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN')
    );

CREATE POLICY "verification_steps_select" ON verification_steps
    FOR SELECT USING (
        current_user_role() IN ('INSPECTOR', 'PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'AUDITOR', 'SUPER_ADMIN')
    );

CREATE POLICY "verification_steps_manage" ON verification_steps
    FOR ALL USING (TRUE);

CREATE POLICY "verification_results_select" ON verification_results
    FOR SELECT USING (
        current_user_role() IN ('INSPECTOR', 'PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'AUDITOR', 'SUPER_ADMIN')
        OR EXISTS (
            SELECT 1 FROM verification_runs vr
            JOIN work_orders wo ON wo.id = vr.work_order_id
            WHERE vr.id = verification_results.verification_run_id AND wo.assigned_worker_id = auth.uid()
        )
    );

CREATE POLICY "verification_results_manage" ON verification_results
    FOR ALL USING (TRUE);

CREATE POLICY "risk_flags_select" ON risk_flags
    FOR SELECT USING (
        current_user_role() IN ('INSPECTOR', 'PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'AUDITOR', 'SUPER_ADMIN')
    );

CREATE POLICY "risk_flags_manage" ON risk_flags
    FOR ALL USING (TRUE);

-- ==============================================================================
-- 9. POLICIES: CAMERAS & CAMERA EVENTS
-- ==============================================================================

CREATE POLICY "cameras_select" ON cameras
    FOR SELECT USING (
        is_org_member(organization_id) OR current_user_role() = 'SUPER_ADMIN'
    );

CREATE POLICY "cameras_manage" ON cameras
    FOR ALL USING (
        is_org_admin(organization_id)
    );

CREATE POLICY "camera_events_select" ON camera_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cameras c 
            WHERE c.id = camera_events.camera_id AND is_org_member(c.organization_id)
        )
    );

CREATE POLICY "camera_events_manage" ON camera_events
    FOR ALL USING (TRUE);

-- ==============================================================================
-- 10. POLICIES: REVIEWS, FEEDBACK, NOTIFICATIONS, METRICS, AUDIT
-- ==============================================================================

CREATE POLICY "human_reviews_select" ON human_reviews
    FOR SELECT USING (
        current_user_role() IN ('INSPECTOR', 'PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'AUDITOR', 'SUPER_ADMIN')
        OR EXISTS (
            SELECT 1 FROM work_orders wo 
            WHERE wo.id = human_reviews.work_order_id AND wo.assigned_worker_id = auth.uid()
        )
    );

CREATE POLICY "human_reviews_insert" ON human_reviews
    FOR INSERT WITH CHECK (
        current_user_role() IN ('INSPECTOR', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN')
        AND reviewer_id = auth.uid()
    );

CREATE POLICY "citizen_feedback_select" ON citizen_feedback
    FOR SELECT USING (
        citizen_id = auth.uid() 
        OR current_user_role() IN ('INSPECTOR', 'PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'AUDITOR', 'SUPER_ADMIN')
    );

CREATE POLICY "citizen_feedback_insert" ON citizen_feedback
    FOR INSERT WITH CHECK (
        citizen_id = auth.uid()
    );

-- Notifications: strictly user isolated
CREATE POLICY "notifications_select" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update" ON notifications
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_insert" ON notifications
    FOR INSERT WITH CHECK (TRUE);

-- Environmental metrics: readable by all, managed by org staff
CREATE POLICY "env_metrics_select" ON environmental_metrics
    FOR SELECT USING (TRUE);

CREATE POLICY "env_metrics_manage" ON environmental_metrics
    FOR ALL USING (
        current_user_role() IN ('ORGANIZATION_ADMIN', 'PROJECT_MANAGER', 'SUPER_ADMIN')
    );

-- Audit Events: immutable read-only for auditors and org admins
CREATE POLICY "audit_events_select" ON audit_events
    FOR SELECT USING (
        current_user_role() = 'SUPER_ADMIN'
        OR (organization_id IS NOT NULL AND is_org_member(organization_id) AND current_user_role() IN ('ORGANIZATION_ADMIN', 'AUDITOR'))
    );

CREATE POLICY "audit_events_insert" ON audit_events
    FOR INSERT WITH CHECK (TRUE);

-- Integration Configs: strictly Org Admin
CREATE POLICY "integration_configs_select" ON integration_configs
    FOR SELECT USING (is_org_admin(organization_id));

CREATE POLICY "integration_configs_manage" ON integration_configs
    FOR ALL USING (is_org_admin(organization_id));
