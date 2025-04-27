from django.urls import path, include

urlpatterns = [
    path('api/users/', include('backend.users.urls')),
    path('api/swaps/', include('backend.swaps.urls', namespace='swaps')),
    path('api/library/', include('backend.library.urls', namespace='library')),
    path('api/discussions/', include('backend.discussions.urls')),
    path('api/chat/', include('backend.chat.urls')),

]