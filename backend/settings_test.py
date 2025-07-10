"""
Test settings for BookSwaps
Used by GitHub Actions CI/CD pipeline
"""

import os
from .settings import *

# Override settings for testing
DEBUG = True

# Test database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'bookswaps_test'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# Test Redis
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('localhost', 6379)],
        },
    },
}

# Disable caching for tests
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Use in-memory file storage for tests
DEFAULT_FILE_STORAGE = 'django.core.files.storage.InMemoryStorage'

# Disable migrations for faster tests
class DisableMigrations:
    def __contains__(self, item):
        return True
    
    def __getitem__(self, item):
        return None

# Comment out migration disabling for now since we need to test migrations
# MIGRATION_MODULES = DisableMigrations()

# Test email backend
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Disable logging during tests
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'null': {
            'class': 'logging.NullHandler',
        },
    },
    'root': {
        'handlers': ['null'],
    },
}

# Test media settings
MEDIA_ROOT = '/tmp/bookswaps_test_media'
MEDIA_URL = '/test_media/'

# Test static files
STATIC_ROOT = '/tmp/bookswaps_test_static'
STATIC_URL = '/test_static/'

# Simplified password validation for tests
AUTH_PASSWORD_VALIDATORS = []

# Test secret key
SECRET_KEY = 'test-secret-key-for-ci-cd-only-not-for-production'

# Test allowed hosts
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'testserver']

# Disable CSRF for API tests
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False

# Test CORS settings
CORS_ALLOW_ALL_ORIGINS = True

# Disable SSL redirect for tests
SECURE_SSL_REDIRECT = False

# Test MinIO settings (use dummy values)
MINIO_ENDPOINT = 'localhost:9000'
MINIO_ACCESS_KEY = 'test_access_key'
MINIO_SECRET_KEY = 'test_secret_key'
MINIO_BUCKET_NAME = 'test-bookswaps'
MINIO_USE_HTTPS = False

# Test Google OAuth (dummy values)
GOOGLE_OAUTH_CLIENT_ID = 'test-client-id'
GOOGLE_OAUTH_CLIENT_SECRET = 'test-client-secret'

# Simplified social auth for tests
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': 'test-client-id',
            'secret': 'test-client-secret',
        },
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
    }
}

# Test celery settings (use synchronous execution)
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# Speed up password hashing for tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Test time zone
USE_TZ = True
TIME_ZONE = 'UTC'

# Test internationalization
USE_I18N = True
USE_L10N = True

print("🧪 Using test settings for CI/CD")
