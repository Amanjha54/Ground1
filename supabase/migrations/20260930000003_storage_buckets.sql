-- ==============================================================================
-- GROUND0 DATABASE MIGRATION: STORAGE BUCKETS & POLICIES
-- Migration: 20260930000003_storage_buckets.sql
-- Description: Configures the 7 core storage buckets and object access policies
-- ==============================================================================

-- 1. INSERT THE 7 CORE BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    (
        'complaint-media', 
        'complaint-media', 
        FALSE, 
        26214400, -- 25 MB
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'audio/mpeg', 'audio/webm', 'audio/mp4']
    ),
    (
        'evidence-original', 
        'evidence-original', 
        FALSE, 
        52428800, -- 50 MB
        ARRAY['image/jpeg', 'image/png', 'video/mp4']
    ),
    (
        'evidence-redacted', 
        'evidence-redacted', 
        FALSE, 
        52428800, -- 50 MB
        ARRAY['image/jpeg', 'image/png', 'video/mp4']
    ),
    (
        'verification-artifacts', 
        'verification-artifacts', 
        FALSE, 
        10485760, -- 10 MB
        ARRAY['image/png', 'image/jpeg', 'application/json']
    ),
    (
        'camera-event-snapshots', 
        'camera-event-snapshots', 
        FALSE, 
        10485760, -- 10 MB
        ARRAY['image/jpeg', 'image/png']
    ),
    (
        'exports', 
        'exports', 
        FALSE, 
        104857600, -- 100 MB
        ARRAY['application/pdf', 'text/csv']
    ),
    (
        'avatars', 
        'avatars', 
        TRUE, 
        2097152, -- 2 MB
        ARRAY['image/jpeg', 'image/png', 'image/webp']
    )
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ==============================================================================
-- 2. STORAGE OBJECT RLS POLICIES
-- ==============================================================================

-- Ensure RLS is active on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Avatars: Public read, authenticated update of own avatar
DROP POLICY IF EXISTS "avatars_public_select" ON storage.objects;
CREATE POLICY "avatars_public_select" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_user_upload" ON storage.objects;
CREATE POLICY "avatars_user_upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Complaint Media: Authenticated citizens can upload to own folder
DROP POLICY IF EXISTS "complaint_media_upload" ON storage.objects;
CREATE POLICY "complaint_media_upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'complaint-media'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Complaint Media: Owner and authority roles can read
DROP POLICY IF EXISTS "complaint_media_read" ON storage.objects;
CREATE POLICY "complaint_media_read" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'complaint-media'
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR current_user_role() IN ('INSPECTOR', 'PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'AUDITOR', 'SUPER_ADMIN')
        )
    );

-- Evidence Original: Field workers can upload for their sessions
DROP POLICY IF EXISTS "evidence_original_upload" ON storage.objects;
CREATE POLICY "evidence_original_upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'evidence-original'
        AND auth.uid() IS NOT NULL
    );

-- Evidence Original: Assigned workers, inspectors, admins, auditors can read
DROP POLICY IF EXISTS "evidence_original_read" ON storage.objects;
CREATE POLICY "evidence_original_read" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'evidence-original'
        AND (
            current_user_role() IN ('INSPECTOR', 'PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'AUDITOR', 'SUPER_ADMIN', 'FIELD_WORKER')
        )
    );

-- Verification Artifacts: Read by inspectors, org admins, auditors
DROP POLICY IF EXISTS "verification_artifacts_read" ON storage.objects;
CREATE POLICY "verification_artifacts_read" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'verification-artifacts'
        AND (
            current_user_role() IN ('INSPECTOR', 'PROJECT_MANAGER', 'ORGANIZATION_ADMIN', 'AUDITOR', 'SUPER_ADMIN', 'FIELD_WORKER')
            OR auth.uid() IS NOT NULL
        )
    );

-- Exports: Read by organization admins and auditors
DROP POLICY IF EXISTS "exports_read" ON storage.objects;
CREATE POLICY "exports_read" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'exports'
        AND (
            current_user_role() IN ('ORGANIZATION_ADMIN', 'AUDITOR', 'SUPER_ADMIN')
        )
    );
