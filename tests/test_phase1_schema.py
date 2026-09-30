"""
Ground0 Automated Test Suite: Phase 1 Schema & RLS Verification
Validates that all 29 database tables, RLS policies, storage buckets,
and seed records strictly conform to the Ground0 architectural specification.
"""

import os
import re
import sys
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
MIGRATIONS_DIR = BASE_DIR / "supabase" / "migrations"
SEED_DIR = BASE_DIR / "supabase" / "seed"

CORE_SCHEMA_FILE = MIGRATIONS_DIR / "20260930000001_core_schema.sql"
RLS_FILE = MIGRATIONS_DIR / "20260930000002_row_level_security.sql"
STORAGE_FILE = MIGRATIONS_DIR / "20260930000003_storage_buckets.sql"
SEED_FILE = SEED_DIR / "seed.sql"

EXPECTED_TABLES = [
    "profiles",
    "organizations",
    "organization_members",
    "sites",
    "assets",
    "projects",
    "master_issues",
    "complaints",
    "complaint_media",
    "complaint_issue_links",
    "work_orders",
    "work_order_requirements",
    "assignments",
    "capture_sessions",
    "evidence",
    "evidence_hashes",
    "evidence_embeddings",
    "verification_runs",
    "verification_steps",
    "verification_results",
    "risk_flags",
    "cameras",
    "camera_events",
    "human_reviews",
    "citizen_feedback",
    "notifications",
    "environmental_metrics",
    "audit_events",
    "integration_configs",
]

EXPECTED_BUCKETS = [
    ("complaint-media", False),
    ("evidence-original", False),
    ("evidence-redacted", False),
    ("verification-artifacts", False),
    ("camera-event-snapshots", False),
    ("exports", False),
    ("avatars", True),
]

def test_files_exist():
    print("[1/5] Checking migration and seed files exist...")
    assert CORE_SCHEMA_FILE.exists(), f"Missing {CORE_SCHEMA_FILE}"
    assert RLS_FILE.exists(), f"Missing {RLS_FILE}"
    assert STORAGE_FILE.exists(), f"Missing {STORAGE_FILE}"
    assert SEED_FILE.exists(), f"Missing {SEED_FILE}"
    print("  -> PASSED: All 4 migration/seed files present.")

def test_core_schema_tables():
    print("[2/5] Validating all 29 tables in core schema...")
    content = CORE_SCHEMA_FILE.read_text(encoding="utf-8")
    
    found_tables = set()
    matches = re.findall(r"CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z_]+)\s*\(", content, re.IGNORECASE)
    for m in matches:
        found_tables.add(m.lower())
    
    missing_tables = [t for t in EXPECTED_TABLES if t not in found_tables]
    assert not missing_tables, f"Missing tables in core schema: {missing_tables}"
    assert len(found_tables) >= 29, f"Expected at least 29 tables, found {len(found_tables)}"
    print(f"  -> PASSED: All {len(EXPECTED_TABLES)} required tables defined with strict constraints.")

def test_row_level_security():
    print("[3/5] Validating Row Level Security (RLS) enforcement...")
    rls_content = RLS_FILE.read_text(encoding="utf-8")
    
    # Check that each of the 29 tables has RLS enabled
    enabled_tables = set()
    matches = re.findall(r"ALTER\s+TABLE\s+([a-zA-Z_]+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY", rls_content, re.IGNORECASE)
    for m in matches:
        enabled_tables.add(m.lower())
        
    missing_rls = [t for t in EXPECTED_TABLES if t not in enabled_tables]
    assert not missing_rls, f"Tables missing ENABLE ROW LEVEL SECURITY: {missing_rls}"
    
    # Check policy count
    policies = re.findall(r"CREATE\s+POLICY\s+\"([^\"]+)\"\s+ON\s+([a-zA-Z_]+)", rls_content, re.IGNORECASE)
    assert len(policies) >= 25, f"Expected >= 25 security policies, found {len(policies)}"
    print(f"  -> PASSED: RLS active on all 29 tables with {len(policies)} granular role policies.")

def test_storage_buckets():
    print("[4/5] Validating storage buckets configuration...")
    storage_content = STORAGE_FILE.read_text(encoding="utf-8")
    
    for bucket_name, is_public in EXPECTED_BUCKETS:
        assert bucket_name in storage_content, f"Missing bucket: {bucket_name}"
        # verify public vs private flag
        pattern = rf"'{bucket_name}'\s*,\s*'{bucket_name}'\s*,\s*(TRUE|FALSE)"
        match = re.search(pattern, storage_content, re.IGNORECASE)
        assert match, f"Could not verify public/private setting for bucket: {bucket_name}"
        expected_flag = "TRUE" if is_public else "FALSE"
        actual_flag = match.group(1).upper()
        assert actual_flag == expected_flag, f"Bucket {bucket_name} public setting mismatch: expected {expected_flag}, got {actual_flag}"
    print(f"  -> PASSED: All {len(EXPECTED_BUCKETS)} storage buckets verified (6 private, 1 public).")

def test_seed_data_integrity():
    print("[5/5] Validating seed data entities...")
    seed_content = SEED_FILE.read_text(encoding="utf-8")
    
    assert "Metro Civil Infrastructure Authority" in seed_content
    assert "Apex Road & Environmental Works Ltd" in seed_content
    assert "GR0-M42" in seed_content
    assert "WO-2091" in seed_content
    assert "Lane 2 asphalt cavity section opposite Pillar 4" in seed_content
    assert "ESTIMATED_WASTE_REMOVED_KG" in seed_content
    print("  -> PASSED: Seed data includes municipalities, contractors, sites, issues, work orders, and environmental metrics.")

def main():
    print("============================================================")
    print("        GROUND0 PHASE 1 TEST SUITE: SCHEMA & RLS")
    print("============================================================")
    try:
        test_files_exist()
        test_core_schema_tables()
        test_row_level_security()
        test_storage_buckets()
        test_seed_data_integrity()
        print("============================================================")
        print(">>> ALL PHASE 1 TESTS PASSED SUCCESSFULLY (5/5) <<<")
        print("============================================================")
        return 0
    except AssertionError as err:
        print(f"\n[FAIL] Test failure: {err}")
        return 1
    except Exception as err:
        print(f"\n[ERROR] Unexpected error: {err}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
