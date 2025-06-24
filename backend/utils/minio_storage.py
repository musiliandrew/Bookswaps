import boto3
import uuid
import logging
from io import BytesIO
from PIL import Image
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.exceptions import ValidationError
from botocore.exceptions import ClientError
from botocore.config import Config

logger = logging.getLogger(__name__)

class MinIOStorage:
    """Centralized MinIO storage utility for handling all file operations."""
    
    def __init__(self):
        self.client = boto3.client(
            's3',
            endpoint_url=settings.AWS_S3_ENDPOINT_URL,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
            config=Config(signature_version=settings.AWS_S3_SIGNATURE_VERSION),
            use_ssl=settings.AWS_S3_USE_SSL,
            verify=settings.AWS_S3_VERIFY
        )
        self.bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        self._ensure_bucket_exists()
    
    def _ensure_bucket_exists(self):
        """Create bucket if it doesn't exist."""
        try:
            self.client.head_bucket(Bucket=self.bucket_name)
            logger.info(f"MinIO bucket '{self.bucket_name}' exists")
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                logger.info(f"Creating MinIO bucket: {self.bucket_name}")
                try:
                    self.client.create_bucket(Bucket=self.bucket_name)
                    # Set bucket policy for public read access
                    self._set_bucket_policy()
                    logger.info(f"MinIO bucket '{self.bucket_name}' created successfully")
                except ClientError as create_error:
                    logger.error(f"Failed to create MinIO bucket: {str(create_error)}")
                    raise ValidationError("Failed to create storage bucket")
            else:
                logger.error(f"MinIO bucket check failed: {str(e)}")
                raise ValidationError("Failed to access storage bucket")
    
    def _set_bucket_policy(self):
        """Set bucket policy for public read access."""
        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": f"arn:aws:s3:::{self.bucket_name}/*"
                }
            ]
        }
        
        try:
            import json
            self.client.put_bucket_policy(
                Bucket=self.bucket_name,
                Policy=json.dumps(policy)
            )
            logger.info(f"Set public read policy for bucket '{self.bucket_name}'")
        except ClientError as e:
            logger.warning(f"Failed to set bucket policy: {str(e)}")
    
    def upload_file(self, file_obj, filename, folder="", content_type=None):
        """
        Upload a file to MinIO.
        
        Args:
            file_obj: File object or file-like object
            filename: Name for the file in storage
            folder: Optional folder path (e.g., 'profiles', 'books', 'qr-codes')
            content_type: Optional content type
        
        Returns:
            str: Public URL of the uploaded file
        """
        # Construct the full key
        if folder:
            key = f"{folder}/{filename}"
        else:
            key = filename
        
        # Prepare upload arguments
        extra_args = {'ACL': 'public-read'}
        if content_type:
            extra_args['ContentType'] = content_type
        
        try:
            # Reset file pointer if it's a file-like object
            if hasattr(file_obj, 'seek'):
                file_obj.seek(0)
            
            self.client.upload_fileobj(
                file_obj,
                self.bucket_name,
                key,
                ExtraArgs=extra_args
            )
            
            # Return the public URL
            url = f"{settings.AWS_S3_ENDPOINT_URL}/{self.bucket_name}/{key}"
            logger.info(f"Successfully uploaded file to MinIO: {url}")
            return url
            
        except ClientError as e:
            logger.error(f"MinIO upload failed for {key}: {str(e)}")
            raise ValidationError(f"Failed to upload file: {str(e)}")
    
    def upload_image(self, image_file, filename, folder="", max_size=(1024, 1024), quality=85):
        """
        Upload and optimize an image file.
        
        Args:
            image_file: Image file object
            filename: Name for the file in storage
            folder: Optional folder path
            max_size: Maximum dimensions (width, height)
            quality: JPEG quality (1-100)
        
        Returns:
            str: Public URL of the uploaded image
        """
        try:
            # Open and process the image
            image = Image.open(image_file)
            
            # Convert to RGB if necessary (for JPEG)
            if image.mode in ('RGBA', 'P'):
                image = image.convert('RGB')
            
            # Resize if necessary
            if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
                image.thumbnail(max_size, Image.Resampling.LANCZOS)
                logger.info(f"Resized image from original size to {image.size}")
            
            # Save to BytesIO
            output = BytesIO()
            image.save(output, format='JPEG', quality=quality, optimize=True)
            output.seek(0)
            
            # Ensure filename has .jpg extension
            if not filename.lower().endswith(('.jpg', '.jpeg')):
                filename = f"{filename.rsplit('.', 1)[0]}.jpg"
            
            return self.upload_file(output, filename, folder, 'image/jpeg')
            
        except Exception as e:
            logger.error(f"Image processing failed for {filename}: {str(e)}")
            raise ValidationError(f"Failed to process image: {str(e)}")
    
    def delete_file(self, file_url):
        """
        Delete a file from MinIO using its URL.
        
        Args:
            file_url: Full URL of the file to delete
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Extract key from URL
            if file_url.startswith(f"{settings.AWS_S3_ENDPOINT_URL}/{self.bucket_name}/"):
                key = file_url.replace(f"{settings.AWS_S3_ENDPOINT_URL}/{self.bucket_name}/", "")
                
                self.client.delete_object(Bucket=self.bucket_name, Key=key)
                logger.info(f"Successfully deleted file from MinIO: {key}")
                return True
            else:
                logger.warning(f"Invalid MinIO URL format: {file_url}")
                return False
                
        except ClientError as e:
            logger.error(f"Failed to delete file from MinIO: {str(e)}")
            return False
    
    def generate_presigned_url(self, key, expiration=3600):
        """
        Generate a presigned URL for temporary access.
        
        Args:
            key: Object key in the bucket
            expiration: URL expiration time in seconds
        
        Returns:
            str: Presigned URL
        """
        try:
            url = self.client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': key},
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            logger.error(f"Failed to generate presigned URL: {str(e)}")
            return None

# Global instance
minio_storage = MinIOStorage()

# Convenience functions
def upload_profile_picture(image_file, username):
    """Upload a user profile picture."""
    from django.utils import timezone
    filename = f"{username}_{timezone.now().strftime('%Y%m%d%H%M%S')}.jpg"
    return minio_storage.upload_image(image_file, filename, folder="profiles")

def upload_book_cover(image_file, book_id):
    """Upload a book cover image."""
    filename = f"{book_id}.jpg"
    return minio_storage.upload_image(image_file, filename, folder="books")

def upload_qr_code(qr_image, qr_id):
    """Upload a QR code image."""
    filename = f"{qr_id}.png"
    return minio_storage.upload_file(qr_image, filename, folder="qr-codes", content_type="image/png")

def delete_file(file_url):
    """Delete a file by URL."""
    return minio_storage.delete_file(file_url)

def get_minio_url(key):
    """Get the full MinIO URL for a given key."""
    return f"{settings.AWS_S3_ENDPOINT_URL}/{settings.AWS_STORAGE_BUCKET_NAME}/{key}"
