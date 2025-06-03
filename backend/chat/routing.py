from django.urls import re_path
from . import consumers  

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<chat_id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/society/(?P<society_id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/$', consumers.SocietyConsumer.as_asgi()),
]