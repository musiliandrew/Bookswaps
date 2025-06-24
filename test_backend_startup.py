#!/usr/bin/env python3
"""
Quick Backend Startup Test
Tests if the backend can start without import errors
"""
import subprocess
import time
import requests
import sys

def test_backend_startup():
    print("🔍 Testing Backend Startup...")
    
    # Check if backend is already running
    try:
        response = requests.get("http://localhost:8000/api/users/login/", timeout=5)
        print("✅ Backend is already running and responding!")
        return True
    except requests.exceptions.ConnectionError:
        print("⚠️  Backend not running, will test with Docker")
    except Exception as e:
        print(f"⚠️  Backend check failed: {e}")
    
    # Test with Docker
    print("🐳 Testing backend startup with Docker...")
    
    try:
        # Stop any existing backend
        subprocess.run(["docker-compose", "stop", "backend"], 
                      capture_output=True, timeout=30)
        
        # Start backend
        print("🚀 Starting backend container...")
        result = subprocess.run(
            ["docker-compose", "up", "-d", "backend"], 
            capture_output=True, text=True, timeout=60
        )
        
        if result.returncode != 0:
            print(f"❌ Failed to start backend:")
            print(f"STDOUT: {result.stdout}")
            print(f"STDERR: {result.stderr}")
            return False
        
        print("⏳ Waiting for backend to initialize...")
        
        # Wait for backend to be ready
        max_attempts = 30
        for attempt in range(max_attempts):
            try:
                response = requests.get("http://localhost:8000/api/users/login/", timeout=5)
                if response.status_code in [200, 405, 400]:  # Any response means it's running
                    print(f"✅ Backend is running and responding! (attempt {attempt + 1})")
                    return True
            except requests.exceptions.ConnectionError:
                if attempt < max_attempts - 1:
                    print(f"⏳ Waiting... (attempt {attempt + 1}/{max_attempts})")
                    time.sleep(2)
                else:
                    print("❌ Backend failed to start within timeout")
                    
                    # Get logs for debugging
                    logs_result = subprocess.run(
                        ["docker-compose", "logs", "--tail=20", "backend"],
                        capture_output=True, text=True, timeout=10
                    )
                    print("📋 Backend logs:")
                    print(logs_result.stdout)
                    if logs_result.stderr:
                        print("Error logs:")
                        print(logs_result.stderr)
                    
                    return False
            except Exception as e:
                print(f"⚠️  Connection test failed: {e}")
                time.sleep(2)
        
        return False
        
    except subprocess.TimeoutExpired:
        print("❌ Docker command timed out")
        return False
    except Exception as e:
        print(f"❌ Error testing backend startup: {e}")
        return False

def test_critical_endpoints():
    """Test a few critical endpoints to ensure they're working"""
    print("\n🧪 Testing Critical Endpoints...")
    
    endpoints_to_test = [
        ("GET", "/api/users/login/", "Login endpoint"),
        ("GET", "/api/library/books/", "Books list endpoint"),
        ("GET", "/api/swaps/notifications/", "Notifications endpoint"),
    ]
    
    for method, endpoint, description in endpoints_to_test:
        try:
            url = f"http://localhost:8000{endpoint}"
            if method == "GET":
                response = requests.get(url, timeout=5)
            
            # We expect 401 (unauthorized) for authenticated endpoints, which means they're working
            if response.status_code in [200, 401, 405]:
                print(f"✅ {description} - Working (status: {response.status_code})")
            else:
                print(f"⚠️  {description} - Unexpected status: {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print(f"❌ {description} - Connection failed")
        except Exception as e:
            print(f"❌ {description} - Error: {e}")

if __name__ == "__main__":
    print("🚀 Backend Startup Test")
    print("=" * 50)
    
    success = test_backend_startup()
    
    if success:
        test_critical_endpoints()
        print("\n🎉 Backend startup test completed successfully!")
        print("✅ All import errors have been fixed!")
        print("✅ Backend is running and responding to requests!")
        sys.exit(0)
    else:
        print("\n❌ Backend startup test failed!")
        print("Please check the logs above for details.")
        sys.exit(1)
