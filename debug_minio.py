#!/usr/bin/env python3
"""
Debug script to check MinIO configuration and connectivity
"""
import os
import sys
import django

# Add the backend directory to Python path
sys.path.insert(0, '/mnt/persist/workspace/backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from django.conf import settings
import boto3
from botocore.exceptions import ClientError

def debug_minio_config():
    print("🔍 MinIO Configuration Debug")
    print("=" * 50)
    
    print(f"AWS_S3_ENDPOINT_URL: {getattr(settings, 'AWS_S3_ENDPOINT_URL', 'NOT SET')}")
    print(f"AWS_ACCESS_KEY_ID: {getattr(settings, 'AWS_ACCESS_KEY_ID', 'NOT SET')}")
    print(f"AWS_SECRET_ACCESS_KEY: {getattr(settings, 'AWS_SECRET_ACCESS_KEY', 'NOT SET')}")
    print(f"AWS_STORAGE_BUCKET_NAME: {getattr(settings, 'AWS_STORAGE_BUCKET_NAME', 'NOT SET')}")
    print(f"AWS_S3_REGION_NAME: {getattr(settings, 'AWS_S3_REGION_NAME', 'NOT SET')}")
    print(f"AWS_S3_USE_SSL: {getattr(settings, 'AWS_S3_USE_SSL', 'NOT SET')}")
    print(f"AWS_S3_VERIFY: {getattr(settings, 'AWS_S3_VERIFY', 'NOT SET')}")
    
    print("\n🌍 Environment Variables:")
    print(f"MINIO_ENDPOINT_URL: {os.getenv('MINIO_ENDPOINT_URL', 'NOT SET')}")
    print(f"MINIO_ACCESS_KEY: {os.getenv('MINIO_ACCESS_KEY', 'NOT SET')}")
    print(f"MINIO_SECRET_KEY: {os.getenv('MINIO_SECRET_KEY', 'NOT SET')}")
    print(f"MINIO_BUCKET_NAME: {os.getenv('MINIO_BUCKET_NAME', 'NOT SET')}")
    
    print("\n🔗 Testing MinIO Connection:")
    try:
        client = boto3.client(
            's3',
            endpoint_url=settings.AWS_S3_ENDPOINT_URL,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
            use_ssl=getattr(settings, 'AWS_S3_USE_SSL', False),
            verify=getattr(settings, 'AWS_S3_VERIFY', False)
        )
        
        print(f"✅ MinIO client created successfully")
        print(f"📍 Endpoint: {settings.AWS_S3_ENDPOINT_URL}")
        
        # Test bucket access
        try:
            response = client.head_bucket(Bucket=settings.AWS_STORAGE_BUCKET_NAME)
            print(f"✅ Bucket '{settings.AWS_STORAGE_BUCKET_NAME}' is accessible")
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                print(f"⚠️  Bucket '{settings.AWS_STORAGE_BUCKET_NAME}' does not exist")
                # Try to create it
                try:
                    client.create_bucket(Bucket=settings.AWS_STORAGE_BUCKET_NAME)
                    print(f"✅ Created bucket '{settings.AWS_STORAGE_BUCKET_NAME}'")
                except ClientError as create_error:
                    print(f"❌ Failed to create bucket: {create_error}")
            else:
                print(f"❌ Bucket access error: {e}")
        
        # Test file upload
        try:
            from io import BytesIO
            test_content = BytesIO(b'test content for debug')
            client.upload_fileobj(
                test_content,
                settings.AWS_STORAGE_BUCKET_NAME,
                'debug/test.txt',
                ExtraArgs={'ACL': 'public-read'}
            )
            print(f"✅ Test file upload successful")
            
            # Clean up
            client.delete_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key='debug/test.txt')
            print(f"✅ Test file cleaned up")
            
        except ClientError as upload_error:
            print(f"❌ Test upload failed: {upload_error}")
            
    except Exception as e:
        print(f"❌ MinIO connection failed: {e}")
        
    print("\n🧪 Testing MinIO Storage Utility:")
    try:
        from backend.utils.minio_storage import get_minio_storage
        storage = get_minio_storage()
        print(f"✅ MinIO storage utility loaded")
        print(f"📦 Bucket name: {storage.bucket_name}")
        
    except Exception as e:
        print(f"❌ MinIO storage utility failed: {e}")

if __name__ == "__main__":
    debug_minio_config()
