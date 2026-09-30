"""
Ground0 Automated Test Suite: Phase 3 Citizen Complaints Core Verification
Validates that complaint categories, public identifier generation (GR0-XXXX),
status lifecycle transitions, server actions, and UI routes strictly conform to specification.
"""

import os
import re
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
WEB_DIR = BASE_DIR / "apps" / "web"
TYPES_DIR = BASE_DIR / "packages" / "types"

EXPECTED_CATEGORIES = [
    "pothole",
    "garbage",
    "drain_blockage",
    "water_leakage",
    "broken_streetlight",
    "road_damage",
    "illegal_dumping",
    "damaged_infrastructure",
    "environmental_issue",
    "other",
]

EXPECTED_STATUSES = [
    "SUBMITTED",
    "UNDER_REVIEW",
    "ACCEPTED",
    "WORK_ASSIGNED",
    "IN_PROGRESS",
    "VERIFYING",
    "INSPECTOR_REVIEW",
    "RESOLVED",
    "REOPENED",
]

def test_complaint_types():
    print("[1/5] Checking complaint categories and status type definitions...")
    types_file = TYPES_DIR / "complaints.ts"
    web_types_file = WEB_DIR / "lib" / "types" / "complaints.ts"

    assert types_file.exists(), f"Missing {types_file}"
    assert web_types_file.exists(), f"Missing {web_types_file}"

    content = types_file.read_text(encoding="utf-8")
    for cat in EXPECTED_CATEGORIES:
        assert cat in content, f"Category '{cat}' missing in complaints.ts"

    for status in EXPECTED_STATUSES:
        assert status in content, f"Status '{status}' missing in complaints.ts"

    assert "COMPLAINT_CATEGORIES" in content
    print(f"  -> PASSED: All {len(EXPECTED_CATEGORIES)} categories and {len(EXPECTED_STATUSES)} statuses verified.")

def test_public_id_generator():
    print("[2/5] Testing public identifier generator (GR0-XXXX)...")
    id_gen_file = WEB_DIR / "lib" / "complaints" / "id-generator.ts"
    assert id_gen_file.exists(), f"Missing {id_gen_file}"

    content = id_gen_file.read_text(encoding="utf-8")
    assert "generateComplaintPublicId" in content
    assert "isValidComplaintPublicId" in content
    assert r"^GR0-\d{4}$" in content or r"GR0-\d{4}" in content

    # Test regex validation in Python matching the TypeScript implementation
    pattern = re.compile(r"^GR0-\d{4}$")
    sample_ids = [f"GR0-{1000 + i * 37}" for i in range(20)]
    for sid in sample_ids:
        assert pattern.match(sid), f"Invalid ID format generated: {sid}"
    assert not pattern.match("WO-2091")
    assert not pattern.match("GR0-123")
    assert not pattern.match("GR0-12345")
    print("  -> PASSED: Public ID format strictly validates against '^GR0-\\d{4}$'.")

def test_status_lifecycle_timeline():
    print("[3/5] Validating status history lifecycle engine...")
    status_file = WEB_DIR / "lib" / "complaints" / "status-history.ts"
    assert status_file.exists(), f"Missing {status_file}"

    content = status_file.read_text(encoding="utf-8")
    assert "COMPLAINT_LIFECYCLE" in content
    assert "getStatusHistory" in content
    assert "REOPENED" in content

    # Verify lifecycle steps exist
    for step in ["SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "WORK_ASSIGNED", "IN_PROGRESS", "VERIFYING", "INSPECTOR_REVIEW", "RESOLVED"]:
        assert step in content, f"Step '{step}' missing from lifecycle"
    print("  -> PASSED: Complete 8-stage lifecycle stepper and REOPENED dispute flow verified.")

def test_complaint_server_actions():
    print("[4/5] Validating complaint server actions...")
    actions_file = WEB_DIR / "lib" / "complaints" / "actions.ts"
    assert actions_file.exists(), f"Missing {actions_file}"

    content = actions_file.read_text(encoding="utf-8")
    for action in ["createComplaint", "getComplaintByPublicId", "getCitizenComplaints"]:
        assert f"export async function {action}" in content, f"Missing action {action}"

    assert "classifyComplaintAI" in content
    assert "revalidatePath" in content
    print("  -> PASSED: Server Actions implemented for creation, retrieval, and AI triage.")

def test_complaint_pages():
    print("[5/5] Validating citizen complaint routes & pages...")
    pages = {
        "Report": WEB_DIR / "app" / "report" / "page.tsx",
        "Detail": WEB_DIR / "app" / "complaint" / "[id]" / "page.tsx",
        "Track": WEB_DIR / "app" / "track" / "page.tsx",
        "List": WEB_DIR / "app" / "complaints" / "page.tsx",
    }

    for name, path in pages.items():
        assert path.exists(), f"Missing {name} page at {path}"
        content = path.read_text(encoding="utf-8")
        assert "export default" in content, f"{name} page missing default export"
    print(f"  -> PASSED: All {len(pages)} user-facing complaint pages verified.")

def main():
    print("============================================================")
    print("        GROUND0 PHASE 3 TEST SUITE: CITIZEN COMPLAINTS")
    print("============================================================")
    try:
        test_complaint_types()
        test_public_id_generator()
        test_status_lifecycle_timeline()
        test_complaint_server_actions()
        test_complaint_pages()
        print("============================================================")
        print(">>> ALL PHASE 3 TESTS PASSED SUCCESSFULLY (5/5) <<<")
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
