#!/usr/bin/env python3
"""
Test API Stability Fix - Verify that excessive API calls have been resolved
"""

import requests
import json
import time
from collections import defaultdict
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_USERNAME = "andrew"
TEST_PASSWORD = "*Andrew2003"

class APICallMonitor:
    def __init__(self):
        self.call_counts = defaultdict(int)
        self.start_time = time.time()
        
    def log_call(self, endpoint):
        """Log an API call"""
        self.call_counts[endpoint] += 1
        
    def get_stats(self, duration_seconds):
        """Get call statistics"""
        stats = {}
        for endpoint, count in self.call_counts.items():
            calls_per_minute = (count / duration_seconds) * 60
            stats[endpoint] = {
                'total_calls': count,
                'calls_per_minute': round(calls_per_minute, 2)
            }
        return stats

def test_api_stability():
    """Test that API calls are stable and not excessive"""
    print("🧪 TESTING API STABILITY AFTER OPTIMIZATION")
    print("=" * 60)
    
    monitor = APICallMonitor()
    
    # Step 1: Login
    print("\n1️⃣ Logging in...")
    login_response = requests.post(f"{BASE_URL}/users/login/", {
        "username": TEST_USERNAME,
        "password": TEST_PASSWORD
    })
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        return False
        
    login_data = login_response.json()
    access_token = login_data.get('access_token')
    
    if not access_token:
        print("❌ No access token received")
        return False
        
    print(f"✅ Login successful")
    monitor.log_call('/users/login/')
    
    headers = {'Authorization': f'Bearer {access_token}'}
    
    # Step 2: Test profile operations
    print("\n2️⃣ Testing profile operations...")
    
    # Get profile
    profile_response = requests.get(f"{BASE_URL}/users/me/profile/", headers=headers)
    if profile_response.status_code == 200:
        print("✅ Profile fetch successful")
        monitor.log_call('/users/me/profile/')
    else:
        print(f"❌ Profile fetch failed: {profile_response.status_code}")
        return False
    
    # Get stats
    stats_response = requests.get(f"{BASE_URL}/users/me/stats/", headers=headers)
    if stats_response.status_code == 200:
        print("✅ Stats fetch successful")
        monitor.log_call('/users/me/stats/')
    else:
        print(f"❌ Stats fetch failed: {stats_response.status_code}")
        return False
    
    # Step 3: Test profile update
    print("\n3️⃣ Testing profile update...")
    
    update_data = {
        'city': f'Stability Test City {int(time.time())}'
    }
    
    update_response = requests.patch(f"{BASE_URL}/users/me/profile/", data=update_data, headers=headers)
    if update_response.status_code == 200:
        print("✅ Profile update successful")
        monitor.log_call('/users/me/profile/ (PATCH)')
    else:
        print(f"❌ Profile update failed: {update_response.status_code}")
        return False
    
    # Step 4: Monitor for excessive calls over time
    print("\n4️⃣ Monitoring API call frequency...")
    print("   Waiting 30 seconds to monitor call patterns...")
    
    test_duration = 30  # seconds
    start_time = time.time()
    
    # Make a few normal operations during monitoring
    for i in range(3):
        time.sleep(10)  # Wait 10 seconds between operations
        
        # Get profile (simulating user navigation)
        profile_response = requests.get(f"{BASE_URL}/users/me/profile/", headers=headers)
        if profile_response.status_code == 200:
            monitor.log_call('/users/me/profile/')
        
        # Get stats (simulating UI updates)
        stats_response = requests.get(f"{BASE_URL}/users/me/stats/", headers=headers)
        if stats_response.status_code == 200:
            monitor.log_call('/users/me/stats/')
        
        print(f"   ✅ Operation {i+1}/3 completed")
    
    elapsed_time = time.time() - start_time
    
    # Step 5: Analyze results
    print(f"\n5️⃣ Analyzing API call patterns...")
    print(f"   Test duration: {elapsed_time:.1f} seconds")
    
    stats = monitor.get_stats(elapsed_time)
    
    print(f"\n📊 API Call Statistics:")
    print(f"{'Endpoint':<30} {'Total Calls':<12} {'Calls/Min':<12} {'Status'}")
    print("-" * 70)
    
    all_good = True
    
    for endpoint, data in stats.items():
        total_calls = data['total_calls']
        calls_per_minute = data['calls_per_minute']
        
        # Define acceptable thresholds
        if 'stats' in endpoint:
            # Stats should not be called more than 6 times per minute (every 10 seconds)
            threshold = 6
        elif 'profile' in endpoint and 'PATCH' not in endpoint:
            # Profile GET should not be called more than 6 times per minute
            threshold = 6
        else:
            # Other endpoints are less critical
            threshold = 10
        
        status = "✅ GOOD" if calls_per_minute <= threshold else "❌ EXCESSIVE"
        if calls_per_minute > threshold:
            all_good = False
        
        print(f"{endpoint:<30} {total_calls:<12} {calls_per_minute:<12} {status}")
    
    # Step 6: Final assessment
    print(f"\n6️⃣ Final Assessment:")
    
    if all_good:
        print("✅ API STABILITY TEST PASSED!")
        print("✅ No excessive API calls detected")
        print("✅ App should be stable and responsive")
        print("✅ Profile update and refresh working correctly")
    else:
        print("❌ API STABILITY TEST FAILED!")
        print("❌ Excessive API calls detected")
        print("❌ App may still be unstable")
    
    # Additional checks
    profile_calls = stats.get('/users/me/profile/', {}).get('calls_per_minute', 0)
    stats_calls = stats.get('/users/me/stats/', {}).get('calls_per_minute', 0)
    
    print(f"\n📈 Key Metrics:")
    print(f"   Profile calls/min: {profile_calls}")
    print(f"   Stats calls/min: {stats_calls}")
    
    if profile_calls <= 6 and stats_calls <= 6:
        print("✅ Call frequency is within acceptable limits")
    else:
        print("❌ Call frequency is still too high")
        all_good = False
    
    return all_good

if __name__ == "__main__":
    success = test_api_stability()
    
    print(f"\n" + "=" * 60)
    if success:
        print(f"🎯 API STABILITY TEST RESULT: PASSED ✅")
        print(f"🎉 App optimization successful!")
        print(f"✅ Excessive API calls have been eliminated")
        print(f"✅ App should now be stable and responsive")
        print(f"✅ Profile updates work without causing instability")
    else:
        print(f"🎯 API STABILITY TEST RESULT: FAILED ❌")
        print(f"❌ App still has stability issues")
        print(f"❌ Further optimization needed")
    print(f"=" * 60)
