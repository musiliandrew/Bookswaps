import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

# Set DJANGO_SETTINGS_MODULE explicitly (redundant if set in docker-compose.yml, but safe)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Initialize Django ASGI application early to ensure settings are configured
django_asgi_app = get_asgi_application()

# Lazy import of routing modules to avoid premature model loading
def get_websocket_urlpatterns():
    from backend.users.routing import websocket_urlpatterns as users_patterns
    from backend.chat.routing import websocket_urlpatterns as chat_patterns
    from backend.discussions.routing import websocket_urlpatterns as discussions_patterns
    return users_patterns + chat_patterns + discussions_patterns

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(get_websocket_urlpatterns())
        )
    ),
})