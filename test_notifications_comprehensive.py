#!/usr/bin/env python3
"""
Comprehensive Notifications & Swaps Testing
Tests all notification and swap functionality through backend and frontend
"""

import requests
import json
import time
import logging
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class NotificationsSwapsTester:
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
    
    def log_test(self, test_name, success, details=""):
        """Log test result"""
        self.test_results['total'] += 1
        status = "✅ PASSED" if success else "❌ FAILED"
        logger.info(f"{status} {test_name} - {details}")
        
        if success:
            self.test_results['passed'].append(test_name)
        else:
            self.test_results['failed'].append(test_name)
    
    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request with authentication"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        headers = {}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        try:
            response = self.session.request(method, url, json=data, headers=headers)
            
            # Log request details for debugging
            if response.status_code >= 400:
                logger.debug(f"{method} {url} - Status: {response.status_code}, Response: {response.text}")
            
            return response
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {e}")
            return None
    
    def authenticate(self):
        """Authenticate with test user"""
        logger.info("🔐 Authenticating...")
        
        response = self.make_request('POST', '/users/login/', {
            "username": "andrew",
            "password": "*Andrew2003"
        })
        
        if response and response.status_code == 200:
            data = response.json()
            self.token = data.get('token')
            self.user_id = data.get('user_id')
            self.log_test("Authentication", True, f"User ID: {self.user_id}")
            return True
        else:
            self.log_test("Authentication", False, "Failed to login")
            return False
    
    def test_notifications_list(self):
        """Test notifications list endpoint"""
        logger.info("🔔 Testing Notifications List...")
        
        response = self.make_request('GET', '/swaps/notifications/')
        
        if response and response.status_code == 200:
            data = response.json()
            
            # Check response structure
            expected_keys = ['count', 'next', 'previous', 'results']
            if all(key in data for key in expected_keys):
                notifications = data['results']
                self.log_test("Notifications List", True, f"Found {len(notifications)} notifications")
                
                # Test notification structure if any exist
                if notifications:
                    notification = notifications[0]
                    expected_fields = ['notification_id', 'type', 'message', 'is_read', 'created_at']
                    if all(field in notification for field in expected_fields):
                        self.log_test("Notification Structure", True, "All required fields present")
                    else:
                        missing = [f for f in expected_fields if f not in notification]
                        self.log_test("Notification Structure", False, f"Missing fields: {missing}")
                
                return notifications
            else:
                missing = [k for k in expected_keys if k not in data]
                self.log_test("Notifications List", False, f"Missing keys: {missing}")
        else:
            self.log_test("Notifications List", False, f"Status: {response.status_code if response else 'No response'}")
        
        return []
    
    def test_notifications_filtering(self):
        """Test notification filtering"""
        logger.info("🔍 Testing Notification Filtering...")
        
        # Test unread filter
        response = self.make_request('GET', '/swaps/notifications/?is_read=false')
        
        if response and response.status_code == 200:
            data = response.json()
            unread_notifications = data['results']
            self.log_test("Unread Filter", True, f"Found {len(unread_notifications)} unread notifications")
        else:
            self.log_test("Unread Filter", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test read filter
        response = self.make_request('GET', '/swaps/notifications/?is_read=true')
        
        if response and response.status_code == 200:
            data = response.json()
            read_notifications = data['results']
            self.log_test("Read Filter", True, f"Found {len(read_notifications)} read notifications")
        else:
            self.log_test("Read Filter", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test type filter
        response = self.make_request('GET', '/swaps/notifications/?type=swap_proposed')
        
        if response and response.status_code == 200:
            data = response.json()
            swap_notifications = data['results']
            self.log_test("Type Filter", True, f"Found {len(swap_notifications)} swap notifications")
        else:
            self.log_test("Type Filter", False, f"Status: {response.status_code if response else 'No response'}")
    
    def test_mark_notification_read(self, notification_id):
        """Test marking notification as read"""
        logger.info(f"📖 Testing Mark Notification Read: {notification_id}")
        
        response = self.make_request('PATCH', f'/swaps/notifications/{notification_id}/read/')
        
        if response and response.status_code == 200:
            self.log_test("Mark Notification Read", True, f"Notification {notification_id} marked as read")
            return True
        else:
            self.log_test("Mark Notification Read", False, f"Status: {response.status_code if response else 'No response'}")
            return False
    
    def test_mark_all_notifications_read(self):
        """Test marking all notifications as read"""
        logger.info("📚 Testing Mark All Notifications Read...")

        response = self.make_request('POST', '/swaps/notifications/mark-all-read/')

        if response and response.status_code == 200:
            data = response.json()
            updated_count = data.get('updated_count', 0)
            self.log_test("Mark All Read", True, f"Marked {updated_count} notifications as read")
            return True
        else:
            self.log_test("Mark All Read", False, f"Status: {response.status_code if response else 'No response'}")
            return False
    
    def test_delete_notification(self, notification_id):
        """Test deleting a notification"""
        logger.info(f"🗑️ Testing Delete Notification: {notification_id}")
        
        response = self.make_request('DELETE', f'/swaps/notifications/{notification_id}/')
        
        if response and response.status_code == 200:
            self.log_test("Delete Notification", True, f"Notification {notification_id} deleted")
            return True
        else:
            self.log_test("Delete Notification", False, f"Status: {response.status_code if response else 'No response'}")
            return False
    
    def test_swaps_list(self):
        """Test swaps list endpoint"""
        logger.info("🔄 Testing Swaps List...")
        
        response = self.make_request('GET', '/swaps/list/')
        
        if response and response.status_code == 200:
            data = response.json()
            
            # Check response structure
            expected_keys = ['count', 'next', 'previous', 'results']
            if all(key in data for key in expected_keys):
                swaps = data['results']
                self.log_test("Swaps List", True, f"Found {len(swaps)} swaps")
                
                # Test swap structure if any exist
                if swaps:
                    swap = swaps[0]
                    expected_fields = ['swap_id', 'status', 'initiator', 'receiver', 'created_at']
                    if all(field in swap for field in expected_fields):
                        self.log_test("Swap Structure", True, "All required fields present")
                    else:
                        missing = [f for f in expected_fields if f not in swap]
                        self.log_test("Swap Structure", False, f"Missing fields: {missing}")
                
                return swaps
            else:
                missing = [k for k in expected_keys if k not in data]
                self.log_test("Swaps List", False, f"Missing keys: {missing}")
        else:
            self.log_test("Swaps List", False, f"Status: {response.status_code if response else 'No response'}")
        
        return []
    
    def test_swap_history(self):
        """Test swap history endpoint"""
        logger.info("📜 Testing Swap History...")
        
        response = self.make_request('GET', '/swaps/history/')
        
        if response and response.status_code == 200:
            data = response.json()
            history = data.get('results', [])
            self.log_test("Swap History", True, f"Found {len(history)} historical swaps")
            return history
        else:
            self.log_test("Swap History", False, f"Status: {response.status_code if response else 'No response'}")
            return []
    
    def test_swap_filtering(self):
        """Test swap filtering"""
        logger.info("🔍 Testing Swap Filtering...")
        
        # Test status filter
        statuses = ['Requested', 'Accepted', 'Confirmed', 'Completed', 'Cancelled']
        
        for status_filter in statuses:
            response = self.make_request('GET', f'/swaps/list/?status={status_filter}')
            
            if response and response.status_code == 200:
                data = response.json()
                filtered_swaps = data['results']
                self.log_test(f"Status Filter ({status_filter})", True, f"Found {len(filtered_swaps)} {status_filter.lower()} swaps")
            else:
                self.log_test(f"Status Filter ({status_filter})", False, f"Status: {response.status_code if response else 'No response'}")
    
    def test_midpoint_calculation(self):
        """Test midpoint calculation endpoint (which includes location suggestions)"""
        logger.info("📍 Testing Midpoint Calculation with Location Suggestions...")

        # Test with sample coordinates (Nairobi area)
        params = {
            'user_lat': -1.2921,
            'user_lon': 36.8219,
            'other_lat': -1.3032,
            'other_lon': 36.8856,
            'transport_mode': 'driving',
            'max_distance': 10
        }

        query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
        response = self.make_request('GET', f'/swaps/midpoint/?{query_string}')

        if response and response.status_code == 200:
            data = response.json()
            expected_keys = ['midpoint', 'suggested_locations', 'distance_analysis']
            if all(key in data for key in expected_keys):
                suggested_locations = data['suggested_locations']
                self.log_test("Midpoint Calculation", True, f"Found {len(suggested_locations)} suggested locations")

                # Test location structure if any exist
                if suggested_locations:
                    location = suggested_locations[0]
                    expected_fields = ['name', 'type', 'coords']
                    if all(field in location for field in expected_fields):
                        self.log_test("Location Structure", True, "All required fields present")
                    else:
                        missing = [f for f in expected_fields if f not in location]
                        self.log_test("Location Structure", False, f"Missing fields: {missing}")

                return suggested_locations
            else:
                missing = [k for k in expected_keys if k not in data]
                self.log_test("Midpoint Calculation", False, f"Missing keys: {missing}")
        else:
            self.log_test("Midpoint Calculation", False, f"Status: {response.status_code if response else 'No response'}")

        return []
    
    def test_notification_types(self):
        """Test different notification types"""
        logger.info("🏷️ Testing Notification Types...")
        
        # Get all notifications to check types
        response = self.make_request('GET', '/swaps/notifications/')
        
        if response and response.status_code == 200:
            data = response.json()
            notifications = data['results']
            
            # Count notification types
            type_counts = {}
            for notification in notifications:
                notification_type = notification.get('type', 'unknown')
                type_counts[notification_type] = type_counts.get(notification_type, 0) + 1
            
            if type_counts:
                self.log_test("Notification Types", True, f"Found types: {list(type_counts.keys())}")
                for ntype, count in type_counts.items():
                    logger.info(f"   • {ntype}: {count} notifications")
            else:
                self.log_test("Notification Types", True, "No notifications found (empty state)")
        else:
            self.log_test("Notification Types", False, "Failed to get notifications")
    
    def run_all_tests(self):
        """Run all notification and swap tests"""
        logger.info("🚀 Starting Comprehensive Notifications & Swaps Tests")
        logger.info("=" * 80)
        
        # Authenticate first
        if not self.authenticate():
            logger.error("❌ Authentication failed. Cannot proceed.")
            return False
        
        # Test Notifications
        logger.info("\n📔 TESTING NOTIFICATIONS")
        logger.info("-" * 40)
        notifications = self.test_notifications_list()
        self.test_notifications_filtering()
        self.test_notification_types()
        
        # Test notification actions if notifications exist
        if notifications:
            # Test mark as read with first unread notification
            unread_notifications = [n for n in notifications if not n.get('is_read', True)]
            if unread_notifications:
                self.test_mark_notification_read(unread_notifications[0]['notification_id'])
        
        self.test_mark_all_notifications_read()
        
        # Test Swaps
        logger.info("\n🔄 TESTING SWAPS")
        logger.info("-" * 40)
        swaps = self.test_swaps_list()
        self.test_swap_history()
        self.test_swap_filtering()
        self.test_midpoint_calculation()
        
        # Print summary
        self.print_summary()
        
        # Return overall success
        failed_tests = [test for test in self.test_results['failed']]
        return len(failed_tests) == 0
    
    def print_summary(self):
        """Print test results summary"""
        logger.info("=" * 80)
        logger.info("📊 NOTIFICATIONS & SWAPS TEST SUMMARY")
        logger.info("=" * 80)
        
        passed = len(self.test_results['passed'])
        failed = len(self.test_results['failed'])
        total = self.test_results['total']
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
            logger.info("🎉 EXCELLENT! Notifications & Swaps are ready for production.")
        elif success_rate >= 70:
            logger.info("⚠️  GOOD, but some issues need attention.")
        else:
            logger.info("🚨 CRITICAL! Major issues found in notifications/swaps.")

def main():
    tester = NotificationsSwapsTester()
    success = tester.run_all_tests()
    
    if success:
        logger.info("✅ All notifications & swaps tests passed!")
        exit(0)
    else:
        logger.error("❌ Some notifications & swaps tests failed!")
        exit(1)

if __name__ == "__main__":
    main()
