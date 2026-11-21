import sys
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5180"

def run_tests():
    print(f"\n=======================================================")
    print(f"🚀 Running Automated Playwright Test Suite for RepoPilot")
    print(f"Target: {BASE_URL}")
    print(f"=======================================================\n")

    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        # Test 1: Landing Page
        print("▶ Test 1: Verifying Landing Page...")
        try:
            page.goto(BASE_URL, wait_until="networkidle")
            assert "RepoPilot" in page.title() or page.locator("text=AI-Powered GitHub Intelligence").is_visible()
            assert page.locator("text=Core Capabilities").is_visible()
            assert page.locator("text=Simple Transparent Pricing").is_visible()
            print("  ✓ Landing Page loaded with Hero, Features, and Pricing.")
            results.append(("Landing Page Verification", "PASSED"))
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            results.append(("Landing Page Verification", f"FAILED: {e}"))

        # Test 2: Login Page Form Security
        print("\n▶ Test 2: Verifying Login Security & Blank Credentials...")
        try:
            page.goto(f"{BASE_URL}/login", wait_until="networkidle")
            email_val = page.locator('input[type="email"]').input_value()
            pwd_val = page.locator('input[type="password"]').input_value()
            assert email_val == "", f"Security Alert: Email was pre-filled with '{email_val}'"
            assert pwd_val == "", "Security Alert: Password was pre-filled!"
            print("  ✓ Inputs are clean and blank (zero credentials exposed).")
            results.append(("Login Credential Security", "PASSED"))
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            results.append(("Login Credential Security", f"FAILED: {e}"))

        # Test 3: Sign Up a New Isolated User
        print("\n▶ Test 3: Testing New User Registration & Tenant Session...")
        test_email = f"user_{int(time.time())}@company.com"
        try:
            page.goto(f"{BASE_URL}/signup", wait_until="networkidle")
            page.locator('input[type="text"]').fill("Alex Rivera")
            page.locator('input[type="email"]').fill(test_email)
            page.locator('input[type="password"]').fill("SuperSecret123!")
            page.locator('button[type="submit"]').click()

            page.wait_for_url("**/dashboard", timeout=5000)
            assert page.locator("text=Welcome back").is_visible()
            print(f"  ✓ User {test_email} registered successfully and redirected to Dashboard.")
            results.append(("User Registration & Session", "PASSED"))
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            results.append(("User Registration & Session", f"FAILED: {e}"))

        # Test 4: Dashboard & Workspaces Navigation
        print("\n▶ Test 4: Verifying Dashboard Workspaces...")
        try:
            assert page.locator("text=RAG Code Chat").is_visible()
            assert page.locator("text=Code Review Scan").is_visible()
            assert page.locator("text=Auto Docs Generator").is_visible()
            assert page.locator("text=Test Suite Creator").is_visible()
            print("  ✓ All 4 Intelligence Workspaces verified on Dashboard.")
            results.append(("Dashboard Workspaces", "PASSED"))
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            results.append(("Dashboard Workspaces", f"FAILED: {e}"))

        # Test 5: AI Code Chat & Citations
        print("\n▶ Test 5: Testing Grounded AI Code Chat & Source Citations...")
        try:
            page.goto(f"{BASE_URL}/repo/repo_001/chat", wait_until="networkidle")
            assert page.locator("text=Explain Authentication Flow & JWT Handling").first.is_visible()
            # Send question
            textarea = page.locator('textarea')
            textarea.fill("Where is user authentication implemented?")
            page.locator('button[type="submit"]').click()

            # Wait for assistant message and citations
            page.wait_for_selector("text=Verified Source Citations", timeout=8000)
            assert page.locator("text=src/auth/jwt.ts").first.is_visible()
            print("  ✓ AI Chat responded with verified AST citations (src/auth/jwt.ts).")
            results.append(("AI Code Chat & Citations", "PASSED"))
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            results.append(("AI Code Chat & Citations", f"FAILED: {e}"))

        # Test 6: Code Review & Auto-Patcher & Push
        print("\n▶ Test 6: Testing Code Review, Auto-Patcher, and GitHub Push...")
        try:
            page.goto(f"{BASE_URL}/repo/repo_001/review", wait_until="networkidle")
            assert page.locator("text=Intelligent Code Review & Auto-Patcher").is_visible()
            
            # Click Apply Fix & Replace Code
            apply_btn = page.locator("button:has-text('Apply Fix & Replace Code')").first
            apply_btn.click()

            # Verify Patched state
            page.wait_for_selector("text=CODE REPLACED & PATCHED", timeout=6000)
            print("  ✓ Code snippet successfully patched and replaced!")

            # Click Commit & Push to GitHub
            push_btn = page.locator("button:has-text('Commit & Push to GitHub')").first
            push_btn.click()

            page.wait_for_selector("text=Render Auto-Deploy Active", timeout=6000)
            print("  ✓ Patch committed to GitHub branch with Render Auto-Deploy triggered.")
            results.append(("Code Review & Auto-Patcher", "PASSED"))
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            results.append(("Code Review & Auto-Patcher", f"FAILED: {e}"))

        # Test 7: Automated Documentation Generator
        print("\n▶ Test 7: Testing Documentation Generator...")
        try:
            page.goto(f"{BASE_URL}/repo/repo_001/docs", wait_until="networkidle")
            assert page.locator("text=Automated Documentation Generator").is_visible()
            
            # Toggle to Architecture tab
            page.locator("button:has-text('System Architecture')").click()
            time.sleep(1)
            assert page.locator("text=System Architecture Diagram").is_visible()
            print("  ✓ Documentation generator successfully synthesized Architecture diagram.")
            results.append(("Doc Generator", "PASSED"))
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            results.append(("Doc Generator", f"FAILED: {e}"))

        # Test 8: Custom Profile Picture (PFP) Upload & Preset Selection
        print("\n▶ Test 8: Testing Custom Profile Picture (PFP) Updates...")
        try:
            page.goto(f"{BASE_URL}/settings", wait_until="networkidle")
            assert page.locator("text=Profile & Custom Profile Picture (PFP)").is_visible()

            # Click Architect preset avatar
            architect_btn = page.locator("text=Architect")
            architect_btn.click()

            # Wait for success badge
            page.wait_for_selector("text=Profile picture updated!", timeout=3000)
            print("  ✓ Custom Profile Picture updated successfully in user settings and navbar.")
            results.append(("PFP Customization", "PASSED"))
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            results.append(("PFP Customization", f"FAILED: {e}"))

        browser.close()

    print(f"\n=======================================================")
    print(f"📊 Playwright Automated Test Results Summary")
    print(f"=======================================================")
    all_passed = True
    for test_name, status in results:
        icon = "✅" if status == "PASSED" else "❌"
        if status != "PASSED":
            all_passed = False
        print(f"{icon} {test_name}: {status}")

    print(f"\nOVERALL RESULT: {'ALL TESTS PASSED 🎉' if all_passed else 'SOME TESTS FAILED ⚠️'}")
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(run_tests())
