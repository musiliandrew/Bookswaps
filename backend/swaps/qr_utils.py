"""
QR Code generation and verification utilities for swap system
"""
import qrcode
import json
import base64
import hashlib
import secrets
from datetime import datetime, timedelta
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from cryptography.fernet import Fernet
from io import BytesIO
import uuid


class QRCodeManager:
    """Manages QR code generation and verification for swaps"""
    
    def __init__(self):
        # Use Django secret key for encryption
        key = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
        self.cipher = Fernet(base64.urlsafe_b64encode(key))
    
    def generate_swap_qr_code(self, swap_id, user_id, location_coords=None):
        """
        Generate a secure QR code for swap verification
        
        Args:
            swap_id: UUID of the swap
            user_id: UUID of the user generating the code
            location_coords: Optional location coordinates for verification
            
        Returns:
            dict: Contains qr_code_url, qr_data, and verification_token
        """
        # Create verification data
        verification_data = {
            'swap_id': str(swap_id),
            'user_id': str(user_id),
            'timestamp': datetime.now().isoformat(),
            'expires_at': (datetime.now() + timedelta(hours=24)).isoformat(),
            'verification_token': secrets.token_urlsafe(32),
            'location_coords': location_coords
        }
        
        # Encrypt the data
        encrypted_data = self.cipher.encrypt(json.dumps(verification_data).encode())
        qr_data = base64.urlsafe_b64encode(encrypted_data).decode()
        
        # Generate QR code image
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        # Create QR code image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save to storage
        img_buffer = BytesIO()
        img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        # Generate unique filename
        filename = f"qr_codes/{swap_id}_{user_id}_{uuid.uuid4().hex[:8]}.png"
        
        # Save to storage (S3 or local)
        file_path = default_storage.save(filename, ContentFile(img_buffer.getvalue()))
        qr_code_url = default_storage.url(file_path)
        
        return {
            'qr_code_url': qr_code_url,
            'qr_data': qr_data,
            'verification_token': verification_data['verification_token']
        }
    
    def verify_qr_code(self, qr_data, expected_swap_id, expected_user_id, current_location=None):
        """
        Verify a QR code for swap confirmation
        
        Args:
            qr_data: The QR code data to verify
            expected_swap_id: Expected swap ID
            expected_user_id: Expected user ID
            current_location: Current location coordinates for verification
            
        Returns:
            dict: Verification result with success status and details
        """
        try:
            # Decode and decrypt the data
            encrypted_data = base64.urlsafe_b64decode(qr_data.encode())
            decrypted_data = self.cipher.decrypt(encrypted_data)
            verification_data = json.loads(decrypted_data.decode())
            
            # Check expiration
            expires_at = datetime.fromisoformat(verification_data['expires_at'])
            if datetime.now() > expires_at:
                return {
                    'success': False,
                    'error': 'QR code has expired',
                    'error_code': 'EXPIRED'
                }
            
            # Verify swap and user IDs
            if verification_data['swap_id'] != str(expected_swap_id):
                return {
                    'success': False,
                    'error': 'Invalid swap ID',
                    'error_code': 'INVALID_SWAP'
                }
            
            if verification_data['user_id'] != str(expected_user_id):
                return {
                    'success': False,
                    'error': 'Invalid user ID',
                    'error_code': 'INVALID_USER'
                }
            
            # Verify location if provided
            if current_location and verification_data.get('location_coords'):
                distance = self._calculate_distance(
                    current_location,
                    verification_data['location_coords']
                )
                # Allow 100 meter tolerance
                if distance > 0.1:  # 0.1 km = 100 meters
                    return {
                        'success': False,
                        'error': 'Location verification failed - too far from meetup point',
                        'error_code': 'LOCATION_MISMATCH',
                        'distance': distance
                    }
            
            return {
                'success': True,
                'verification_data': verification_data,
                'verified_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'QR code verification failed: {str(e)}',
                'error_code': 'VERIFICATION_ERROR'
            }
    
    def _calculate_distance(self, coord1, coord2):
        """Calculate distance between two coordinates in kilometers"""
        from math import radians, sin, cos, sqrt, atan2
        
        # Convert to radians
        lat1, lon1 = radians(coord1['latitude']), radians(coord1['longitude'])
        lat2, lon2 = radians(coord2['latitude']), radians(coord2['longitude'])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        # Earth's radius in kilometers
        R = 6371
        return R * c
    
    def generate_location_verification_code(self, location_id, user_id):
        """Generate a location-specific verification code"""
        data = {
            'location_id': str(location_id),
            'user_id': str(user_id),
            'timestamp': datetime.now().isoformat(),
            'expires_at': (datetime.now() + timedelta(minutes=30)).isoformat()
        }
        
        encrypted_data = self.cipher.encrypt(json.dumps(data).encode())
        return base64.urlsafe_b64encode(encrypted_data).decode()
    
    def verify_location_code(self, code, expected_location_id, expected_user_id):
        """Verify a location verification code"""
        try:
            encrypted_data = base64.urlsafe_b64decode(code.encode())
            decrypted_data = self.cipher.decrypt(encrypted_data)
            data = json.loads(decrypted_data.decode())
            
            # Check expiration
            expires_at = datetime.fromisoformat(data['expires_at'])
            if datetime.now() > expires_at:
                return False
            
            # Verify location and user
            return (data['location_id'] == str(expected_location_id) and 
                   data['user_id'] == str(expected_user_id))
                   
        except Exception:
            return False


# Global instance
qr_manager = QRCodeManager()
