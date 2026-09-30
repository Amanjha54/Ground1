"""
Ground0 Automated Test Suite: Phase 2 Authentication & Authorization Verification
Validates that Supabase Auth integration, session management, RBAC route protection,
and Royal Obsidian authentication interfaces conform strictly to the Ground0 specification.
"""

import os
import re
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
WEB_DIR = BASE_DIR / "apps" / "web"
TYPES_DIR = BASE_DIR / "packages" / "types"

EXPECTED_ROLES = [
    "CITIZEN",
    "FIELD_WORKER",
    "CONTRACTOR",
    "INSPECTOR",
    "PROJECT_MANAGER",
    "ORGANIZATION_ADMIN",
    "AUDITOR",
    "SUPER_ADMIN",
]

EXPECTED_ROUTES = [
    "/dashboard",
    "/work-orders",
    "/capture",
    "/verification-lab",
    "/cameras",
    "/audit",
    "/admin",
    "/profile",
]

def test_auth_types():
    print("[1/5] Checking Role-Based Access Control (RBAC) type definitions...")
    types_file = TYPES_DIR / "auth.ts"
    web_types_file = WEB_DIR / "lib" / "types" / "auth.ts"
    
    assert types_file.exists(), f"Missing {types_file}"
    assert web_types_file.exists(), f"Missing {web_types_file}"
    
    content = types_file.read_text(encoding="utf-8")
    for role in EXPECTED_ROLES:
        assert role in content, f"Role '{role}' missing in auth.ts"
        
    for route in EXPECTED_ROUTES:
        assert route in content, f"Route permission for '{route}' missing in ROUTE_PERMISSIONS"
        
    print(f"  -> PASSED: All {len(EXPECTED_ROLES)} roles and {len(EXPECTED_ROUTES)} protected routes verified.")

def test_supabase_client_and_server():
    print("[2/5] Validating Supabase client, server, and middleware configurations...")
    client_file = WEB_DIR / "lib" / "supabase" / "client.ts"
    server_file = WEB_DIR / "lib" / "supabase" / "server.ts"
    mid_helper_file = WEB_DIR / "lib" / "supabase" / "middleware.ts"
    root_middleware = WEB_DIR / "middleware.ts"

    assert client_file.exists(), f"Missing {client_file}"
    assert server_file.exists(), f"Missing {server_file}"
    assert mid_helper_file.exists(), f"Missing {mid_helper_file}"
    assert root_middleware.exists(), f"Missing {root_middleware}"

    client_content = client_file.read_text(encoding="utf-8")
    assert "createBrowserClient" in client_content
    assert "rcadcgzwxmpqlhkjjujy.supabase.co" in client_content
    assert "sb_publishable_9OlTVmNUyRsyDe67RyeUzw_powhyXu-" in client_content

    server_content = server_file.read_text(encoding="utf-8")
    assert "createServerClient" in server_content
    assert "cookieStore" in server_content

    mid_content = mid_helper_file.read_text(encoding="utf-8")
    assert "ROUTE_PERMISSIONS" in mid_content
    assert "unauthorized" in mid_content
    print("  -> PASSED: Browser client, SSR server client, and session middleware confirmed.")

def test_auth_actions():
    print("[3/5] Validating Server Actions for authentication...")
    actions_file = WEB_DIR / "lib" / "auth" / "actions.ts"
    assert actions_file.exists(), f"Missing {actions_file}"

    content = actions_file.read_text(encoding="utf-8")
    required_actions = [
        "signInWithEmail",
        "signUpWithEmail",
        "signOut",
        "resetPassword",
        "getCurrentUser",
        "getCurrentProfile",
    ]
    for action in required_actions:
        assert f"export async function {action}" in content, f"Missing action {action}"
    print(f"  -> PASSED: All {len(required_actions)} Server Actions implemented.")

def test_auth_pages():
    print("[4/5] Validating Auth pages & routes...")
    pages = {
        "Login": WEB_DIR / "app" / "login" / "page.tsx",
        "SignUp": WEB_DIR / "app" / "signup" / "page.tsx",
        "ForgotPassword": WEB_DIR / "app" / "forgot-password" / "page.tsx",
        "Profile": WEB_DIR / "app" / "profile" / "page.tsx",
        "Error": WEB_DIR / "app" / "error" / "page.tsx",
        "Home": WEB_DIR / "app" / "page.tsx",
    }

    for name, path in pages.items():
        assert path.exists(), f"Missing {name} page at {path}"
        content = path.read_text(encoding="utf-8")
        assert "export default" in content, f"{name} page missing default export"
    print(f"  -> PASSED: All {len(pages)} user-facing Auth pages verified.")

def test_environment_configuration():
    print("[5/5] Validating client environment settings...")
    env_file = WEB_DIR / ".env.local"
    assert env_file.exists(), f"Missing {env_file}"

    content = env_file.read_text(encoding="utf-8")
    assert "https://rcadcgzwxmpqlhkjjujy.supabase.co" in content
    assert "sb_publishable_9OlTVmNUyRsyDe67RyeUzw_powhyXu-" in content
    print("  -> PASSED: .env.local configured with authorized Supabase project URL and key.")

def main():
    print("============================================================")
    print("        GROUND0 PHASE 2 TEST SUITE: AUTHENTICATION")
    print("============================================================")
    try:
        test_auth_types()
        test_supabase_client_and_server()
        test_auth_actions()
        test_auth_pages()
        test_environment_configuration()
        print("============================================================")
        print(">>> ALL PHASE 2 TESTS PASSED SUCCESSFULLY (5/5) <<<")
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
