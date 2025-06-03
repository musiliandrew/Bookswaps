from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/discussions/(?P<discussion_id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/$', consumers.DiscussionConsumer.as_asgi()),
]