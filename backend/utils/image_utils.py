"""
Comprehensive image handling utilities for BookSwaps
Handles MinIO, local storage, and external images gracefully
"""
import os
import logging
import requests
from io import BytesIO
from PIL import Image
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.exceptions import ValidationError

logger = logging.getLogger(__name__)

class ImageHandler:
    """Centralized image handling with fallback strategies"""
    
    def __init__(self):
        self.use_minio = self._check_minio_availability()
        
    def _check_minio_availability(self):
        """Check if MinIO is available and configured"""
        try:
            return (
                hasattr(settings, 'AWS_S3_ENDPOINT_URL') and 
                settings.AWS_S3_ENDPOINT_URL and
                hasattr(settings, 'DEFAULT_FILE_STORAGE') and
                'S3Boto3Storage' in settings.DEFAULT_FILE_STORAGE
            )
        except:
            return False
    
    def get_image_url(self, image_path_or_url):
        """
        Get the proper image URL for frontend consumption
        Handles MinIO URLs, local paths, and external URLs
        """
        if not image_path_or_url:
            return self.get_placeholder_image_url()
        
        # If it's already a full URL, return as-is
        if image_path_or_url.startswith(('http://', 'https://')):
            return image_path_or_url
        
        # If it's a local path and we're using MinIO
        if self.use_minio and image_path_or_url.startswith('/'):
            # Convert local path to MinIO URL
            return self._convert_to_minio_url(image_path_or_url)
        
        # If it's a local path and we're using local storage
        if image_path_or_url.startswith('/media/'):
            # For local development
            if settings.DEBUG:
                return f"http://localhost:8000{image_path_or_url}"
            else:
                # For production with served media
                return image_path_or_url
        
        # Default case - return as-is
        return image_path_or_url
    
    def _convert_to_minio_url(self, local_path):
        """Convert local media path to MinIO URL"""
        try:
            # Remove /media/ prefix if present
            clean_path = local_path.replace('/media/', '')
            
            endpoint_url = settings.AWS_S3_ENDPOINT_URL
            bucket_name = settings.AWS_STORAGE_BUCKET_NAME
            
            # Use public endpoint for external access
            if 'minio:9000' in endpoint_url:
                public_endpoint = endpoint_url.replace('minio:9000', 'localhost:9000')
            else:
                public_endpoint = endpoint_url
            
            return f"{public_endpoint}/{bucket_name}/{clean_path}"
        except Exception as e:
            logger.warning(f"Failed to convert to MinIO URL: {e}")
            return local_path
    
    def get_placeholder_image_url(self, image_type='book'):
        """Get placeholder image URL based on type"""
        placeholders = {
            'book': '/static/images/book-placeholder.jpg',
            'profile': '/static/images/profile-placeholder.jpg',
            'qr': '/static/images/qr-placeholder.png'
        }
        
        placeholder_path = placeholders.get(image_type, placeholders['book'])
        
        if self.use_minio:
            try:
                endpoint_url = settings.AWS_S3_ENDPOINT_URL
                bucket_name = settings.AWS_STORAGE_BUCKET_NAME
                
                if 'minio:9000' in endpoint_url:
                    public_endpoint = endpoint_url.replace('minio:9000', 'localhost:9000')
                else:
                    public_endpoint = endpoint_url
                
                return f"{public_endpoint}/{bucket_name}/placeholders/{image_type}-placeholder.jpg"
            except:
                pass
        
        # Fallback to local placeholder
        if settings.DEBUG:
            return f"http://localhost:8000{placeholder_path}"
        else:
            return placeholder_path
    
    def download_and_store_image(self, image_url, filename, folder=''):
        """
        Download an external image and store it locally or in MinIO
        Returns the stored image URL
        """
        try:
            # Download the image
            response = requests.get(image_url, timeout=10, stream=True)
            response.raise_for_status()
            
            # Open and validate the image
            image = Image.open(BytesIO(response.content))
            
            # Convert to RGB if necessary
            if image.mode in ('RGBA', 'P'):
                image = image.convert('RGB')
            
            # Resize if too large
            max_size = (800, 800)
            if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
                image.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save to BytesIO
            output = BytesIO()
            image.save(output, format='JPEG', quality=85, optimize=True)
            output.seek(0)
            
            # Store the image
            if folder:
                filepath = f"{folder}/{filename}.jpg"
            else:
                filepath = f"{filename}.jpg"
            
            # Use Django's default storage (MinIO or local)
            saved_path = default_storage.save(filepath, ContentFile(output.getvalue()))
            stored_url = default_storage.url(saved_path)
            
            logger.info(f"Successfully downloaded and stored image: {stored_url}")
            return stored_url
            
        except Exception as e:
            logger.error(f"Failed to download and store image {image_url}: {e}")
            return self.get_placeholder_image_url('book')
    
    def optimize_uploaded_image(self, image_file, max_size=(1024, 1024), quality=85):
        """
        Optimize an uploaded image file
        Returns optimized image as BytesIO
        """
        try:
            # Open the image
            if hasattr(image_file, 'seek'):
                image_file.seek(0)
            
            image = Image.open(image_file)
            
            # Convert to RGB if necessary
            if image.mode in ('RGBA', 'P'):
                image = image.convert('RGB')
            
            # Resize if necessary
            if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
                image.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save to BytesIO
            output = BytesIO()
            image.save(output, format='JPEG', quality=quality, optimize=True)
            output.seek(0)
            
            return output
            
        except Exception as e:
            logger.error(f"Failed to optimize image: {e}")
            raise ValidationError(f"Invalid image file: {e}")
    
    def cleanup_old_image(self, old_image_url):
        """Clean up old image file when replacing"""
        if not old_image_url or old_image_url.startswith(('http://', 'https://')):
            return  # Don't delete external URLs
        
        try:
            # Extract the file path
            if self.use_minio:
                # For MinIO, use the minio_storage utility
                from .minio_storage import delete_file
                delete_file(old_image_url)
            else:
                # For local storage
                if old_image_url.startswith('/media/'):
                    file_path = old_image_url.replace('/media/', '')
                    if default_storage.exists(file_path):
                        default_storage.delete(file_path)
                        logger.info(f"Deleted old image: {file_path}")
        except Exception as e:
            logger.warning(f"Failed to cleanup old image {old_image_url}: {e}")

# Global instance
image_handler = ImageHandler()

# Convenience functions
def get_image_url(image_path_or_url):
    """Get the proper image URL for frontend"""
    return image_handler.get_image_url(image_path_or_url)

def get_placeholder_url(image_type='book'):
    """Get placeholder image URL"""
    return image_handler.get_placeholder_image_url(image_type)

def download_book_cover(cover_url, book_id):
    """Download and store a book cover"""
    if not cover_url:
        return get_placeholder_url('book')
    
    filename = f"book_{book_id}"
    return image_handler.download_and_store_image(cover_url, filename, 'books')

def optimize_image(image_file, max_size=(1024, 1024), quality=85):
    """Optimize an uploaded image"""
    return image_handler.optimize_uploaded_image(image_file, max_size, quality)

def cleanup_image(image_url):
    """Clean up an old image"""
    return image_handler.cleanup_old_image(image_url)