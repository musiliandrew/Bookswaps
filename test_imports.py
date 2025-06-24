#!/usr/bin/env python3
"""
Simple Import Test for Backend
Tests if all backend modules can be imported without errors
"""
import subprocess
import sys

def test_django_check():
    """Test Django system check using docker-compose"""
    print("🔍 Testing Django System Check...")
    
    try:
        # Run Django system check
        result = subprocess.run([
            "docker-compose", "exec", "-T", "backend", 
            "python", "manage.py", "check", "--deploy"
        ], capture_output=True, text=True, timeout=60)
        
        print("📋 Django Check Output:")
        print(result.stdout)
        
        if result.stderr:
            print("⚠️  Django Check Errors:")
            print(result.stderr)
        
        if result.returncode == 0:
            print("✅ Django system check passed!")
            return True
        else:
            print(f"❌ Django system check failed with return code: {result.returncode}")
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Django check timed out")
        return False
    except Exception as e:
        print(f"❌ Error running Django check: {e}")
        return False

def test_import_views():
    """Test importing all views modules"""
    print("\n🔍 Testing View Imports...")
    
    apps_to_test = ['users', 'library', 'swaps', 'discussions', 'chat']
    
    for app in apps_to_test:
        try:
            result = subprocess.run([
                "docker-compose", "exec", "-T", "backend",
                "python", "-c", f"from backend.{app}.views import *; print('✅ {app}.views imported successfully')"
            ], capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                print(f"✅ {app}.views - Import successful")
            else:
                print(f"❌ {app}.views - Import failed:")
                print(f"STDOUT: {result.stdout}")
                print(f"STDERR: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Error testing {app}.views: {e}")
            return False
    
    return True

def test_url_patterns():
    """Test URL pattern loading"""
    print("\n🔍 Testing URL Pattern Loading...")
    
    try:
        result = subprocess.run([
            "docker-compose", "exec", "-T", "backend",
            "python", "-c", 
            "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings'); "
            "import django; django.setup(); "
            "from django.urls import get_resolver; "
            "resolver = get_resolver(); "
            "print(f'✅ URL patterns loaded: {len(resolver.url_patterns)} patterns')"
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ URL patterns loaded successfully")
            print(result.stdout.strip())
            return True
        else:
            print("❌ URL pattern loading failed:")
            print(f"STDOUT: {result.stdout}")
            print(f"STDERR: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing URL patterns: {e}")
        return False

def main():
    print("🧪 Backend Import Test")
    print("=" * 50)
    
    # Check if backend container is running
    try:
        result = subprocess.run([
            "docker-compose", "ps", "backend"
        ], capture_output=True, text=True, timeout=10)
        
        if "Up" not in result.stdout:
            print("⚠️  Backend container not running. Starting it...")
            subprocess.run([
                "docker-compose", "up", "-d", "backend"
            ], timeout=60)
            print("⏳ Waiting for backend to start...")
            import time
            time.sleep(10)
        else:
            print("✅ Backend container is running")
            
    except Exception as e:
        print(f"⚠️  Could not check backend status: {e}")
    
    # Run tests
    tests = [
        ("Django System Check", test_django_check),
        ("View Imports", test_import_views),
        ("URL Patterns", test_url_patterns),
    ]
    
    all_passed = True
    
    for test_name, test_func in tests:
        print(f"\n🧪 Running {test_name}...")
        try:
            if not test_func():
                all_passed = False
                print(f"❌ {test_name} failed")
            else:
                print(f"✅ {test_name} passed")
        except Exception as e:
            print(f"❌ {test_name} error: {e}")
            all_passed = False
    
    print("\n" + "=" * 50)
    if all_passed:
        print("🎉 All import tests passed!")
        print("✅ Backend is ready and all modules can be imported correctly!")
        return 0
    else:
        print("❌ Some import tests failed!")
        print("Please check the errors above and fix any import issues.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
