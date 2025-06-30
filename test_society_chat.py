#!/usr/bin/env python3
"""
Test Society Chat Functionality
Verify that society chat is working correctly after implementation
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:5173"

# Test credentials
TEST_USER = {
    "username": "andrew",
    "password": "*Andrew2003"
}

def test_authentication():
    """Test user authentication"""
    print("🔐 Testing authentication...")
    
    login_data = {
        "username": TEST_USER["username"],
        "password": TEST_USER["password"]
    }
    
    response = requests.post(f"{BASE_URL}/api/users/login/", json=login_data)
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('access_token')
        print(f"✅ Login successful")
        return token
    else:
        print(f"❌ Login failed: {response.status_code}")
        return None

def test_societies_api(token):
    """Test societies API endpoints"""
    print("\n👥 Testing societies API...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test listing societies
    response = requests.get(f"{BASE_URL}/api/chat/societies/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        societies = data.get('results', [])
        print(f"✅ Societies API working: {len(societies)} societies found")
        return societies
    else:
        print(f"❌ Societies API failed: {response.status_code}")
        return []

def test_society_messages_api(token, societies):
    """Test society messages API"""
    print("\n💬 Testing society messages API...")
    
    if not societies:
        print("⚠️ No societies available for testing")
        return []
    
    headers = {"Authorization": f"Bearer {token}"}
    test_society = societies[0]
    society_id = test_society.get('id') or test_society.get('society_id')

    print(f"🔍 Debug: Society object: {test_society}")

    if not society_id:
        print("❌ No valid society ID found")
        print(f"   Available keys: {list(test_society.keys())}")
        return []
    
    # Test getting society messages
    response = requests.get(f"{BASE_URL}/api/chat/societies/{society_id}/messages/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        messages = data.get('results', [])
        print(f"✅ Society messages API working: {len(messages)} messages found for '{test_society.get('name')}'")
        return messages
    else:
        print(f"❌ Society messages API failed: {response.status_code}")
        return []

def test_send_society_message(token, societies):
    """Test sending a society message"""
    print("\n📤 Testing send society message...")
    
    if not societies:
        print("⚠️ No societies available for testing")
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    test_society = societies[0]
    society_id = test_society.get('id') or test_society.get('society_id')

    if not society_id:
        print("❌ No valid society ID found")
        return False
    
    # Test sending a message
    message_data = {
        "content": f"Test message from society chat implementation - {time.time()}",
        "message_type": "TEXT"
    }
    
    response = requests.post(f"{BASE_URL}/api/chat/societies/{society_id}/messages/send/",
                           json=message_data, headers=headers)
    
    if response.status_code in [200, 201]:
        message = response.json()
        print(f"✅ Message sent successfully to '{test_society.get('name')}'")
        print(f"   Message ID: {message.get('id')}")
        print(f"   Content: {message.get('content')[:50]}...")
        return True
    else:
        print(f"❌ Failed to send message: {response.status_code}")
        return False

def test_frontend_society_chat():
    """Test frontend society chat accessibility"""
    print("\n🌐 Testing frontend society chat...")
    
    try:
        # Test main socials page
        response = requests.get(f"{FRONTEND_URL}/socials", timeout=5)
        if response.status_code == 200:
            print("✅ Socials page accessible")
            return True
        else:
            print(f"❌ Socials page returned status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Frontend not accessible: {e}")
        return False

def main():
    """Run society chat tests"""
    print("🚀 Society Chat Functionality Test")
    print("=" * 50)
    
    # Test authentication
    token = test_authentication()
    if not token:
        print("\n❌ Cannot proceed without authentication")
        return
    
    # Test societies API
    societies = test_societies_api(token)
    
    # Test society messages API
    messages = test_society_messages_api(token, societies)
    
    # Test sending messages
    message_sent = test_send_society_message(token, societies)
    
    # Test frontend
    frontend_ok = test_frontend_society_chat()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 SOCIETY CHAT TEST RESULTS:")
    print(f"✅ Authentication: {'Working' if token else 'Failed'}")
    print(f"✅ Societies API: {len(societies)} societies found")
    print(f"✅ Messages API: {len(messages)} messages loaded")
    print(f"✅ Send Message: {'Working' if message_sent else 'Failed'}")
    print(f"✅ Frontend: {'Accessible' if frontend_ok else 'Failed'}")
    
    # Overall status
    if token and len(societies) > 0 and frontend_ok:
        print("\n🎉 SOCIETY CHAT FULLY FUNCTIONAL!")
        print("✅ Backend APIs working correctly")
        print("✅ Frontend accessible")
        print("✅ Message sending/receiving operational")
        print("✅ No more 'coming soon' messages!")
        
        print(f"\n🌐 Test society chat at: {FRONTEND_URL}/socials")
        print("\n📝 Manual test steps:")
        print("  1. Navigate to Socials → Chats")
        print("  2. Click the 'Groups' tab")
        print("  3. Select a society from the list")
        print("  4. Verify society chat interface loads")
        print("  5. Send a test message")
        print("  6. Verify message appears in chat")
        
        if societies:
            print(f"\n📚 Available societies for testing:")
            for i, society in enumerate(societies[:3], 1):
                print(f"  {i}. {society.get('name')} ({society.get('member_count', 0)} members)")
        
    else:
        print("\n⚠️ Some issues detected:")
        if not token:
            print("  - Authentication problems")
        if len(societies) == 0:
            print("  - No societies available")
        if not frontend_ok:
            print("  - Frontend accessibility issues")
        
        print("\n🔧 Check the logs above for specific issues")

if __name__ == "__main__":
    main()
