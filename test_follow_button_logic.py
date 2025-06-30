#!/usr/bin/env python3
"""
Test Follow Button Logic and API Endpoints
Comprehensive testing of follow/unfollow functionality and button states
"""

import requests
import json
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FollowButtonTester:
    def __init__(self, base_url="http://192.168.3.97:8000/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.user1_token = None
        self.user2_token = None
        self.user1_id = None
        self.user2_id = None
        self.test_results = []
    
    def log_test(self, test_name, success, details=""):
        """Log test result"""
        status = "✅ PASSED" if success else "❌ FAILED"
        logger.info(f"{status} {test_name} - {details}")
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details
        })
    
    def make_request(self, method, endpoint, data=None, token=None):
        """Make HTTP request with authentication"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        headers = {}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        try:
            response = self.session.request(method, url, json=data, headers=headers)
            return response
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {e}")
            return None
    
    def login_test_users(self):
        """Login with test users"""
        logger.info("🔐 Logging in test users...")
        
        # Login User 1 (andrew)
        response = self.make_request('POST', '/users/login/', {
            "username": "andrew",
            "password": "*Andrew2003"
        })
        
        if response and response.status_code == 200:
            data = response.json()
            self.user1_token = data.get('token')
            self.user1_id = data.get('user_id')
            self.log_test("User 1 Login", True, f"User ID: {self.user1_id}")
        else:
            self.log_test("User 1 Login", False, "Failed to login")
            return False
        
        # For testing, we'll use the same user but simulate different scenarios
        # In a real test, you'd have multiple test accounts
        return True
    
    def test_follow_status_api(self):
        """Test follow status endpoint"""
        logger.info("📊 Testing Follow Status API...")
        
        if not self.user1_token:
            self.log_test("Follow Status API", False, "No authentication token")
            return False
        
        # Test getting follow status (should work even if no relationship exists)
        response = self.make_request(
            'GET', 
            f'/users/follow-status/{self.user1_id}/?other_user_id={self.user1_id}',
            token=self.user1_token
        )
        
        if response and response.status_code == 200:
            data = response.json()
            expected_keys = ['is_following', 'is_mutual']
            if all(key in data for key in expected_keys):
                self.log_test("Follow Status API", True, f"Response: {data}")
                return True
            else:
                self.log_test("Follow Status API", False, f"Missing keys in response: {data}")
        else:
            self.log_test("Follow Status API", False, f"Status: {response.status_code if response else 'No response'}")
        
        return False
    
    def test_search_users(self):
        """Test user search functionality"""
        logger.info("🔍 Testing User Search...")
        
        response = self.make_request(
            'GET',
            '/users/search/?q=test',
            token=self.user1_token
        )
        
        if response and response.status_code == 200:
            data = response.json()
            if 'results' in data:
                self.log_test("User Search", True, f"Found {len(data['results'])} users")
                return data['results']
            else:
                self.log_test("User Search", False, "No 'results' key in response")
        else:
            self.log_test("User Search", False, f"Status: {response.status_code if response else 'No response'}")
        
        return []
    
    def test_recommended_users(self):
        """Test recommended users endpoint"""
        logger.info("💡 Testing Recommended Users...")
        
        response = self.make_request(
            'GET',
            '/users/recommended/',
            token=self.user1_token
        )
        
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_test("Recommended Users", True, f"Found {len(data)} recommendations")
                return data
            else:
                self.log_test("Recommended Users", False, "Response is not a list")
        else:
            self.log_test("Recommended Users", False, f"Status: {response.status_code if response else 'No response'}")
        
        return []
    
    def test_follow_unfollow_cycle(self, target_user_id):
        """Test complete follow/unfollow cycle"""
        logger.info(f"🔄 Testing Follow/Unfollow Cycle for user {target_user_id}...")
        
        # Step 1: Check initial follow status
        response = self.make_request(
            'GET',
            f'/users/follow-status/{self.user1_id}/?other_user_id={target_user_id}',
            token=self.user1_token
        )
        
        if not response or response.status_code != 200:
            self.log_test("Follow Cycle - Initial Status", False, "Failed to get initial status")
            return False
        
        initial_status = response.json()
        logger.info(f"Initial status: {initial_status}")
        
        # Step 2: Follow the user
        response = self.make_request(
            'POST',
            f'/users/follow/{target_user_id}/',
            {
                "followed_id": target_user_id,
                "source": "Test"
            },
            token=self.user1_token
        )
        
        if response and response.status_code == 200:
            follow_data = response.json()
            self.log_test("Follow User", True, f"Follow response: {follow_data}")
        else:
            error_msg = response.json() if response else "No response"
            self.log_test("Follow User", False, f"Status: {response.status_code if response else 'N/A'}, Error: {error_msg}")
            return False
        
        # Step 3: Verify follow status changed
        time.sleep(0.5)  # Brief delay for consistency
        response = self.make_request(
            'GET',
            f'/users/follow-status/{self.user1_id}/?other_user_id={target_user_id}',
            token=self.user1_token
        )
        
        if response and response.status_code == 200:
            new_status = response.json()
            if new_status.get('is_following'):
                self.log_test("Follow Status Update", True, f"Now following: {new_status}")
            else:
                self.log_test("Follow Status Update", False, f"Status not updated: {new_status}")
                return False
        else:
            self.log_test("Follow Status Update", False, "Failed to get updated status")
            return False
        
        # Step 4: Unfollow the user
        response = self.make_request(
            'DELETE',
            f'/users/unfollow/{target_user_id}/',
            token=self.user1_token
        )
        
        if response and response.status_code == 200:
            unfollow_data = response.json()
            self.log_test("Unfollow User", True, f"Unfollow response: {unfollow_data}")
        else:
            error_msg = response.json() if response else "No response"
            self.log_test("Unfollow User", False, f"Status: {response.status_code if response else 'N/A'}, Error: {error_msg}")
            return False
        
        # Step 5: Verify unfollow status
        time.sleep(0.5)  # Brief delay for consistency
        response = self.make_request(
            'GET',
            f'/users/follow-status/{self.user1_id}/?other_user_id={target_user_id}',
            token=self.user1_token
        )
        
        if response and response.status_code == 200:
            final_status = response.json()
            if not final_status.get('is_following'):
                self.log_test("Unfollow Status Update", True, f"No longer following: {final_status}")
                return True
            else:
                self.log_test("Unfollow Status Update", False, f"Still following: {final_status}")
        else:
            self.log_test("Unfollow Status Update", False, "Failed to get final status")
        
        return False
    
    def test_button_logic_scenarios(self):
        """Test various button logic scenarios"""
        logger.info("🎯 Testing Button Logic Scenarios...")
        
        # Get some users to test with
        search_results = self.test_search_users()
        recommended_users = self.test_recommended_users()
        
        test_users = []
        if search_results:
            test_users.extend(search_results[:2])
        if recommended_users:
            test_users.extend(recommended_users[:2])
        
        if not test_users:
            self.log_test("Button Logic Scenarios", False, "No test users available")
            return False
        
        success_count = 0
        for user in test_users[:2]:  # Test with first 2 users
            user_id = user.get('user_id')
            username = user.get('username', 'Unknown')
            
            if user_id and user_id != self.user1_id:  # Don't test with self
                logger.info(f"Testing with user: {username} ({user_id})")
                if self.test_follow_unfollow_cycle(user_id):
                    success_count += 1
        
        if success_count > 0:
            self.log_test("Button Logic Scenarios", True, f"Successfully tested {success_count} users")
            return True
        else:
            self.log_test("Button Logic Scenarios", False, "No successful test cycles")
            return False
    
    def run_all_tests(self):
        """Run all follow button logic tests"""
        logger.info("🚀 Starting Follow Button Logic Tests")
        logger.info("=" * 80)
        
        # Login test users
        if not self.login_test_users():
            logger.error("❌ Failed to login test users. Cannot proceed.")
            return False
        
        # Run individual tests
        self.test_follow_status_api()
        self.test_search_users()
        self.test_recommended_users()
        self.test_button_logic_scenarios()
        
        # Print summary
        self.print_summary()
        
        # Return overall success
        failed_tests = [test for test in self.test_results if not test['success']]
        return len(failed_tests) == 0
    
    def print_summary(self):
        """Print test results summary"""
        logger.info("=" * 80)
        logger.info("📊 FOLLOW BUTTON LOGIC TEST SUMMARY")
        logger.info("=" * 80)
        
        passed = len([test for test in self.test_results if test['success']])
        failed = len([test for test in self.test_results if not test['success']])
        total = len(self.test_results)
        success_rate = (passed / total * 100) if total > 0 else 0
        
        logger.info(f"✅ PASSED: {passed}")
        logger.info(f"❌ FAILED: {failed}")
        logger.info(f"📊 TOTAL: {total}")
        logger.info(f"🎯 SUCCESS RATE: {success_rate:.1f}%")
        
        if failed > 0:
            logger.info("\n❌ FAILED TESTS:")
            for test in self.test_results:
                if not test['success']:
                    logger.info(f"   • {test['test']}: {test['details']}")
        
        if success_rate >= 90:
            logger.info("🎉 EXCELLENT! Follow button logic is working correctly.")
        elif success_rate >= 70:
            logger.info("⚠️  GOOD, but some issues need attention.")
        else:
            logger.info("🚨 CRITICAL! Follow button logic has major issues.")

def main():
    tester = FollowButtonTester()
    success = tester.run_all_tests()
    
    if success:
        logger.info("✅ All follow button logic tests passed!")
        exit(0)
    else:
        logger.error("❌ Some follow button logic tests failed!")
        exit(1)

if __name__ == "__main__":
    main()
