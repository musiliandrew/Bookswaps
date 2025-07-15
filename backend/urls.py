from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/users/', include('backend.users.urls')),
    path('api/swaps/', include('backend.swaps.urls', namespace='swaps')),
    path('api/library/', include('backend.library.urls', namespace='library')),
    path('api/discussions/', include('backend.discussions.urls')),
    path('api/chat/', include('backend.chat.urls')),
    path('api/health/', include('backend.health.urls')),
]

# Serve media files during development and in Docker containers
if settings.DEBUG or settings.MEDIA_URL.startswith('/media/'):
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)