#!/usr/bin/env python3
"""
Comprehensive API Testing for BookSwaps
Tests all critical API endpoints with proper authentication and data
"""

import requests
import json
import time
from datetime import datetime, date
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BookSwapsAPITester:
    def __init__(self, base_url="http://192.168.3.97:8000/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.token = None
        self.user_id = None
        self.test_results = {
            'passed': [],
            'failed': [],
            'total': 0
        }
    
    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.test_results['total'] += 1
        if success:
            self.test_results['passed'].append(test_name)
            logger.info(f"✅ {test_name} - PASSED {details}")
        else:
            self.test_results['failed'].append(test_name)
            logger.error(f"❌ {test_name} - FAILED {details}")
    
    def make_request(self, method, endpoint, data=None, headers=None, expected_status=200):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        # Add authentication header if token exists
        if self.token and headers is None:
            headers = {'Authorization': f'Bearer {self.token}'}
        elif self.token and headers:
            headers['Authorization'] = f'Bearer {self.token}'
        
        try:
            response = self.session.request(method, url, json=data, headers=headers)

            # Log request details
            logger.debug(f"{method} {url} - Status: {response.status_code}")
            if response.status_code >= 400:
                logger.debug(f"Error response: {response.text}")

            return response
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {e}")
            return None
    
    def test_user_registration(self):
        """Test user registration endpoint"""
        logger.info("🔐 Testing User Registration...")
        
        test_user_data = {
            "username": f"testuser_{int(time.time())}",
            "email": f"test_{int(time.time())}@example.com",
            "password": "TestPassword123!",
            "birth_date": "1990-01-01",
            "gender": "Other"
        }
        
        response = self.make_request('POST', '/users/register/', test_user_data, expected_status=201)
        
        if response and response.status_code == 201:
            data = response.json()
            self.token = data.get('token')
            self.user_id = data.get('user_id')
            self.log_result("User Registration", True, f"User ID: {self.user_id}")
            return True
        else:
            error_msg = response.json() if response else "No response"
            self.log_result("User Registration", False, f"Status: {response.status_code if response else 'N/A'}, Error: {error_msg}")
            return False
    
    def test_user_login(self):
        """Test user login with existing credentials"""
        logger.info("🔐 Testing User Login...")
        
        # Try with known test credentials
        login_data = {
            "username": "andrew",
            "password": "*Andrew2003"
        }
        
        response = self.make_request('POST', '/users/login/', login_data, headers={}, expected_status=200)
        
        if response and response.status_code == 200:
            data = response.json()
            self.token = data.get('token')
            self.user_id = data.get('user_id')
            self.log_result("User Login", True, f"Token received")
            return True
        else:
            error_msg = response.json() if response else "No response"
            self.log_result("User Login", False, f"Status: {response.status_code if response else 'N/A'}, Error: {error_msg}")
            return False
    
    def test_user_profile(self):
        """Test user profile endpoints"""
        logger.info("👤 Testing User Profile...")
        
        if not self.token:
            self.log_result("User Profile - Get", False, "No authentication token")
            return False
        
        # Test GET profile
        response = self.make_request('GET', '/users/me/profile/')
        
        if response and response.status_code == 200:
            self.log_result("User Profile - Get", True)
        else:
            error_msg = response.json() if response else "No response"
            self.log_result("User Profile - Get", False, f"Status: {response.status_code if response else 'N/A'}")
            return False
        
        # Test UPDATE profile
        update_data = {
            "about_you": "Updated bio for testing",
            "city": "Test City"
        }
        
        response = self.make_request('PATCH', '/users/me/profile/', update_data)
        
        if response and response.status_code == 200:
            self.log_result("User Profile - Update", True)
            return True
        else:
            error_msg = response.json() if response else "No response"
            self.log_result("User Profile - Update", False, f"Status: {response.status_code if response else 'N/A'}")
            return False
    
    def test_books_endpoints(self):
        """Test book-related endpoints"""
        logger.info("📚 Testing Books Endpoints...")
        
        if not self.token:
            self.log_result("Books - List", False, "No authentication token")
            return False
        
        # Test GET books list
        response = self.make_request('GET', '/library/books/')
        
        if response and response.status_code == 200:
            self.log_result("Books - List", True)
            books_data = response.json()
            
            # Test adding a book
            new_book_data = {
                "title": "Test Book",
                "author": "Test Author",
                "year": 2023,
                "genre": "Fiction",
                "isbn": f"978{int(time.time())}"[-13:],  # Generate unique ISBN
                "condition": "good",
                "synopsis": "A test book for API testing"
            }
            
            response = self.make_request('POST', '/library/books/add/', new_book_data)
            
            if response and response.status_code == 201:
                self.log_result("Books - Add", True)
                return True
            else:
                error_msg = response.json() if response else "No response"
                self.log_result("Books - Add", False, f"Status: {response.status_code if response else 'N/A'}, Error: {error_msg}")
                return False
        else:
            error_msg = response.json() if response else "No response"
            self.log_result("Books - List", False, f"Status: {response.status_code if response else 'N/A'}")
            return False
    
    def test_swaps_endpoints(self):
        """Test swap-related endpoints"""
        logger.info("🔄 Testing Swaps Endpoints...")
        
        if not self.token:
            self.log_result("Swaps - List", False, "No authentication token")
            return False
        
        # Test GET swaps list
        response = self.make_request('GET', '/swaps/list/')
        
        if response and response.status_code == 200:
            self.log_result("Swaps - List", True)
            return True
        else:
            error_msg = response.json() if response else "No response"
            self.log_result("Swaps - List", False, f"Status: {response.status_code if response else 'N/A'}")
            return False
    
    def test_notifications_endpoints(self):
        """Test notification endpoints"""
        logger.info("🔔 Testing Notifications Endpoints...")
        
        if not self.token:
            self.log_result("Notifications - List", False, "No authentication token")
            return False
        
        # Test GET notifications
        response = self.make_request('GET', '/swaps/notifications/')
        
        if response and response.status_code == 200:
            self.log_result("Notifications - List", True)
            return True
        else:
            error_msg = response.json() if response else "No response"
            self.log_result("Notifications - List", False, f"Status: {response.status_code if response else 'N/A'}")
            return False
    
    def test_discussions_endpoints(self):
        """Test discussion endpoints"""
        logger.info("💬 Testing Discussions Endpoints...")
        
        if not self.token:
            self.log_result("Discussions - List", False, "No authentication token")
            return False
        
        # Test GET discussions
        response = self.make_request('GET', '/discussions/posts/list/')

        if response and response.status_code == 200:
            self.log_result("Discussions - List", True)

            # Test creating a discussion
            new_discussion_data = {
                "type": "Article",
                "title": "Test Discussion",
                "content": "This is a test discussion for API testing",
                "tags": ["test", "api"]
            }

            response = self.make_request('POST', '/discussions/posts/', new_discussion_data)
            
            if response and response.status_code == 201:
                self.log_result("Discussions - Create", True)
                return True
            else:
                error_msg = response.json() if response else "No response"
                self.log_result("Discussions - Create", False, f"Status: {response.status_code if response else 'N/A'}")
                return False
        else:
            error_msg = response.json() if response else "No response"
            self.log_result("Discussions - List", False, f"Status: {response.status_code if response else 'N/A'}")
            return False
    
    def test_chat_endpoints(self):
        """Test chat endpoints"""
        logger.info("💬 Testing Chat Endpoints...")
        
        if not self.token:
            self.log_result("Chat - List", False, "No authentication token")
            return False
        
        # Test GET chats
        response = self.make_request('GET', '/chat/messages/')
        
        if response and response.status_code == 200:
            self.log_result("Chat - List", True)
            return True
        else:
            error_msg = response.json() if response else "No response"
            self.log_result("Chat - List", False, f"Status: {response.status_code if response else 'N/A'}")
            return False
    
    def run_all_tests(self):
        """Run all API tests"""
        logger.info("🚀 Starting Comprehensive BookSwaps API Tests")
        logger.info("=" * 80)
        
        # Try to authenticate first
        if not self.test_user_login():
            logger.warning("⚠️  Login failed, trying registration...")
            if not self.test_user_registration():
                logger.error("❌ Both login and registration failed. Cannot proceed with authenticated tests.")
                self.print_summary()
                return False
        
        # Run authenticated tests
        self.test_user_profile()
        self.test_books_endpoints()
        self.test_swaps_endpoints()
        self.test_notifications_endpoints()
        self.test_discussions_endpoints()
        self.test_chat_endpoints()
        
        self.print_summary()
        return len(self.test_results['failed']) == 0
    
    def print_summary(self):
        """Print test results summary"""
        logger.info("=" * 80)
        logger.info("📊 API TEST RESULTS SUMMARY")
        logger.info("=" * 80)
        
        total = self.test_results['total']
        passed = len(self.test_results['passed'])
        failed = len(self.test_results['failed'])
        success_rate = (passed / total * 100) if total > 0 else 0
        
        logger.info(f"✅ PASSED: {passed}")
        logger.info(f"❌ FAILED: {failed}")
        logger.info(f"📊 TOTAL: {total}")
        logger.info(f"🎯 SUCCESS RATE: {success_rate:.1f}%")
        
        if failed > 0:
            logger.info("\n❌ FAILED TESTS:")
            for test in self.test_results['failed']:
                logger.info(f"   • {test}")
        
        if success_rate >= 90:
            logger.info("🎉 EXCELLENT! API is ready for production.")
        elif success_rate >= 70:
            logger.info("⚠️  GOOD, but some issues need attention.")
        else:
            logger.info("🚨 CRITICAL! Many endpoints have issues.")

def main():
    tester = BookSwapsAPITester()
    success = tester.run_all_tests()
    
    if success:
        logger.info("✅ All API tests passed!")
        exit(0)
    else:
        logger.error("❌ Some API tests failed!")
        exit(1)

if __name__ == "__main__":
    main()
