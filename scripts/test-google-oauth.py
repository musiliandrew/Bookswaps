#!/usr/bin/env python3
"""
Test Google OAuth Configuration
"""
import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_path = Path(__file__).parent.parent / 'backend'
sys.path.insert(0, str(backend_path))

# Change to backend directory
os.chdir(str(backend_path))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from django.conf import settings

def test_google_oauth_config():
    """Test Google OAuth configuration"""
    print("🔍 Testing Google OAuth Configuration...")
    print("=" * 50)
    
    # Check environment variables
    client_id = os.getenv('GOOGLE_OAUTH_CLIENT_ID')
    client_secret = os.getenv('GOOGLE_OAUTH_CLIENT_SECRET')
    
    print(f"Environment Variables:")
    print(f"  GOOGLE_OAUTH_CLIENT_ID: {'✅ Set' if client_id else '❌ Missing'}")
    print(f"  GOOGLE_OAUTH_CLIENT_SECRET: {'✅ Set' if client_secret else '❌ Missing'}")
    
    if client_id:
        print(f"  Client ID: {client_id[:20]}...{client_id[-10:]}")
    
    print()
    
    # Check Django settings
    try:
        social_providers = settings.SOCIALACCOUNT_PROVIDERS
        google_config = social_providers.get('google', {})
        app_config = google_config.get('APP', {})
        
        settings_client_id = app_config.get('client_id')
        settings_secret = app_config.get('secret')
        
        print(f"Django Settings:")
        print(f"  SOCIALACCOUNT_PROVIDERS configured: {'✅ Yes' if google_config else '❌ No'}")
        print(f"  Google APP client_id: {'✅ Set' if settings_client_id else '❌ Missing'}")
        print(f"  Google APP secret: {'✅ Set' if settings_secret else '❌ Missing'}")
        
        if settings_client_id:
            print(f"  Settings Client ID: {settings_client_id[:20]}...{settings_client_id[-10:]}")
            
        # Check if they match
        if client_id and settings_client_id:
            if client_id == settings_client_id:
                print(f"  Environment & Settings Match: ✅ Yes")
            else:
                print(f"  Environment & Settings Match: ❌ No")
                
    except Exception as e:
        print(f"❌ Error checking Django settings: {e}")
    
    print()
    
    # Test Google OAuth domain configuration
    print("🌐 Domain Configuration:")
    allowed_hosts = settings.ALLOWED_HOSTS
    print(f"  ALLOWED_HOSTS: {allowed_hosts}")
    
    frontend_url = getattr(settings, 'FRONTEND_URL', None)
    print(f"  FRONTEND_URL: {frontend_url}")
    
    print()
    print("💡 Recommendations:")
    
    if not client_id:
        print("  - Set GOOGLE_OAUTH_CLIENT_ID environment variable")
    
    if not client_secret:
        print("  - Set GOOGLE_OAUTH_CLIENT_SECRET environment variable")
        
    if 'localhost' not in str(allowed_hosts) and '127.0.0.1' not in str(allowed_hosts):
        print("  - Add localhost/127.0.0.1 to ALLOWED_HOSTS for local development")
        
    print("  - Ensure Google OAuth app is configured for the correct domain")
    print("  - For localhost testing, add http://localhost:80 to Google OAuth authorized origins")

if __name__ == '__main__':
    test_google_oauth_config()
