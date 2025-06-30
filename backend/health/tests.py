from django.test import TestCase
from django.urls import reverse
from django.test.client import Client
import json


class HealthCheckTestCase(TestCase):
    def setUp(self):
        self.client = Client()

    def test_health_check_endpoint(self):
        """Test that the health check endpoint returns a valid response"""
        url = reverse('health_check')
        response = self.client.get(url)
        
        # Should return 200 or 503 depending on service health
        self.assertIn(response.status_code, [200, 503])
        
        # Response should be JSON
        self.assertEqual(response['Content-Type'], 'application/json')
        
        # Parse JSON response
        data = json.loads(response.content)
        
        # Should have required fields
        self.assertIn('status', data)
        self.assertIn('database', data)
        self.assertIn('cache', data)
        
        # Status should be either 'healthy' or 'unhealthy'
        self.assertIn(data['status'], ['healthy', 'unhealthy'])

    def test_health_check_url_pattern(self):
        """Test that the health check URL is properly configured"""
        url = reverse('health_check')
        self.assertEqual(url, '/api/health/')
