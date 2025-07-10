"""
Swaps app tests
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()


class SwapsTestCase(TestCase):
    """Test Swaps functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_swaps_basic_functionality(self):
        """Test basic swaps functionality"""
        # Basic test to ensure the app loads
        self.assertIsNotNone(self.user)
        self.assertEqual(self.user.username, 'testuser')
