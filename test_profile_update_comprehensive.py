#!/usr/bin/env python3
"""
Comprehensive Profile Update Test - Test multiple field updates
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

def test_single_field_updates():
    """Test updating individual fields"""
    print("🧪 COMPREHENSIVE PROFILE UPDATE TESTING")
    print("=" * 60)
    
    # Login
    print("\n🔐 Logging in...")
    token = login()
    if not token:
        print("❌ Login failed")
        return False
    print("✅ Login successful")
    
    # Get initial profile
    print("\n📋 Getting initial profile...")
    initial_profile = get_profile(token)
    if not initial_profile:
        print("❌ Failed to get profile")
        return False
    
    print("✅ Initial profile retrieved:")
    print(f"   Username: {initial_profile.get('username', 'N/A')}")
    print(f"   City: {initial_profile.get('city', 'N/A')}")
    print(f"   Country: {initial_profile.get('country', 'N/A')}")
    print(f"   About: {initial_profile.get('about_you', 'N/A')}")
    
    # Test cases: Update one field at a time
    test_cases = [
        {
            'name': 'City Update',
            'field': 'city',
            'value': 'Test City Updated',
            'preserve_fields': ['username', 'country', 'about_you']
        },
        {
            'name': 'About Update',
            'field': 'about_you',
            'value': 'Updated bio text for testing',
            'preserve_fields': ['username', 'city', 'country']
        },
        {
            'name': 'Country Revert',
            'field': 'country',
            'value': 'Kenya',  # Revert back to original
            'preserve_fields': ['username', 'city', 'about_you']
        }
    ]
    
    all_passed = True
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}️⃣ Testing {test_case['name']}...")
        
        # Get current state before update
        before_profile = get_profile(token)
        if not before_profile:
            print(f"❌ Failed to get profile before {test_case['name']}")
            all_passed = False
            continue
        
        # Update single field
        update_data = {test_case['field']: test_case['value']}
        print(f"   Updating: {update_data}")
        
        success, response = update_profile(token, update_data)
        if not success:
            print(f"❌ {test_case['name']} failed: {response.status_code}")
            print(f"   Response: {response.text}")
            all_passed = False
            continue
        
        # Verify update
        time.sleep(0.5)  # Brief pause
        after_profile = get_profile(token)
        if not after_profile:
            print(f"❌ Failed to get profile after {test_case['name']}")
            all_passed = False
            continue
        
        # Check that target field was updated
        if after_profile.get(test_case['field']) != test_case['value']:
            print(f"❌ {test_case['field']} was not updated correctly")
            print(f"   Expected: '{test_case['value']}'")
            print(f"   Got: '{after_profile.get(test_case['field'])}'")
            all_passed = False
            continue
        
        # Check that other fields were preserved
        fields_preserved = True
        for preserve_field in test_case['preserve_fields']:
            before_value = before_profile.get(preserve_field)
            after_value = after_profile.get(preserve_field)
            
            if before_value != after_value:
                print(f"❌ Field '{preserve_field}' was not preserved!")
                print(f"   Before: '{before_value}'")
                print(f"   After: '{after_value}'")
                fields_preserved = False
                all_passed = False
        
        if fields_preserved:
            print(f"✅ {test_case['name']} successful - all other fields preserved")
        
        # Show current state
        print(f"   Current state:")
        print(f"     Username: {after_profile.get('username', 'N/A')}")
        print(f"     City: {after_profile.get('city', 'N/A')}")
        print(f"     Country: {after_profile.get('country', 'N/A')}")
        print(f"     About: {after_profile.get('about_you', 'N/A')}")
    
    # Final verification
    print(f"\n🔍 Final Verification...")
    final_profile = get_profile(token)
    if final_profile:
        print(f"✅ Final profile state:")
        print(f"   Username: {final_profile.get('username', 'N/A')}")
        print(f"   City: {final_profile.get('city', 'N/A')}")
        print(f"   Country: {final_profile.get('country', 'N/A')}")
        print(f"   About: {final_profile.get('about_you', 'N/A')}")
    
    return all_passed

if __name__ == "__main__":
    success = test_single_field_updates()
    
    print(f"\n" + "=" * 60)
    if success:
        print(f"🎯 COMPREHENSIVE TEST RESULT: PASSED ✅")
        print(f"🎉 Profile update fix is working perfectly!")
        print(f"✅ Individual field updates work correctly")
        print(f"✅ No data loss occurs during updates")
        print(f"✅ All fields are properly preserved")
    else:
        print(f"🎯 COMPREHENSIVE TEST RESULT: FAILED ❌")
        print(f"❌ Some profile update issues remain")
    print(f"=" * 60)
