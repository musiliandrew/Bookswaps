#!/usr/bin/env python3
"""
Test Profile Card Fixes - Verify navigation and real data display
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_USERNAME = "andrew"
TEST_PASSWORD = "*Andrew2003"

def test_profile_card_fixes():
    """Test that profile card shows real data and navigation works"""
    print("🧪 TESTING PROFILE CARD FIXES")
    print("=" * 50)
    
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
    
    headers = {'Authorization': f'Bearer {access_token}'}
    
    # Step 2: Get profile data
    print("\n2️⃣ Getting profile data...")
    profile_response = requests.get(f"{BASE_URL}/users/me/profile/", headers=headers)
    
    if profile_response.status_code != 200:
        print(f"❌ Failed to get profile: {profile_response.status_code}")
        return False
        
    profile_data = profile_response.json()
    print(f"✅ Profile data retrieved")
    
    # Step 3: Verify real data (not test data)
    print(f"\n3️⃣ Verifying profile data...")
    
    username = profile_data.get('username', '')
    city = profile_data.get('city', '')
    country = profile_data.get('country', '')
    about = profile_data.get('about_you', '')
    
    print(f"   Username: {username}")
    print(f"   City: {city}")
    print(f"   Country: {country}")
    print(f"   About: {about}")
    
    # Check if data looks like test data (contains timestamps)
    test_data_indicators = [
        'Updated City' in str(city),
        'Updated Country' in str(country),
        any(char.isdigit() for char in str(city)) and len(str(city)) > 20,
        any(char.isdigit() for char in str(country)) and len(str(country)) > 20
    ]
    
    if any(test_data_indicators):
        print(f"❌ Profile still contains test data!")
        print(f"   City contains test data: {'Updated City' in str(city)}")
        print(f"   Country contains test data: {'Updated Country' in str(country)}")
        return False
    else:
        print(f"✅ Profile shows real data (no test timestamps)")
    
    # Step 4: Verify expected real data
    print(f"\n4️⃣ Verifying expected real data...")
    
    expected_data = {
        'username': 'andrew',
        'city': 'Nairobi',
        'country': 'Kenya',
        'about_you': 'Smart, Nerd'
    }
    
    all_correct = True
    for field, expected_value in expected_data.items():
        actual_value = profile_data.get(field, '')
        if actual_value == expected_value:
            print(f"   ✅ {field}: '{actual_value}' (correct)")
        else:
            print(f"   ❌ {field}: '{actual_value}' (expected: '{expected_value}')")
            all_correct = False
    
    if not all_correct:
        print(f"❌ Some profile data doesn't match expected values")
        return False
    
    # Step 5: Get user stats
    print(f"\n5️⃣ Getting user stats...")
    stats_response = requests.get(f"{BASE_URL}/users/me/stats/", headers=headers)
    
    if stats_response.status_code != 200:
        print(f"❌ Failed to get stats: {stats_response.status_code}")
        return False
        
    stats_data = stats_response.json()
    print(f"✅ Stats data retrieved")
    print(f"   Books: {stats_data.get('books_count', 0)}")
    print(f"   Swaps: {stats_data.get('swaps_count', 0)}")
    print(f"   Followers: {stats_data.get('followers_count', 0)}")
    print(f"   Following: {stats_data.get('following_count', 0)}")
    
    # Step 6: Test profile completion
    print(f"\n6️⃣ Getting profile completion...")
    completion_response = requests.get(f"{BASE_URL}/users/me/profile-completion/", headers=headers)
    
    if completion_response.status_code == 200:
        completion_data = completion_response.json()
        print(f"✅ Profile completion retrieved")
        print(f"   Completion: {completion_data.get('completion_percentage', 0)}%")
        print(f"   Completed: {completion_data.get('is_completed', False)}")
    else:
        print(f"⚠️  Profile completion endpoint not available: {completion_response.status_code}")
    
    print(f"\n🎉 PROFILE CARD FIXES VERIFICATION COMPLETE!")
    print(f"✅ Profile shows real data instead of test timestamps")
    print(f"✅ All expected data fields are correct")
    print(f"✅ Stats data is available for user card display")
    
    return True

def test_frontend_accessibility():
    """Test that frontend is still accessible"""
    print(f"\n🌐 Testing frontend accessibility...")
    
    try:
        response = requests.get("http://localhost:5173", timeout=5)
        if response.status_code == 200:
            print(f"✅ Frontend is accessible")
            return True
        else:
            print(f"❌ Frontend returned status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend not accessible: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 TESTING PROFILE CARD FIXES AND NAVIGATION")
    print("=" * 60)
    
    # Test backend functionality
    backend_success = test_profile_card_fixes()
    
    # Test frontend accessibility
    frontend_success = test_frontend_accessibility()
    
    print(f"\n" + "=" * 60)
    print(f"📊 TEST RESULTS SUMMARY")
    print(f"=" * 60)
    
    if backend_success and frontend_success:
        print(f"🎯 OVERALL RESULT: SUCCESS ✅")
        print(f"🎉 Profile card fixes working correctly!")
        print(f"✅ Real data displayed (no test timestamps)")
        print(f"✅ Profile data is accurate and complete")
        print(f"✅ Frontend is accessible for navigation testing")
        print(f"\n💡 Manual Testing:")
        print(f"   1. Open http://localhost:5173 in browser")
        print(f"   2. Login with andrew/*Andrew2003")
        print(f"   3. Click camera icon on profile picture")
        print(f"   4. Verify it navigates to settings")
        print(f"   5. Click 'Edit Profile' button")
        print(f"   6. Verify it navigates to settings")
        print(f"   7. Verify profile shows: Nairobi, Kenya")
    else:
        print(f"🎯 OVERALL RESULT: ISSUES FOUND ❌")
        if not backend_success:
            print(f"❌ Backend profile data issues")
        if not frontend_success:
            print(f"❌ Frontend accessibility issues")
    
    print(f"=" * 60)
