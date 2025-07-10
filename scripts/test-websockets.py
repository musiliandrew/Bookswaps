#!/usr/bin/env python3

"""
WebSocket Connection Test Script
Tests WebSocket connectivity for BookSwaps application
"""

import asyncio
import websockets
import json
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

async def test_websocket_connection(url, token=None):
    """Test WebSocket connection to a given URL"""
    print(f"🔌 Testing WebSocket connection to: {url}")
    
    try:
        # Add token to URL if provided
        if token:
            separator = '&' if '?' in url else '?'
            url = f"{url}{separator}token={token}"
        
        async with websockets.connect(url) as websocket:
            print("✅ WebSocket connection established!")
            
            # Send a test message
            test_message = {
                "type": "ping",
                "message": "Hello from test script"
            }
            
            await websocket.send(json.dumps(test_message))
            print("📤 Test message sent")
            
            # Wait for response (with timeout)
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                print(f"📥 Received response: {response}")
                return True
            except asyncio.TimeoutError:
                print("⏰ No response received within 5 seconds")
                return True  # Connection was established, just no response
                
    except websockets.exceptions.ConnectionClosed as e:
        print(f"❌ WebSocket connection closed: {e}")
        return False
    except websockets.exceptions.InvalidURI as e:
        print(f"❌ Invalid WebSocket URI: {e}")
        return False
    except Exception as e:
        print(f"❌ WebSocket connection failed: {e}")
        return False

async def test_redis_connection():
    """Test Redis connection for channel layers"""
    print("🔴 Testing Redis connection...")
    
    try:
        import redis
        
        # Test Redis connection
        redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
        r = redis.from_url(redis_url)
        
        # Test basic operations
        r.ping()
        print("✅ Redis connection successful!")
        
        # Test pub/sub (used by Django Channels)
        pubsub = r.pubsub()
        pubsub.subscribe('test_channel')
        r.publish('test_channel', 'test_message')
        
        print("✅ Redis pub/sub working!")
        pubsub.close()
        return True
        
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        return False

def get_test_token():
    """Get a test JWT token for authentication"""
    print("🔑 Generating test token...")
    
    try:
        # This would normally come from your authentication system
        # For testing, we'll create a simple token
        import jwt
        import datetime
        
        payload = {
            'user_id': 'test-user',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }
        
        # Use a test secret (in production, use your actual secret)
        token = jwt.encode(payload, 'test-secret', algorithm='HS256')
        print("✅ Test token generated")
        return token
        
    except Exception as e:
        print(f"⚠️  Could not generate test token: {e}")
        return None

async def main():
    """Main test function"""
    print("🚀 BookSwaps WebSocket & MinIO Test Suite")
    print("=" * 50)
    
    # Test Redis first (required for WebSockets)
    redis_ok = await test_redis_connection()
    
    if not redis_ok:
        print("❌ Redis test failed - WebSockets will not work")
        return
    
    # Get test token
    token = get_test_token()
    
    # Test WebSocket endpoints
    base_urls = [
        "ws://localhost:8000",  # Local development
        "wss://bookswaps.co.ke",  # Production
    ]
    
    endpoints = [
        "/ws/notifications/",
        "/ws/chat/test-chat-id/",
        "/ws/society/test-society-id/",
        "/ws/discussions/test-discussion-id/",
    ]
    
    print("\n🔌 Testing WebSocket Endpoints:")
    print("-" * 30)
    
    for base_url in base_urls:
        print(f"\n🌐 Testing base URL: {base_url}")
        
        for endpoint in endpoints:
            url = f"{base_url}{endpoint}"
            success = await test_websocket_connection(url, token)
            
            if success:
                print(f"  ✅ {endpoint}")
            else:
                print(f"  ❌ {endpoint}")
    
    # Test MinIO connectivity
    print("\n🗄️  Testing MinIO Connection:")
    print("-" * 30)
    
    try:
        import boto3
        from botocore.exceptions import ClientError
        
        # MinIO configuration
        minio_config = {
            'endpoint_url': os.getenv('MINIO_ENDPOINT_URL', 'http://localhost:9000'),
            'aws_access_key_id': os.getenv('MINIO_ACCESS_KEY', 'minioadmin'),
            'aws_secret_access_key': os.getenv('MINIO_SECRET_KEY', 'minioadmin'),
            'region_name': os.getenv('MINIO_REGION', 'us-east-1'),
        }
        
        print(f"🔧 MinIO Endpoint: {minio_config['endpoint_url']}")
        
        # Create S3 client
        s3_client = boto3.client('s3', **minio_config)
        
        # Test connection by listing buckets
        response = s3_client.list_buckets()
        print("✅ MinIO connection successful!")
        
        # List buckets
        buckets = [bucket['Name'] for bucket in response['Buckets']]
        print(f"📦 Available buckets: {buckets}")
        
        # Test bucket access
        bucket_name = os.getenv('MINIO_BUCKET_NAME', 'bookswaps')
        if bucket_name in buckets:
            print(f"✅ Target bucket '{bucket_name}' exists")
        else:
            print(f"⚠️  Target bucket '{bucket_name}' not found")
        
    except Exception as e:
        print(f"❌ MinIO connection failed: {e}")
    
    print("\n🎉 Test suite completed!")

if __name__ == "__main__":
    # Load environment variables
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        print("⚠️  python-dotenv not available, using system environment")
    
    # Run the test suite
    asyncio.run(main())
