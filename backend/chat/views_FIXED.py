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

# ADD NEW CONVERSATIONLISTX¢×IEW DISECTLY AFTER MESSAGELISTVIEW
class ConversationListView(APIView):
    """
    Returns a list of conversations (unique chat partners) with the latest message from each conversation.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Get all chats where user is either sender or receiver
        chats = Chats.objects.filter(
            Q(sender=user) | Q(receiver=user),
            is_deleted_by_sender=False,
            is_deleted_by_receiver=False
        ).select_related('sender', 'receiver', 'book').order_by('-created_at')
        
        # Group by conversation partner
        conversations = {}
        for chat in chats:
            # Determine the conversation partner
            partner = chat.receiver if chat.sender == user else chat.sender
            partner_id = str(partner.user_id)
            
            # Only keep the latest message for each conversation
            if partner_id not in conversations:
                conversations[partner_id] = chat
        
        # Convert to list and sort by latest message time
        conversation_list = list(conversations.values())
        conversation_list.sort(key=lambda x: x.created_at, reverse=True)
        
        # Paginate the results
        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(conversation_list, request)
        serializer = ChatSerializer(result_page, many=True)
        
        return paginator.get_paginated_response(serializer.data)