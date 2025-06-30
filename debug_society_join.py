#!/usr/bin/env python3
"""
Debug Society Join 403 Error
Investigate why joining a society returns 403 Forbidden
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"

# Test credentials
TEST_USER = {
    "username": "andrew",
    "password": "*Andrew2003"
}

def get_auth_token():
    """Get authentication token"""
    print("🔐 Getting authentication token...")
    
    login_data = {
        "username": TEST_USER["username"],
        "password": TEST_USER["password"]
    }
    
    response = requests.post(f"{BASE_URL}/api/users/login/", json=login_data)
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('access_token')
        print(f"✅ Authentication successful")
        return token
    else:
        print(f"❌ Authentication failed: {response.status_code}")
        return None

def debug_society_details(token, society_id):
    """Get detailed information about the society"""
    print(f"\n🔍 Debugging society: {society_id}")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get society details
    response = requests.get(f"{BASE_URL}/api/chat/societies/", headers=headers)
    
    if response.status_code == 200:
        societies = response.json().get('results', [])
        target_society = None
        
        for society in societies:
            if society.get('society_id') == society_id:
                target_society = society
                break
        
        if target_society:
            print(f"📚 Society Found: {target_society.get('name')}")
            print(f"   - ID: {target_society.get('society_id')}")
            print(f"   - Visibility: {target_society.get('visibility')}")
            print(f"   - Creator: {target_society.get('creator', {}).get('username')}")
            print(f"   - Member Count: {target_society.get('member_count')}")
            print(f"   - Is Member: {target_society.get('is_member')}")
            print(f"   - Description: {target_society.get('description', 'No description')[:100]}...")
            
            return target_society
        else:
            print(f"❌ Society with ID {society_id} not found")
            return None
    else:
        print(f"❌ Failed to get societies: {response.status_code}")
        return None

def test_join_society(token, society_id):
    """Test joining the society and capture the exact error"""
    print(f"\n🚀 Attempting to join society: {society_id}")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.post(f"{BASE_URL}/api/chat/societies/{society_id}/join/", headers=headers)
    
    print(f"📊 Response Status: {response.status_code}")
    print(f"📊 Response Headers: {dict(response.headers)}")
    
    try:
        response_data = response.json()
        print(f"📊 Response Data: {json.dumps(response_data, indent=2)}")
    except:
        print(f"📊 Response Text: {response.text}")
    
    if response.status_code == 403:
        print("\n❌ 403 FORBIDDEN ERROR ANALYSIS:")
        print("   Possible causes:")
        print("   1. Society is private and you don't have permission")
        print("   2. You are already a member of this society")
        print("   3. Authentication token is invalid or expired")
        print("   4. User permissions are insufficient")
        
    elif response.status_code == 400:
        print("\n⚠️ 400 BAD REQUEST ERROR:")
        print("   Likely already a member")
        
    elif response.status_code == 200:
        print("\n✅ SUCCESS: Successfully joined society!")
        
    return response.status_code

def test_society_membership(token, society_id):
    """Check if user is already a member"""
    print(f"\n👥 Checking membership status...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Try to get society members
    response = requests.get(f"{BASE_URL}/api/chat/societies/{society_id}/members/", headers=headers)
    
    if response.status_code == 200:
        members = response.json().get('results', [])
        print(f"📊 Society has {len(members)} members")
        
        current_user_member = False
        for member in members:
            if member.get('user', {}).get('username') == TEST_USER['username']:
                current_user_member = True
                print(f"✅ You are already a member with role: {member.get('role')}")
                break
        
        if not current_user_member:
            print("❌ You are not currently a member")
            
        return current_user_member
    else:
        print(f"❌ Failed to get members: {response.status_code}")
        return None

def list_public_societies(token):
    """List all public societies that can be joined"""
    print("\n📚 Finding public societies you can join...")

    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/chat/societies/", headers=headers)

    if response.status_code == 200:
        societies = response.json().get('results', [])
        public_societies = []

        for society in societies:
            if society.get('visibility') == 'public' and not society.get('is_member'):
                public_societies.append(society)
                print(f"✅ {society.get('name')}")
                print(f"   - ID: {society.get('society_id')}")
                print(f"   - Members: {society.get('member_count')}")
                print(f"   - Creator: {society.get('creator', {}).get('username')}")
                print(f"   - Description: {society.get('description', 'No description')[:100]}...")
                print()

        if not public_societies:
            print("❌ No public societies available to join")

        return public_societies
    else:
        print(f"❌ Failed to get societies: {response.status_code}")
        return []

def main():
    """Debug the society join issue"""
    print("🔍 Society Join Debug Tool")
    print("=" * 50)

    # The society ID from the error
    society_id = "cefcc493-a5f4-425b-94f6-98fa6cc8d956"
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("❌ Cannot proceed without authentication")
        return
    
    # Debug society details
    society = debug_society_details(token, society_id)
    
    # Check membership status
    is_member = test_society_membership(token, society_id)
    
    # Test joining the society
    status_code = test_join_society(token, society_id)

    # List public societies as alternatives
    public_societies = list_public_societies(token)

    # Summary and recommendations
    print("\n" + "=" * 50)
    print("📋 SUMMARY & RECOMMENDATIONS:")
    
    if society:
        if society.get('visibility') == 'private':
            print("🔒 ISSUE: Society is PRIVATE")
            print("   - Private societies require invitation to join")
            print("   - Contact the society creator or admin for access")
            
        elif is_member:
            print("👥 ISSUE: Already a member")
            print("   - You are already a member of this society")
            print("   - No need to join again")
            
        elif status_code == 403:
            print("🚫 ISSUE: Permission denied")
            print("   - Check if you have proper authentication")
            print("   - Verify your account status")
            print("   - Contact support if issue persists")
            
        else:
            print("✅ Society join should work")
            print("   - Try again or check for temporary issues")

    if public_societies:
        print(f"\n🎯 RECOMMENDATION: Try joining a public society instead!")
        print(f"   Found {len(public_societies)} public societies you can join")

    print(f"\n🌐 Society ID: {society_id}")
    print(f"🔗 Join URL: {BASE_URL}/api/chat/societies/{society_id}/join/")

if __name__ == "__main__":
    main()
