from django.test import TestCase
from django.test.client import Client
import json


class HealthCheckTestCase(TestCase):
    def setUp(self):
        self.client = Client()

    def test_health_check_endpoint_exists(self):
        """Test that the health check endpoint exists and returns JSON"""
        response = self.client.get('/api/health/')

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

    def test_health_check_basic_functionality(self):
        """Test basic health check functionality"""
        response = self.client.get('/api/health/')

        # Should not crash and should return valid JSON
        self.assertIsNotNone(response)
        data = json.loads(response.content)
        self.assertIsInstance(data, dict)
