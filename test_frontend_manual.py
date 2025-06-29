#!/usr/bin/env python3
"""
Manual Frontend Testing Checklist for BookSwaps Application
Provides comprehensive testing checklist and automated checks where possible
"""

import requests
import json
import time
from datetime import datetime

# Configuration
FRONTEND_URL = "http://localhost:5173"
BACKEND_URL = "http://localhost:8000/api"
TEST_USERNAME = "andrew"
TEST_PASSWORD = "*Andrew2003"

class BookSwapsFrontendChecker:
    def __init__(self):
        self.test_results = []
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat()
        })
        print(f"{status} {test_name}: {details}")
        
    def test_frontend_accessibility(self):
        """Test if frontend is accessible"""
        print("\n🌐 TESTING FRONTEND ACCESSIBILITY")
        
        try:
            response = requests.get(FRONTEND_URL, timeout=10)
            if response.status_code == 200:
                self.log_test("Frontend Accessibility", True, f"Frontend is accessible at {FRONTEND_URL}")
                
                # Check if it's a React app
                content = response.text.lower()
                if 'react' in content or 'vite' in content or 'div id="root"' in content:
                    self.log_test("React App Detection", True, "Detected React/Vite application")
                else:
                    self.log_test("React App Detection", False, "Could not detect React application")
                    
                return True
            else:
                self.log_test("Frontend Accessibility", False, f"Status: {response.status_code}")
                return False
                
        except requests.exceptions.ConnectionError:
            self.log_test("Frontend Accessibility", False, "Connection refused - frontend not running")
            return False
        except Exception as e:
            self.log_test("Frontend Accessibility", False, f"Exception: {str(e)}")
            return False
            
    def test_backend_connectivity(self):
        """Test if backend APIs are accessible from frontend perspective"""
        print("\n🔗 TESTING BACKEND CONNECTIVITY")
        
        # Test CORS and basic connectivity
        try:
            # Test a simple endpoint
            response = requests.get(f"{BACKEND_URL}/users/login/", timeout=10)
            if response.status_code in [200, 405, 404]:  # Any response means server is up
                self.log_test("Backend Connectivity", True, f"Backend is accessible at {BACKEND_URL}")
            else:
                self.log_test("Backend Connectivity", False, f"Unexpected status: {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            self.log_test("Backend Connectivity", False, "Backend connection refused")
        except Exception as e:
            self.log_test("Backend Connectivity", False, f"Exception: {str(e)}")
            
    def test_authentication_flow(self):
        """Test authentication flow"""
        print("\n🔐 TESTING AUTHENTICATION FLOW")
        
        try:
            # Test login endpoint
            response = requests.post(f"{BACKEND_URL}/users/login/", {
                "username": TEST_USERNAME,
                "password": TEST_PASSWORD
            })
            
            if response.status_code == 200:
                data = response.json()
                if data.get('access_token') or data.get('token'):
                    self.log_test("Authentication Flow", True, "Login successful with valid tokens")
                else:
                    self.log_test("Authentication Flow", False, "Login response missing tokens")
            else:
                self.log_test("Authentication Flow", False, f"Login failed: {response.status_code}")
                
        except Exception as e:
            self.log_test("Authentication Flow", False, f"Exception: {str(e)}")
            
    def print_manual_checklist(self):
        """Print comprehensive manual testing checklist"""
        print("\n" + "="*80)
        print("📋 MANUAL FRONTEND TESTING CHECKLIST")
        print("="*80)
        print(f"🌐 Open: {FRONTEND_URL}")
        print(f"👤 Test Account: {TEST_USERNAME} / {TEST_PASSWORD}")
        print("\n" + "="*80)
        
        checklist = [
            ("🔐 AUTHENTICATION", [
                "[ ] Login page loads correctly",
                "[ ] Can enter username and password",
                "[ ] Login button works",
                "[ ] Successful login redirects to main app",
                "[ ] Invalid credentials show error message",
                "[ ] Logout functionality works"
            ]),
            
            ("🧭 NAVIGATION", [
                "[ ] Top navigation bar is visible and responsive",
                "[ ] All navigation links work (Profile, Library, Socials, Notifications)",
                "[ ] Bottom navigation works on mobile",
                "[ ] Back/forward browser buttons work",
                "[ ] URL changes correctly when navigating"
            ]),
            
            ("👤 PROFILE SECTION", [
                "[ ] Profile page loads with user information",
                "[ ] Profile completion banner shows (if < 100%)",
                "[ ] Profile completion banner disappears at 100%",
                "[ ] Profile completion shows detailed missing fields",
                "[ ] 'Why X%?' explanation is clear and accurate",
                "[ ] Settings page loads and forms work",
                "[ ] Profile updates save successfully",
                "[ ] Shareable profile modal works"
            ]),
            
            ("📚 LIBRARY SECTION", [
                "[ ] My Library shows user's books",
                "[ ] Browse section works",
                "[ ] Book search functionality works",
                "[ ] Add book feature works (manual and API)",
                "[ ] Book details page loads correctly",
                "[ ] Bookmarks and favorites work",
                "[ ] Book availability updates work"
            ]),
            
            ("💬 SOCIALS SECTION", [
                "[ ] Discussions page loads",
                "[ ] Can view discussion posts",
                "[ ] Can create new discussion posts",
                "[ ] Upvote/downvote buttons work (mutual exclusion)",
                "[ ] Chat functionality works",
                "[ ] Society features work",
                "[ ] Message sending/receiving works"
            ]),
            
            ("🔔 NOTIFICATIONS", [
                "[ ] Notifications page loads",
                "[ ] Shows swap notifications",
                "[ ] Mark as read functionality works",
                "[ ] Notification count updates correctly",
                "[ ] Real-time notifications work"
            ]),
            
            ("📱 RESPONSIVE DESIGN", [
                "[ ] Works on desktop (1920x1080)",
                "[ ] Works on tablet (768x1024)",
                "[ ] Works on mobile (375x667)",
                "[ ] Navigation adapts to screen size",
                "[ ] All buttons and forms are accessible",
                "[ ] Text is readable on all screen sizes"
            ]),
            
            ("⚡ PERFORMANCE", [
                "[ ] Pages load quickly (< 3 seconds)",
                "[ ] No console errors in browser dev tools",
                "[ ] API calls complete successfully",
                "[ ] Images load properly",
                "[ ] Animations are smooth",
                "[ ] No memory leaks during navigation"
            ]),
            
            ("🎨 USER EXPERIENCE", [
                "[ ] Design is consistent across pages",
                "[ ] Colors and fonts match design system",
                "[ ] Loading states are shown appropriately",
                "[ ] Error messages are user-friendly",
                "[ ] Success feedback is provided",
                "[ ] Forms have proper validation"
            ]),
            
            ("🔧 FUNCTIONALITY", [
                "[ ] All CRUD operations work (Create, Read, Update, Delete)",
                "[ ] Real-time features work (chat, notifications)",
                "[ ] File uploads work (profile pictures, book covers)",
                "[ ] Search functionality works across all sections",
                "[ ] Filtering and sorting work",
                "[ ] Pagination works where applicable"
            ])
        ]
        
        for section, items in checklist:
            print(f"\n{section}")
            print("-" * len(section))
            for item in items:
                print(f"  {item}")
                
        print("\n" + "="*80)
        print("🎯 TESTING INSTRUCTIONS")
        print("="*80)
        print("1. Open the frontend URL in your browser")
        print("2. Go through each section systematically")
        print("3. Check off each item as you test it")
        print("4. Note any issues or bugs found")
        print("5. Test on different screen sizes")
        print("6. Check browser console for errors")
        print("7. Verify all API calls are working")
        print("\n🎉 Happy Testing!")
        
    def run_automated_checks(self):
        """Run automated checks that can be done without browser"""
        print("🚀 RUNNING AUTOMATED FRONTEND CHECKS")
        print("=" * 60)
        
        self.test_frontend_accessibility()
        self.test_backend_connectivity()
        self.test_authentication_flow()
        
        # Print summary
        self.print_summary()
        
        # Print manual checklist
        self.print_manual_checklist()
        
    def print_summary(self):
        """Print automated test summary"""
        print("\n" + "=" * 60)
        print("📊 AUTOMATED TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Automated Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")

if __name__ == "__main__":
    checker = BookSwapsFrontendChecker()
    checker.run_automated_checks()
