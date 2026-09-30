-- ==============================================================================
-- GROUND0 DATABASE SEED DATA
-- File: supabase/seed/seed.sql
-- Description: Deterministic seed data for testing municipal and contractor workflows
-- ==============================================================================

-- 1. BASE ORGANIZATIONS
INSERT INTO organizations (id, name, slug, org_type, settings)
VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'Metro Civil Infrastructure Authority',
        'metro-civil',
        'MUNICIPALITY',
        '{"jurisdiction": "Metro Capital Region", "sla_hours_critical": 24, "camera_verification_default": true}'::jsonb
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Apex Road & Environmental Works Ltd',
        'apex-contractors',
        'CONTRACTOR',
        '{"fleet_size": 45, "bonded": true, "license_number": "CON-2026-994"}'::jsonb
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'National Infrastructure Audit Board',
        'niab-auditor',
        'AUDITOR',
        '{"accreditation": "ISO-37001", "independent": true}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- 2. PHYSICAL SITES
INSERT INTO sites (id, organization_id, name, zone_code, latitude, longitude, boundary_geojson)
VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111',
        'North Ward Civil Corridor',
        'NW-01',
        28.6139391,
        77.2090212,
        '{"type": "Polygon", "coordinates": [[[77.208, 28.613], [77.210, 28.613], [77.210, 28.615], [77.208, 28.615], [77.208, 28.613]]]}'::jsonb
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '11111111-1111-1111-1111-111111111111',
        'Sector 4 Highway Overpass',
        'HW-04',
        28.6250100,
        77.2150300,
        '{"type": "Polygon", "coordinates": [[[77.214, 28.624], [77.216, 28.624], [77.216, 28.626], [77.214, 28.626], [77.214, 28.624]]]}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- 3. PHYSICAL ASSETS
INSERT INTO assets (id, site_id, asset_type, identifier, metadata)
VALUES
    (
        'c1111111-1111-1111-1111-111111111111',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'STREETLIGHT',
        'NW-SL-402',
        '{"lamp_wattage": 150, "pole_type": "Galvanized Steel", "last_inspected": "2026-08-15"}'::jsonb
    ),
    (
        'c2222222-2222-2222-2222-222222222222',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'STORM_DRAIN',
        'HW-DR-109',
        '{"depth_m": 2.4, "capacity_litres_sec": 450, "grate_type": "Cast Iron"}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- 4. MASTER ISSUES (Consolidated Cluster)
INSERT INTO master_issues (id, public_id, organization_id, title, category, latitude, longitude, status, priority, complaint_count)
VALUES
    (
        'd1111111-1111-1111-1111-111111111111',
        'GR0-M42',
        '11111111-1111-1111-1111-111111111111',
        'Severe Road Surface Defect & Cavity near Sector 4 Overpass',
        'pothole',
        28.6250100,
        77.2150300,
        'ACCEPTED',
        'HIGH',
        3
    ),
    (
        'd2222222-2222-2222-2222-222222222222',
        'GR0-M43',
        '11111111-1111-1111-1111-111111111111',
        'Illegal Waste Accumulation on North Ward Corridor',
        'garbage',
        28.6139391,
        77.2090212,
        'IN_PROGRESS',
        'MEDIUM',
        5
    )
ON CONFLICT (id) DO NOTHING;

-- 5. WORK ORDERS
INSERT INTO work_orders (
    id, 
    public_id, 
    organization_id, 
    master_issue_id, 
    site_id, 
    title, 
    description, 
    issue_type, 
    priority, 
    latitude, 
    longitude, 
    tolerance_radius_m, 
    assigned_contractor_id, 
    status, 
    deadline, 
    camera_verification_enabled
)
VALUES
    (
        'e1111111-1111-1111-1111-111111111111',
        'WO-2091',
        '11111111-1111-1111-1111-111111111111',
        'd1111111-1111-1111-1111-111111111111',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Repair High-Risk Pothole Defect on Sector 4 Highway Corridor',
        'Milling, hot asphalt compaction, and planar smoothing over 4m² road defect.',
        'pothole',
        'HIGH',
        28.6250100,
        77.2150300,
        50.00,
        '22222222-2222-2222-2222-222222222222',
        'ASSIGNED',
        NOW() + INTERVAL '48 hours',
        TRUE
    ),
    (
        'e2222222-2222-2222-2222-222222222222',
        'WO-2092',
        '11111111-1111-1111-1111-111111111111',
        'd2222222-2222-2222-2222-222222222222',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Clear Illegal Waste Dumping along North Ward Corridor Sidewalk',
        'Complete removal of municipal debris, plastics, and organic waste with sanitization.',
        'garbage',
        'MEDIUM',
        28.6139391,
        77.2090212,
        35.00,
        '22222222-2222-2222-2222-222222222222',
        'IN_PROGRESS',
        NOW() + INTERVAL '24 hours',
        FALSE
    )
ON CONFLICT (id) DO NOTHING;

-- 6. WORK ORDER REQUIREMENTS (Structured Criteria)
INSERT INTO work_order_requirements (
    id, 
    work_order_id, 
    task_type, 
    target_area, 
    expected_state, 
    required_evidence_angles, 
    completion_threshold_pct
)
VALUES
    (
        'f1111111-1111-1111-1111-111111111111',
        'e1111111-1111-1111-1111-111111111111',
        'pothole_repair',
        'Lane 2 asphalt cavity section opposite Pillar 4',
        'Completely compacted hot asphalt level with adjacent roadway, zero edge lip or open voids.',
        '["FRONT", "LEFT", "RIGHT", "OVERVIEW_VIDEO"]'::jsonb,
        90.00
    ),
    (
        'f2222222-2222-2222-2222-222222222222',
        'e2222222-2222-2222-2222-222222222222',
        'garbage_clearance',
        'Sidewalk perimeter from NW-01 entrance to bus shelter',
        'Zero residual solid waste, pavement swept clean, unobstructed pedestrian walkway.',
        '["FRONT", "SIDE_ANGLE", "CLEARED_PAN"]'::jsonb,
        85.00
    )
ON CONFLICT (id) DO NOTHING;

-- 7. ENVIRONMENTAL METRICS BASELINE
INSERT INTO environmental_metrics (
    id,
    work_order_id,
    metric_type,
    value,
    data_source,
    calculation_basis
)
VALUES
    (
        'g1111111-1111-1111-1111-111111111111',
        'e2222222-2222-2222-2222-222222222222',
        'ESTIMATED_WASTE_REMOVED_KG',
        420.50,
        'ESTIMATED',
        'Calculated based on 14m² visual accumulation footprint at 30kg/m² density index'
    ),
    (
        'g2222222-2222-2222-2222-222222222222',
        'e1111111-1111-1111-1111-111111111111',
        'INSPECTION_TRAVEL_CO2_AVOIDED_KG',
        18.40,
        'ESTIMATED',
        'Autonomous AI verification eliminated round-trip 38km diesel inspection truck transit'
    )
ON CONFLICT (id) DO NOTHING;
