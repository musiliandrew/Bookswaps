#!/usr/bin/env python3
"""
Reset Profile Data - Fix test data showing instead of real data
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_USERNAME = "andrew"
TEST_PASSWORD = "*Andrew2003"

def reset_profile_data():
    """Reset profile data to real values"""
    print("🔧 RESETTING PROFILE DATA TO REAL VALUES")
    print("=" * 50)
    
    # Login
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
    
    # Get current profile
    print("\n2️⃣ Getting current profile...")
    profile_response = requests.get(f"{BASE_URL}/users/me/profile/", headers=headers)
    
    if profile_response.status_code != 200:
        print(f"❌ Failed to get profile: {profile_response.status_code}")
        return False
        
    current_profile = profile_response.json()
    print(f"✅ Current profile retrieved")
    print(f"   Username: {current_profile.get('username', 'N/A')}")
    print(f"   City: {current_profile.get('city', 'N/A')}")
    print(f"   Country: {current_profile.get('country', 'N/A')}")
    print(f"   About: {current_profile.get('about_you', 'N/A')}")
    
    # Reset to real data
    print("\n3️⃣ Resetting to real data...")
    
    real_data = {
        'city': 'Nairobi',
        'country': 'Kenya',
        'about_you': 'Smart, Nerd'
    }
    
    print(f"   Setting real data: {real_data}")
    
    update_response = requests.patch(f"{BASE_URL}/users/me/profile/", data=real_data, headers=headers)
    
    if update_response.status_code != 200:
        print(f"❌ Profile reset failed: {update_response.status_code}")
        print(f"   Response: {update_response.text}")
        return False
        
    print(f"✅ Profile reset successful")
    
    # Verify reset
    print("\n4️⃣ Verifying reset...")
    
    verify_response = requests.get(f"{BASE_URL}/users/me/profile/", headers=headers)
    
    if verify_response.status_code != 200:
        print(f"❌ Failed to verify reset: {verify_response.status_code}")
        return False
        
    updated_profile = verify_response.json()
    print(f"✅ Reset verified:")
    print(f"   Username: {updated_profile.get('username', 'N/A')}")
    print(f"   City: {updated_profile.get('city', 'N/A')}")
    print(f"   Country: {updated_profile.get('country', 'N/A')}")
    print(f"   About: {updated_profile.get('about_you', 'N/A')}")
    
    # Check if reset was successful
    if (updated_profile.get('city') == 'Nairobi' and 
        updated_profile.get('country') == 'Kenya' and 
        updated_profile.get('about_you') == 'Smart, Nerd'):
        print(f"\n🎉 PROFILE DATA RESET SUCCESSFUL!")
        print(f"✅ Real data restored")
        return True
    else:
        print(f"\n❌ PROFILE DATA RESET FAILED!")
        print(f"❌ Data not properly reset")
        return False

if __name__ == "__main__":
    success = reset_profile_data()
    
    if success:
        print(f"\n🎯 RESET RESULT: SUCCESS ✅")
        print(f"Profile now shows real data instead of test data")
    else:
        print(f"\n🎯 RESET RESULT: FAILED ❌")
        print(f"Profile still shows test data")
