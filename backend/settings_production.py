"""
Production settings for BookSwaps
"""

from .settings import *
import os

# Production-specific settings
DEBUG = False

# Production database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'bookswaps_prod'),
        'USER': os.getenv('DB_USER', 'bookswaps_user'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'bookswaps_password'),
        'HOST': os.getenv('DB_HOST', 'db'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# Production allowed hosts
ALLOWED_HOSTS = ['bookswaps.co.ke', 'www.bookswaps.co.ke', 'localhost', '127.0.0.1']

# Security settings for production
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Static files for production
STATIC_ROOT = '/app/staticfiles'
STATIC_URL = '/static/'

print("🚀 Using production settings")

# Google OAuth Configuration
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': os.getenv('GOOGLE_OAUTH_CLIENT_ID'),
            'secret': os.getenv('GOOGLE_OAUTH_CLIENT_SECRET'),
        },
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        },
        'OAUTH_PKCE_ENABLED': True,
    }
}

# MinIO Configuration for media files
DEFAULT_FILE_STORAGE = 'backend.utils.minio_storage.MinIOStorage'
MINIO_ENDPOINT = os.getenv('MINIO_ENDPOINT', 'minio:9000')
MINIO_ACCESS_KEY = os.getenv('MINIO_ACCESS_KEY', 'bookswaps_minio_user')
MINIO_SECRET_KEY = os.getenv('MINIO_SECRET_KEY', 'bookswaps_minio_password_2024')
MINIO_BUCKET_NAME = os.getenv('MINIO_BUCKET_NAME', 'bookswaps-media')
MINIO_USE_HTTPS = os.getenv('MINIO_USE_HTTPS', 'false').lower() == 'true'

# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = '/app/media/'

print("🔧 Google OAuth and MinIO configured for production")
