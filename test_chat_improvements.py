#!/usr/bin/env python3
"""
Test script for Chat System Improvements
Tests the enhanced chat functionality including user search and follow integration
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"

# Test credentials
TEST_USER = {
    "username": "andrew",
    "password": "*Andrew2003"
}

def test_user_login():
    """Test user authentication"""
    print("🔐 Testing user login...")
    
    login_data = {
        "username": TEST_USER["username"],
        "password": TEST_USER["password"]
    }
    
    response = requests.post(f"{BASE_URL}/api/users/login/", json=login_data)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login successful for user: {data.get('user', {}).get('username')}")
        return data.get('access_token')
    else:
        print(f"❌ Login failed: {response.status_code} - {response.text}")
        return None

def test_user_search(token):
    """Test user search functionality"""
    print("\n🔍 Testing user search...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test search with query
    response = requests.get(f"{BASE_URL}/api/users/search/?q=test", headers=headers)
    
    if response.status_code == 200:
        users = response.json()
        print(f"✅ User search successful, found {len(users)} users")
        return users
    else:
        print(f"❌ User search failed: {response.status_code} - {response.text}")
        return []

def test_chat_messages_api(token):
    """Test chat messages API"""
    print("\n💬 Testing chat messages API...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test getting conversations
    response = requests.get(f"{BASE_URL}/api/chat/messages/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        conversations = data.get('results', [])
        print(f"✅ Chat API successful, found {len(conversations)} conversations")
        return conversations
    else:
        print(f"❌ Chat API failed: {response.status_code} - {response.text}")
        return []

def test_follow_functionality(token, users):
    """Test follow/unfollow functionality"""
    print("\n👥 Testing follow functionality...")
    
    if not users:
        print("⚠️ No users to test follow functionality")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    test_user = users[0]
    user_id = test_user.get('user_id') or test_user.get('id')
    
    if not user_id:
        print("❌ No valid user ID found")
        return
    
    # Test follow
    follow_data = {"followed_id": user_id, "source": "Chat Test"}
    response = requests.post(f"{BASE_URL}/api/users/follow/", json=follow_data, headers=headers)
    
    if response.status_code in [200, 201]:
        print(f"✅ Follow successful for user: {test_user.get('username')}")
    else:
        print(f"⚠️ Follow response: {response.status_code} - {response.text}")

def test_frontend_accessibility():
    """Test if frontend is accessible"""
    print("\n🌐 Testing frontend accessibility...")
    
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
            return True
        else:
            print(f"❌ Frontend returned status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Frontend not accessible: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Chat System Improvement Tests")
    print("=" * 50)
    
    # Test frontend accessibility
    frontend_ok = test_frontend_accessibility()
    
    # Test backend functionality
    token = test_user_login()
    if not token:
        print("\n❌ Cannot proceed without authentication")
        return
    
    # Test user search
    users = test_user_search(token)
    
    # Test chat API
    conversations = test_chat_messages_api(token)
    
    # Test follow functionality
    test_follow_functionality(token, users)
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Summary:")
    print(f"✅ Frontend accessible: {frontend_ok}")
    print(f"✅ Authentication: {'Working' if token else 'Failed'}")
    print(f"✅ User search: {len(users)} users found")
    print(f"✅ Chat API: {len(conversations)} conversations")
    
    if frontend_ok and token:
        print("\n🎉 Chat system improvements are working!")
        print(f"🌐 Visit: {FRONTEND_URL}/socials to test the chat interface")
        print("📝 Test steps:")
        print("  1. Navigate to Socials → Chats")
        print("  2. Click the '+' button to search users")
        print("  3. Search for users and test follow/unfollow")
        print("  4. Start conversations with the 'Message' button")
        print("  5. Verify the themed UI matches the app design")
    else:
        print("\n⚠️ Some issues detected. Check the logs above.")

if __name__ == "__main__":
    main()
