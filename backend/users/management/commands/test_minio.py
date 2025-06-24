from django.core.management.base import BaseCommand
from django.conf import settings
import boto3
from botocore.exceptions import ClientError
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Test MinIO connectivity and setup'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Testing MinIO connectivity...'))
        
        try:
            # Test MinIO connection
            client = boto3.client(
                's3',
                endpoint_url=settings.AWS_S3_ENDPOINT_URL,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME,
                use_ssl=getattr(settings, 'AWS_S3_USE_SSL', False),
                verify=getattr(settings, 'AWS_S3_VERIFY', False)
            )
            
            self.stdout.write(f'MinIO Endpoint: {settings.AWS_S3_ENDPOINT_URL}')
            self.stdout.write(f'Bucket Name: {settings.AWS_STORAGE_BUCKET_NAME}')
            
            # Test bucket access
            try:
                client.head_bucket(Bucket=settings.AWS_STORAGE_BUCKET_NAME)
                self.stdout.write(self.style.SUCCESS(f'✅ Bucket "{settings.AWS_STORAGE_BUCKET_NAME}" exists and is accessible'))
            except ClientError as e:
                if e.response['Error']['Code'] == '404':
                    self.stdout.write(self.style.WARNING(f'⚠️  Bucket "{settings.AWS_STORAGE_BUCKET_NAME}" does not exist'))
                    
                    # Try to create bucket
                    try:
                        client.create_bucket(Bucket=settings.AWS_STORAGE_BUCKET_NAME)
                        self.stdout.write(self.style.SUCCESS(f'✅ Created bucket "{settings.AWS_STORAGE_BUCKET_NAME}"'))
                        
                        # Set bucket policy for public read access
                        policy = {
                            "Version": "2012-10-17",
                            "Statement": [
                                {
                                    "Effect": "Allow",
                                    "Principal": "*",
                                    "Action": "s3:GetObject",
                                    "Resource": f"arn:aws:s3:::{settings.AWS_STORAGE_BUCKET_NAME}/*"
                                }
                            ]
                        }
                        
                        import json
                        client.put_bucket_policy(
                            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                            Policy=json.dumps(policy)
                        )
                        self.stdout.write(self.style.SUCCESS('✅ Set public read policy for bucket'))
                        
                    except ClientError as create_error:
                        self.stdout.write(self.style.ERROR(f'❌ Failed to create bucket: {str(create_error)}'))
                else:
                    self.stdout.write(self.style.ERROR(f'❌ Bucket access error: {str(e)}'))
            
            # Test file upload
            try:
                from io import BytesIO
                test_content = BytesIO(b'test content')
                client.upload_fileobj(
                    test_content,
                    settings.AWS_STORAGE_BUCKET_NAME,
                    'test/connectivity_test.txt',
                    ExtraArgs={'ACL': 'public-read', 'ContentType': 'text/plain'}
                )
                
                # Test file access
                url = f"{settings.AWS_S3_ENDPOINT_URL}/{settings.AWS_STORAGE_BUCKET_NAME}/test/connectivity_test.txt"
                self.stdout.write(self.style.SUCCESS(f'✅ Test file uploaded successfully: {url}'))
                
                # Clean up test file
                client.delete_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key='test/connectivity_test.txt')
                self.stdout.write(self.style.SUCCESS('✅ Test file cleaned up'))
                
            except ClientError as upload_error:
                self.stdout.write(self.style.ERROR(f'❌ File upload test failed: {str(upload_error)}'))
            
            self.stdout.write(self.style.SUCCESS('🎉 MinIO connectivity test completed successfully!'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ MinIO connection failed: {str(e)}'))
            self.stdout.write(self.style.WARNING('Make sure MinIO is running and accessible at the configured endpoint.'))
            self.stdout.write(self.style.WARNING('You can start MinIO with: docker-compose up minio'))
