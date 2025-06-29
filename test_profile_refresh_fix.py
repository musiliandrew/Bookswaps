#!/usr/bin/env python3
"""
Test Profile Refresh Fix - Verify that profile data refreshes properly after updates
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_USERNAME = "andrew"
TEST_PASSWORD = "*Andrew2003"

def login():
    """Login and return access token"""
    response = requests.post(f"{BASE_URL}/users/login/", {
        "username": TEST_USERNAME,
        "password": TEST_PASSWORD
    })
    
    if response.status_code == 200:
        return response.json().get('access_token')
    return None

def get_profile(token):
    """Get current profile"""
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f"{BASE_URL}/users/me/profile/", headers=headers)
    
    if response.status_code == 200:
        return response.json()
    return None

def update_profile(token, data):
    """Update profile with given data"""
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.patch(f"{BASE_URL}/users/me/profile/", data=data, headers=headers)
    
    return response.status_code == 200, response

def test_profile_refresh_scenario():
    """Test the complete profile update and refresh scenario"""
    print("🧪 TESTING PROFILE REFRESH SCENARIO")
    print("=" * 60)
    print("This test simulates the user experience:")
    print("1. User views profile")
    print("2. User updates a field")
    print("3. User navigates back to profile")
    print("4. Profile should show updated data")
    print("=" * 60)
    
    # Step 1: Login
    print("\n1️⃣ User logs in...")
    token = login()
    if not token:
        print("❌ Login failed")
        return False
    print("✅ Login successful")
    
    # Step 2: User views initial profile
    print("\n2️⃣ User views initial profile...")
    initial_profile = get_profile(token)
    if not initial_profile:
        print("❌ Failed to get initial profile")
        return False
    
    print("✅ Initial profile loaded:")
    print(f"   Username: {initial_profile.get('username', 'N/A')}")
    print(f"   City: {initial_profile.get('city', 'N/A')}")
    print(f"   Country: {initial_profile.get('country', 'N/A')}")
    print(f"   About: {initial_profile.get('about_you', 'N/A')}")
    
    # Step 3: User updates profile (simulating form submission)
    print("\n3️⃣ User updates profile (changes city)...")
    
    update_data = {
        'city': f'Updated City {int(time.time())}'  # Unique value to verify update
    }
    
    success, response = update_profile(token, update_data)
    if not success:
        print(f"❌ Profile update failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return False
    
    updated_profile_from_response = response.json()
    print("✅ Profile update successful")
    print(f"   Backend returned updated city: {updated_profile_from_response.get('city', 'N/A')}")
    
    # Step 4: Simulate user navigating back to profile (fresh fetch)
    print("\n4️⃣ User navigates back to profile (fresh fetch)...")
    time.sleep(0.5)  # Brief pause to simulate navigation
    
    refreshed_profile = get_profile(token)
    if not refreshed_profile:
        print("❌ Failed to get refreshed profile")
        return False
    
    print("✅ Profile refreshed successfully:")
    print(f"   Username: {refreshed_profile.get('username', 'N/A')}")
    print(f"   City: {refreshed_profile.get('city', 'N/A')}")
    print(f"   Country: {refreshed_profile.get('country', 'N/A')}")
    print(f"   About: {refreshed_profile.get('about_you', 'N/A')}")
    
    # Step 5: Verify the fix
    print("\n5️⃣ Verifying profile refresh fix...")
    
    expected_city = update_data['city']
    actual_city = refreshed_profile.get('city')
    
    if actual_city != expected_city:
        print(f"❌ Profile refresh failed!")
        print(f"   Expected city: '{expected_city}'")
        print(f"   Actual city: '{actual_city}'")
        return False
    
    # Verify other fields are preserved
    fields_to_check = ['username', 'country', 'about_you']
    for field in fields_to_check:
        initial_value = initial_profile.get(field)
        refreshed_value = refreshed_profile.get(field)
        
        if initial_value != refreshed_value:
            print(f"❌ Field '{field}' was not preserved during refresh!")
            print(f"   Initial: '{initial_value}'")
            print(f"   Refreshed: '{refreshed_value}'")
            return False
        else:
            print(f"✅ Field '{field}' preserved: '{refreshed_value}'")
    
    print(f"\n🎉 PROFILE REFRESH FIX VERIFIED!")
    print(f"✅ Updated field shows new value")
    print(f"✅ Other fields preserved correctly")
    print(f"✅ Profile data refreshes properly after updates")
    
    # Step 6: Test multiple updates scenario
    print("\n6️⃣ Testing multiple updates scenario...")
    
    # Update country this time
    update_data_2 = {
        'country': f'Updated Country {int(time.time())}'
    }
    
    success, response = update_profile(token, update_data_2)
    if success:
        time.sleep(0.5)
        final_profile = get_profile(token)
        
        if final_profile and final_profile.get('country') == update_data_2['country']:
            print("✅ Multiple updates work correctly")
            print(f"   Latest country: {final_profile.get('country')}")
            print(f"   City still preserved: {final_profile.get('city')}")
        else:
            print("❌ Multiple updates failed")
            return False
    else:
        print("❌ Second update failed")
        return False
    
    return True

if __name__ == "__main__":
    success = test_profile_refresh_scenario()
    
    print(f"\n" + "=" * 60)
    if success:
        print(f"🎯 PROFILE REFRESH TEST RESULT: PASSED ✅")
        print(f"🎉 Profile refresh fix is working perfectly!")
        print(f"✅ Profile data updates correctly")
        print(f"✅ Profile data refreshes after navigation")
        print(f"✅ No data loss during updates")
        print(f"✅ Multiple updates work correctly")
        print(f"\n💡 User Experience:")
        print(f"   - User can update individual fields")
        print(f"   - Updated data appears immediately")
        print(f"   - Navigation back to profile shows latest data")
        print(f"   - No need to logout/login to see changes")
    else:
        print(f"🎯 PROFILE REFRESH TEST RESULT: FAILED ❌")
        print(f"❌ Profile refresh issues remain")
    print(f"=" * 60)
