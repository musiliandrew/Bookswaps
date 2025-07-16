import os
import uuid
import logging
from io import BytesIO
from PIL import Image
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.core.exceptions import ValidationError
from django.utils import timezone

logger = logging.getLogger(__name__)

class LocalFileStorage:
    """Local file storage utility for handling all file operations."""

    def __init__(self):
        self.media_root = settings.MEDIA_ROOT
        self.media_url = settings.MEDIA_URL

    def upload_file(self, file_obj, filename, folder="", content_type=None):
        """
        Upload a file to local storage.

        Args:
            file_obj: File object or file-like object
            filename: Name for the file in storage
            folder: Optional folder path (e.g., 'profiles', 'books', 'qr-codes')
            content_type: Optional content type (ignored for local storage)

        Returns:
            str: Public URL of the uploaded file
        """
        try:
            # Construct the full path
            if folder:
                file_path = f"{folder}/{filename}"
            else:
                file_path = filename

            # Reset file pointer if it's a file-like object
            if hasattr(file_obj, 'seek'):
                file_obj.seek(0)

            # Read file content
            if hasattr(file_obj, 'read'):
                file_content = file_obj.read()
            else:
                file_content = file_obj

            # Create ContentFile and save using Django's default storage
            content_file = ContentFile(file_content)
            saved_path = default_storage.save(file_path, content_file)

            # Return the public URL
            url = f"{self.media_url}{saved_path}"
            logger.info(f"Successfully uploaded file to local storage: {url}")
            return url

        except Exception as e:
            logger.error(f"Local storage upload failed for {filename}: {str(e)}")
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
            
            return self.upload_file(output, filename, folder)
            
        except Exception as e:
            logger.error(f"Image processing failed for {filename}: {str(e)}")
            raise ValidationError(f"Failed to process image: {str(e)}")

    def delete_file(self, file_url):
        """
        Delete a file from local storage using its URL.

        Args:
            file_url: Full URL of the file to delete

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Extract relative path from URL
            if file_url.startswith(self.media_url):
                relative_path = file_url.replace(self.media_url, "")
                
                if default_storage.exists(relative_path):
                    default_storage.delete(relative_path)
                    logger.info(f"Successfully deleted file from local storage: {relative_path}")
                    return True
                else:
                    logger.warning(f"File not found in local storage: {relative_path}")
                    return False
            else:
                logger.warning(f"Invalid local storage URL format: {file_url}")
                return False

        except Exception as e:
            logger.error(f"Failed to delete file from local storage: {str(e)}")
            return False

# Global instance
local_storage = None

def get_local_storage():
    """Get or create the global local storage instance."""
    global local_storage
    if local_storage is None:
        local_storage = LocalFileStorage()
    return local_storage

# Convenience functions
def upload_profile_picture(image_file, username):
    """Upload a user profile picture."""
    try:
        filename = f"{username}_{timezone.now().strftime('%Y%m%d%H%M%S')}.jpg"
        storage = get_local_storage()
        return storage.upload_image(image_file, filename, folder="profiles")
    except Exception as e:
        logger.error(f"Failed to upload profile picture: {str(e)}")
        # Return a placeholder URL if upload fails
        placeholder_url = f"{settings.MEDIA_URL}profiles/placeholder.jpg"
        # Ensure placeholder exists
        ensure_placeholder_exists("profiles")
        return placeholder_url

def upload_book_cover(image_file, book_id):
    """Upload a book cover image."""
    try:
        filename = f"{book_id}.jpg"
        storage = get_local_storage()
        return storage.upload_image(image_file, filename, folder="books")
    except Exception as e:
        logger.error(f"Failed to upload book cover: {str(e)}")
        # Return a placeholder URL if upload fails
        placeholder_url = f"{settings.MEDIA_URL}books/placeholder.jpg"
        # Ensure placeholder exists
        ensure_placeholder_exists("books")
        return placeholder_url

def upload_qr_code(qr_image, qr_id):
    """Upload a QR code image."""
    try:
        filename = f"{qr_id}.png"
        storage = get_local_storage()
        return storage.upload_file(qr_image, filename, folder="qr-codes", content_type="image/png")
    except Exception as e:
        logger.error(f"Failed to upload QR code: {str(e)}")
        # Return a placeholder URL if upload fails
        placeholder_url = f"{settings.MEDIA_URL}qr-codes/placeholder.png"
        # Ensure placeholder exists
        ensure_placeholder_exists("qr-codes")
        return placeholder_url

def delete_file(file_url):
    """Delete a file by URL."""
    storage = get_local_storage()
    return storage.delete_file(file_url)

def get_media_url(filename, folder=""):
    """Get the full media URL for a given filename."""
    if folder:
        return f"{settings.MEDIA_URL}{folder}/{filename}"
    return f"{settings.MEDIA_URL}{filename}"

def ensure_placeholder_exists(folder):
    """Ensure placeholder image exists for the given folder."""
    try:
        placeholder_path = f"{folder}/placeholder.jpg"
        if not default_storage.exists(placeholder_path):
            logger.warning(f"Placeholder image missing for {folder}, creating simple placeholder")
            # Create a simple placeholder if it doesn't exist
            create_simple_placeholder(folder)
    except Exception as e:
        logger.error(f"Failed to ensure placeholder exists for {folder}: {str(e)}")

def create_simple_placeholder(folder):
    """Create a simple placeholder image if PIL is not available."""
    try:
        # Create a minimal placeholder file (1x1 transparent pixel)
        placeholder_content = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82'
        placeholder_path = f"{folder}/placeholder.jpg"
        content_file = ContentFile(placeholder_content)
        default_storage.save(placeholder_path, content_file)
        logger.info(f"Created simple placeholder for {folder}")
    except Exception as e:
        logger.error(f"Failed to create simple placeholder for {folder}: {str(e)}")
