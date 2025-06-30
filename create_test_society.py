#!/usr/bin/env python3
"""
Create a Public Test Society
Create a public society that users can join to test the society chat functionality
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

def create_public_society(token):
    """Create a public society for testing"""
    print("\n📚 Creating a public test society...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    society_data = {
        "name": "BookSwaps Test Society",
        "description": "<p>A public society for testing the BookSwaps chat functionality. All book lovers welcome!</p>",
        "visibility": "public",
        "focus_type": "Book",
        "icon_url": "https://example.com/bookswaps-test.jpg"
    }
    
    response = requests.post(f"{BASE_URL}/api/chat/societies/create/", 
                           json=society_data, headers=headers)
    
    print(f"📊 Response Status: {response.status_code}")
    
    if response.status_code == 201:
        society = response.json()
        print(f"✅ Society created successfully!")
        print(f"   - Name: {society.get('name')}")
        print(f"   - ID: {society.get('society_id')}")
        print(f"   - Visibility: {society.get('visibility')}")
        print(f"   - Creator: {society.get('creator', {}).get('username')}")
        return society
    else:
        try:
            error_data = response.json()
            print(f"❌ Failed to create society: {json.dumps(error_data, indent=2)}")
        except:
            print(f"❌ Failed to create society: {response.text}")
        return None

def test_join_created_society(token, society_id):
    """Test joining the newly created society"""
    print(f"\n🚀 Testing join functionality with new society...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # First, leave the society (since creator is automatically a member)
    print("   Leaving society first (creator auto-joins)...")
    leave_response = requests.post(f"{BASE_URL}/api/chat/societies/{society_id}/leave/", headers=headers)
    print(f"   Leave status: {leave_response.status_code}")
    
    # Now try to join
    print("   Attempting to join...")
    join_response = requests.post(f"{BASE_URL}/api/chat/societies/{society_id}/join/", headers=headers)
    
    print(f"📊 Join Response Status: {join_response.status_code}")
    
    if join_response.status_code == 200:
        print("✅ Successfully joined the society!")
        return True
    else:
        try:
            error_data = join_response.json()
            print(f"❌ Failed to join: {json.dumps(error_data, indent=2)}")
        except:
            print(f"❌ Failed to join: {join_response.text}")
        return False

def send_test_message(token, society_id):
    """Send a test message to the society"""
    print(f"\n💬 Sending test message to society...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    message_data = {
        "content": "Hello everyone! This is a test message for the BookSwaps society chat functionality. 📚✨",
        "message_type": "TEXT"
    }
    
    response = requests.post(f"{BASE_URL}/api/chat/societies/{society_id}/messages/send/", 
                           json=message_data, headers=headers)
    
    print(f"📊 Message Response Status: {response.status_code}")
    
    if response.status_code == 201:
        message = response.json()
        print("✅ Test message sent successfully!")
        print(f"   - Content: {message.get('content')[:50]}...")
        print(f"   - Message ID: {message.get('id')}")
        return True
    else:
        try:
            error_data = response.json()
            print(f"❌ Failed to send message: {json.dumps(error_data, indent=2)}")
        except:
            print(f"❌ Failed to send message: {response.text}")
        return False

def main():
    """Create and test a public society"""
    print("🚀 Public Society Creator & Tester")
    print("=" * 50)
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("❌ Cannot proceed without authentication")
        return
    
    # Create a public society
    society = create_public_society(token)
    if not society:
        print("❌ Cannot proceed without creating a society")
        return
    
    society_id = society.get('society_id')
    
    # Test joining the society
    join_success = test_join_created_society(token, society_id)
    
    # Test sending a message
    if join_success:
        message_success = send_test_message(token, society_id)
    else:
        message_success = False
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 SUMMARY:")
    print(f"✅ Society Created: {society.get('name')}")
    print(f"✅ Society ID: {society_id}")
    print(f"✅ Join Test: {'Success' if join_success else 'Failed'}")
    print(f"✅ Message Test: {'Success' if message_success else 'Failed'}")
    
    if join_success and message_success:
        print("\n🎉 SUCCESS: Public society chat is fully functional!")
        print(f"🌐 Test the society at: http://localhost:5173/socials")
        print("📝 Steps to test in frontend:")
        print("  1. Go to Socials → Chats → Groups")
        print("  2. Look for 'BookSwaps Test Society'")
        print("  3. Click to open the society chat")
        print("  4. Send messages and test the interface")
    else:
        print("\n⚠️ Some issues detected. Check the logs above.")

if __name__ == "__main__":
    main()
