#!/usr/bin/env python3
"""
Comprehensive Backend-Frontend Integration Test Script
Tests all API endpoints to ensure they're properly connected and functional
"""
import os
import sys
import django
import requests
import json
from datetime import datetime

# Add the backend directory to Python path
sys.path.insert(0, '/mnt/persist/workspace/backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

# Base URL for API
BASE_URL = "http://localhost:8000/api"

class EndpointTester:
    def __init__(self):
        self.token = None
        self.user_id = None
        self.results = {
            'passed': [],
            'failed': [],
            'skipped': []
        }
    
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
    
    def test_endpoint(self, method, endpoint, data=None, headers=None, expected_status=200, description=""):
        """Test a single endpoint"""
        url = f"{BASE_URL}{endpoint}"
        
        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=headers, params=data)
            elif method.upper() == 'POST':
                response = requests.post(url, headers=headers, json=data)
            elif method.upper() == 'PATCH':
                response = requests.patch(url, headers=headers, json=data)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=headers, json=data)
            else:
                self.results['failed'].append(f"{method} {endpoint} - Unsupported method")
                return False
            
            if response.status_code == expected_status:
                self.results['passed'].append(f"✅ {method} {endpoint} - {description}")
                self.log(f"✅ {method} {endpoint} - {description}")
                return response.json() if response.content else True
            else:
                error_msg = f"❌ {method} {endpoint} - Expected {expected_status}, got {response.status_code}"
                if response.content:
                    try:
                        error_data = response.json()
                        error_msg += f" - {error_data}"
                    except:
                        error_msg += f" - {response.text[:100]}"
                self.results['failed'].append(error_msg)
                self.log(error_msg, "ERROR")
                return False
                
        except requests.exceptions.ConnectionError:
            error_msg = f"❌ {method} {endpoint} - Connection failed (server not running?)"
            self.results['failed'].append(error_msg)
            self.log(error_msg, "ERROR")
            return False
        except Exception as e:
            error_msg = f"❌ {method} {endpoint} - Exception: {str(e)}"
            self.results['failed'].append(error_msg)
            self.log(error_msg, "ERROR")
            return False
    
    def get_auth_headers(self):
        """Get authorization headers"""
        if self.token:
            return {"Authorization": f"Bearer {self.token}"}
        return {}
    
    def test_authentication_endpoints(self):
        """Test all authentication endpoints"""
        self.log("🔐 Testing Authentication Endpoints")
        
        # Test registration
        register_data = {
            "username": f"testuser_{datetime.now().strftime('%H%M%S')}",
            "email": f"test_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "testpassword123",
            "first_name": "Test",
            "last_name": "User"
        }
        
        result = self.test_endpoint('POST', '/users/register/', register_data, 
                                  expected_status=201, description="User registration")
        
        if result:
            self.token = result.get('token')
            self.user_id = result.get('user_id')
            self.log(f"✅ Registered user: {register_data['username']}")
        
        # Test login
        login_data = {
            "username": register_data['username'],
            "password": register_data['password']
        }
        
        result = self.test_endpoint('POST', '/users/login/', login_data, 
                                  expected_status=200, description="User login")
        
        if result:
            self.token = result.get('token') or result.get('access_token')
            self.user_id = result.get('user_id')
        
        # Test profile access
        self.test_endpoint('GET', '/users/me/profile/', headers=self.get_auth_headers(),
                          expected_status=200, description="Get user profile")
    
    def test_library_endpoints(self):
        """Test all library endpoints"""
        self.log("📚 Testing Library Endpoints")
        
        headers = self.get_auth_headers()
        
        # Test book listing
        self.test_endpoint('GET', '/library/books/', headers=headers,
                          expected_status=200, description="List all books")
        
        # Test user library
        self.test_endpoint('GET', '/library/library/', headers=headers,
                          expected_status=200, description="Get user library")
        
        # Test book search
        self.test_endpoint('GET', '/library/books/search/', 
                          data={'q': 'test'}, headers=headers,
                          expected_status=200, description="Search books")
        
        # Test bookmarks
        self.test_endpoint('GET', '/library/bookmarks/', headers=headers,
                          expected_status=200, description="Get bookmarks")
        
        # Test favorites
        self.test_endpoint('GET', '/library/favorites/', headers=headers,
                          expected_status=200, description="Get favorites")
        
        # Test recommended books
        self.test_endpoint('GET', '/library/recommended/', headers=headers,
                          expected_status=200, description="Get recommended books")
    
    def test_user_endpoints(self):
        """Test all user-related endpoints"""
        self.log("👥 Testing User Endpoints")
        
        headers = self.get_auth_headers()
        
        # Test user search
        self.test_endpoint('GET', '/users/search/', 
                          data={'q': 'test'}, headers=headers,
                          expected_status=200, description="Search users")
        
        # Test recommended users
        self.test_endpoint('GET', '/users/recommended/', headers=headers,
                          expected_status=200, description="Get recommended users")
        
        # Test user library (new endpoint)
        if self.user_id:
            self.test_endpoint('GET', f'/users/{self.user_id}/library/', headers=headers,
                              expected_status=200, description="Get user library (new endpoint)")
    
    def test_notification_endpoints(self):
        """Test all notification endpoints"""
        self.log("🔔 Testing Notification Endpoints")
        
        headers = self.get_auth_headers()
        
        # Test get notifications
        self.test_endpoint('GET', '/swaps/notifications/', headers=headers,
                          expected_status=200, description="Get notifications")
        
        # Test mark all as read
        self.test_endpoint('POST', '/swaps/notifications/mark-all-read/', headers=headers,
                          expected_status=200, description="Mark all notifications as read")
    
    def test_swap_endpoints(self):
        """Test all swap endpoints"""
        self.log("🔄 Testing Swap Endpoints")
        
        headers = self.get_auth_headers()
        
        # Test get swaps
        self.test_endpoint('GET', '/swaps/list/', headers=headers,
                          expected_status=200, description="Get swaps list")
        
        # Test swap history
        self.test_endpoint('GET', '/swaps/history/', headers=headers,
                          expected_status=200, description="Get swap history")
        
        # Test midpoint calculation
        self.test_endpoint('GET', '/swaps/midpoint/', 
                          data={'user_lat': 40.7128, 'user_lng': -74.0060, 
                                'other_lat': 40.7589, 'other_lng': -73.9851}, 
                          headers=headers,
                          expected_status=200, description="Calculate midpoint")
    
    def test_discussion_endpoints(self):
        """Test all discussion endpoints"""
        self.log("💬 Testing Discussion Endpoints")
        
        headers = self.get_auth_headers()
        
        # Test get posts
        self.test_endpoint('GET', '/discussions/posts/list/', headers=headers,
                          expected_status=200, description="Get discussion posts")
        
        # Test top posts
        self.test_endpoint('GET', '/discussions/top-posts/', headers=headers,
                          expected_status=200, description="Get top posts")
    
    def test_chat_endpoints(self):
        """Test all chat endpoints"""
        self.log("💭 Testing Chat Endpoints")
        
        headers = self.get_auth_headers()
        
        # Test get messages
        self.test_endpoint('GET', '/chat/messages/', headers=headers,
                          expected_status=200, description="Get chat messages")
        
        # Test get societies
        self.test_endpoint('GET', '/chat/societies/', headers=headers,
                          expected_status=200, description="Get societies")
    
    def run_all_tests(self):
        """Run all endpoint tests"""
        self.log("🚀 Starting Comprehensive Backend-Frontend Integration Tests")
        self.log("=" * 80)
        
        # Test in order of dependency
        self.test_authentication_endpoints()
        
        if self.token:
            self.test_library_endpoints()
            self.test_user_endpoints()
            self.test_notification_endpoints()
            self.test_swap_endpoints()
            self.test_discussion_endpoints()
            self.test_chat_endpoints()
        else:
            self.log("❌ Authentication failed - skipping authenticated endpoints", "ERROR")
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test results summary"""
        self.log("=" * 80)
        self.log("📊 TEST RESULTS SUMMARY")
        self.log("=" * 80)
        
        total_tests = len(self.results['passed']) + len(self.results['failed']) + len(self.results['skipped'])
        
        self.log(f"✅ PASSED: {len(self.results['passed'])}")
        self.log(f"❌ FAILED: {len(self.results['failed'])}")
        self.log(f"⏭️  SKIPPED: {len(self.results['skipped'])}")
        self.log(f"📊 TOTAL: {total_tests}")
        
        if self.results['failed']:
            self.log("\n❌ FAILED TESTS:")
            for failure in self.results['failed']:
                self.log(f"  {failure}")
        
        success_rate = (len(self.results['passed']) / total_tests * 100) if total_tests > 0 else 0
        self.log(f"\n🎯 SUCCESS RATE: {success_rate:.1f}%")
        
        if success_rate >= 90:
            self.log("🎉 EXCELLENT! Most endpoints are working correctly.")
        elif success_rate >= 70:
            self.log("👍 GOOD! Most endpoints are working, some issues to fix.")
        else:
            self.log("⚠️  NEEDS ATTENTION! Many endpoints have issues.")

if __name__ == "__main__":
    tester = EndpointTester()
    tester.run_all_tests()
