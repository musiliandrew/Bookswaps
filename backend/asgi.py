import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
import backend.users.routing
import backend.chat.routing
import backend.discussions.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                backend.users.routing.websocket_urlpatterns +
                backend.chat.routing.websocket_urlpatterns +
                backend.discussions.routing.websocket_urlpatterns
            )
        )
    ),
})