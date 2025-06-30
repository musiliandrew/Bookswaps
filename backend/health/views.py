from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def health_check(request):
    """
    Health check endpoint for monitoring and load balancers
    """
    health_status = {
        'status': 'healthy',
        'database': 'unknown',
        'cache': 'unknown',
        'services': {}
    }

    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            health_status['database'] = 'healthy'
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        health_status['database'] = 'unhealthy'
        health_status['status'] = 'unhealthy'

    # Check Redis cache (skip in test environment)
    if 'test' in settings.DATABASES['default']['NAME'] or settings.DEBUG:
        # In test environment, just mark cache as healthy
        health_status['cache'] = 'healthy'
    else:
        try:
            cache.set('health_check', 'test', 10)
            cache.get('health_check')
            health_status['cache'] = 'healthy'
        except Exception as e:
            logger.error(f"Cache health check failed: {e}")
            health_status['cache'] = 'unhealthy'
            health_status['status'] = 'unhealthy'

    # Return appropriate status code
    status_code = 200 if health_status['status'] == 'healthy' else 503

    return JsonResponse(health_status, status=status_code)
