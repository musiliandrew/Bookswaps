#!/usr/bin/env python3
"""
Test Profile Update Fix - Verify that updating single fields doesn't clear other fields
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_USERNAME = "andrew"
TEST_PASSWORD = "*Andrew2003"

def test_profile_update_fix():
    """Test that updating only one field doesn't clear other fields"""
    print("🧪 TESTING PROFILE UPDATE FIX")
    print("=" * 60)
    
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
    
    # Step 2: Get current profile
    print("\n2️⃣ Getting current profile...")
    profile_response = requests.get(f"{BASE_URL}/users/me/profile/", headers=headers)
    
    if profile_response.status_code != 200:
        print(f"❌ Failed to get profile: {profile_response.status_code}")
        return False
        
    original_profile = profile_response.json()
    print(f"✅ Current profile retrieved")
    print(f"   Username: {original_profile.get('username', 'N/A')}")
    print(f"   City: {original_profile.get('city', 'N/A')}")
    print(f"   Country: {original_profile.get('country', 'N/A')}")
    print(f"   About: {original_profile.get('about_you', 'N/A')}")
    
    # Step 3: Update only country field
    print("\n3️⃣ Updating only country field...")
    
    # Create FormData with only the country field
    update_data = {
        'country': 'Updated Test Country'
    }
    
    # Convert to FormData format
    form_data = {}
    for key, value in update_data.items():
        if value is not None and value != '':
            form_data[key] = value
    
    print(f"   Sending update data: {form_data}")
    
    update_response = requests.patch(
        f"{BASE_URL}/users/me/profile/", 
        data=form_data,  # Send as form data, not JSON
        headers=headers
    )
    
    if update_response.status_code != 200:
        print(f"❌ Profile update failed: {update_response.status_code}")
        print(f"   Response: {update_response.text}")
        return False
        
    print(f"✅ Profile update successful")
    
    # Step 4: Get updated profile and verify
    print("\n4️⃣ Verifying update...")
    time.sleep(1)  # Give a moment for the update to process
    
    updated_response = requests.get(f"{BASE_URL}/users/me/profile/", headers=headers)
    
    if updated_response.status_code != 200:
        print(f"❌ Failed to get updated profile: {updated_response.status_code}")
        return False
        
    updated_profile = updated_response.json()
    print(f"✅ Updated profile retrieved")
    print(f"   Username: {updated_profile.get('username', 'N/A')}")
    print(f"   City: {updated_profile.get('city', 'N/A')}")
    print(f"   Country: {updated_profile.get('country', 'N/A')}")
    print(f"   About: {updated_profile.get('about_you', 'N/A')}")
    
    # Step 5: Verify the fix
    print("\n5️⃣ Verifying fix...")
    
    # Check that country was updated
    if updated_profile.get('country') != 'Updated Test Country':
        print(f"❌ Country was not updated correctly")
        print(f"   Expected: 'Updated Test Country'")
        print(f"   Got: '{updated_profile.get('country')}'")
        return False
    
    # Check that other fields were preserved
    fields_to_check = ['username', 'city', 'about_you']
    for field in fields_to_check:
        original_value = original_profile.get(field)
        updated_value = updated_profile.get(field)
        
        if original_value != updated_value:
            print(f"❌ Field '{field}' was not preserved!")
            print(f"   Original: '{original_value}'")
            print(f"   Updated: '{updated_value}'")
            return False
        else:
            print(f"✅ Field '{field}' preserved: '{updated_value}'")
    
    print(f"\n🎉 PROFILE UPDATE FIX VERIFIED!")
    print(f"✅ Country field updated successfully")
    print(f"✅ All other fields preserved")
    print(f"✅ No data loss occurred")
    
    return True

if __name__ == "__main__":
    success = test_profile_update_fix()
    if success:
        print(f"\n🎯 TEST RESULT: PASSED ✅")
        print(f"The profile update fix is working correctly!")
    else:
        print(f"\n🎯 TEST RESULT: FAILED ❌")
        print(f"The profile update fix needs more work.")
