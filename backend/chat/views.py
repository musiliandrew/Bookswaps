from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from backend.discussions.models import Society, SocietyMember, SocietyMessage
from backend.users.models import CustomUser, Follows
from backend.swaps.models import Notification
from backend.utils.websocket import send_notification_to_user
from .models import Chats
from .serializers import (
    ChatSerializer, ChatReadStatusSerializer, SocietyCreateSerializer,
    SocietySerializer, SocietyMessageSerializer, MessageReactionSerializer,
    MediaMessageSerializer
)
from .models import Chats, ChatTypingStatus
import os
import uuid
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import mimetypes
from .models import Chats, MessageReaction
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        receiver_id = request.data.get('receiver_id')
        try:
            receiver = CustomUser.objects.get(user_id=receiver_id)
        except CustomUser.DoesNotExist:
            return Response({"error": "Receiver not found."}, status=status.HTTP_404_NOT_FOUND)

        if not (Follows.objects.filter(follower=request.user, followed=receiver).exists() and
                Follows.objects.filter(follower=receiver, followed=request.user).exists()):
            return Response({"error": "Mutual follow required."}, status=status.HTTP_403_FORBIDDEN)

        serializer = ChatSerializer(data=request.data, context={'s