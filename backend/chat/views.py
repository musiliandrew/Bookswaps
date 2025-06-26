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
from django.utils import timezone

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

        serializer = ChatSerializer(data=request.data, context={'sender': request.user})
        if serializer.is_valid():
            chat = serializer.save()
            return Response(ChatSerializer(chat).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EditMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, chat_id):
        try:
            chat = Chats.objects.get(chat_id=chat_id, sender=request.user)
        except Chats.DoesNotExist:
            return Response({"error": "Message not found or not authorized."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ChatSerializer(chat, data=request.data, partial=True)
        if serializer.is_valid():
            chat = serializer.save()
            return Response(ChatSerializer(chat).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, chat_id):
        try:
            chat = Chats.objects.get(chat_id=chat_id, sender=request.user)
        except Chats.DoesNotExist:
            return Response({"error": "Message not found or not authorized."}, status=status.HTTP_404_NOT_FOUND)

        chat.is_deleted_by_sender = True
        chat.save()
        return Response({"message": "Message deleted successfully."}, status=status.HTTP_200_OK)


class MessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get conversations grouped by participants
        user = request.user
        receiver_id = request.query_params.get('receiver_id')

        if receiver_id:
            # Get messages for a specific conversation
            try:
                receiver = CustomUser.objects.get(user_id=receiver_id)
            except CustomUser.DoesNotExist:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

            messages = Chats.objects.filter(
                Q(sender=user, receiver=receiver) | Q(sender=receiver, receiver=user)
            ).filter(
                Q(is_deleted_by_sender=False, sender=user) | Q(is_deleted_by_receiver=False, receiver=user)
            ).order_by('created_at')

            paginator = PageNumberPagination()
            paginator.page_size = 50
            result_page = paginator.paginate_queryset(messages, request)
            serializer = ChatSerializer(result_page, many=True)
            return paginator.get_paginated_response(serializer.data)
        else:
            # Get conversation list (latest message from each conversation)
            conversations = []

            # Get all users the current user has chatted with
            sent_to = Chats.objects.filter(sender=user, is_deleted_by_sender=False).values_list('receiver', flat=True).distinct()
            received_from = Chats.objects.filter(receiver=user, is_deleted_by_receiver=False).values_list('sender', flat=True).distinct()

            all_chat_partners = set(list(sent_to) + list(received_from))

            for partner_id in all_chat_partners:
                if partner_id is None:
                    continue

                try:
                    partner = CustomUser.objects.get(user_id=partner_id)
                except CustomUser.DoesNotExist:
                    continue

                # Get the latest message in this conversation
                latest_message = Chats.objects.filter(
                    Q(sender=user, receiver=partner) | Q(sender=partner, receiver=user)
                ).filter(
                    Q(is_deleted_by_sender=False, sender=user) | Q(is_deleted_by_receiver=False, receiver=user)
                ).order_by('-created_at').first()

                if latest_message:
                    conversation_data = {
                        'partner': {
                            'user_id': str(partner.user_id),
                            'username': partner.username,
                            'first_name': partner.first_name,
                            'last_name': partner.last_name,
                            'profile_picture': partner.profile_picture.url if partner.profile_picture else None,
                        },
                        'latest_message': ChatSerializer(latest_message).data,
                        'unread_count': Chats.objects.filter(
                            sender=partner, receiver=user, status__in=['SENT', 'DELIVERED']
                        ).count()
                    }
                    conversations.append(conversation_data)

            # Sort conversations by latest message time
            conversations.sort(key=lambda x: x['latest_message']['created_at'], reverse=True)

            return Response({
                'results': conversations,
                'count': len(conversations)
            })


class MarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chat_id):
        try:
            chat = Chats.objects.get(chat_id=chat_id, receiver=request.user)
            chat.status = 'READ'
            chat.read_at = timezone.now()
            chat.save()
            return Response({"message": "Message marked as read."}, status=status.HTTP_200_OK)
        except Chats.DoesNotExist:
            return Response({"error": "Message not found."}, status=status.HTTP_404_NOT_FOUND)


class AddReactionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chat_id):
        try:
            chat = Chats.objects.get(chat_id=chat_id)
        except Chats.DoesNotExist:
            return Response({"error": "Message not found."}, status=status.HTTP_404_NOT_FOUND)

        reaction_type = request.data.get('reaction_type')
        if not reaction_type:
            return Response({"error": "Reaction type is required."}, status=status.HTTP_400_BAD_REQUEST)

        reaction, created = MessageReaction.objects.get_or_create(
            message=chat,
            user=request.user,
            defaults={'reaction_type': reaction_type}
        )

        if not created:
            reaction.reaction_type = reaction_type
            reaction.save()

        return Response(MessageReactionSerializer(reaction).data, status=status.HTTP_201_CREATED)


class ListReactionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chat_id):
        try:
            chat = Chats.objects.get(chat_id=chat_id)
        except Chats.DoesNotExist:
            return Response({"error": "Message not found."}, status=status.HTTP_404_NOT_FOUND)

        reactions = MessageReaction.objects.filter(message=chat)
        serializer = MessageReactionSerializer(reactions, many=True)
        return Response(serializer.data)


class SendMediaMessageView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        receiver_id = request.data.get('receiver_id')
        try:
            receiver = CustomUser.objects.get(user_id=receiver_id)
        except CustomUser.DoesNotExist:
            return Response({"error": "Receiver not found."}, status=status.HTTP_404_NOT_FOUND)

        if not (Follows.objects.filter(follower=request.user, followed=receiver).exists() and
                Follows.objects.filter(follower=receiver, followed=request.user).exists()):
            return Response({"error": "Mutual follow required."}, status=status.HTTP_403_FORBIDDEN)

        serializer = MediaMessageSerializer(data=request.data, context={'sender': request.user})
        if serializer.is_valid():
            chat = serializer.save()
            return Response(ChatSerializer(chat).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TypingStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        receiver_id = request.data.get('receiver_id')
        is_typing = request.data.get('is_typing', False)

        try:
            receiver = CustomUser.objects.get(user_id=receiver_id)
        except CustomUser.DoesNotExist:
            return Response({"error": "Receiver not found."}, status=status.HTTP_404_NOT_FOUND)

        # Use cache to store typing status temporarily
        cache_key = f"typing_{request.user.user_id}_{receiver.user_id}"
        if is_typing:
            cache.set(cache_key, True, timeout=10)  # 10 seconds timeout
        else:
            cache.delete(cache_key)

        # Send typing status via WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"user_{receiver.user_id}",
            {
                "type": "typing_status",
                "user_id": str(request.user.user_id),
                "username": request.user.username,
                "is_typing": is_typing,
            }
        )

        return Response({"message": "Typing status updated."}, status=status.HTTP_200_OK)


# Society/Group Chat Views (placeholder implementations)
class CreateSocietyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Implementation for creating societies
        return Response({"message": "Society creation not implemented yet."}, status=status.HTTP_501_NOT_IMPLEMENTED)


class JoinSocietyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({"message": "Join society not implemented yet."}, status=status.HTTP_501_NOT_IMPLEMENTED)


class LeaveSocietyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({"message": "Leave society not implemented yet."}, status=status.HTTP_501_NOT_IMPLEMENTED)


class SocietyListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"results": [], "count": 0})


class SendSocietyMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({"message": "Society messaging not implemented yet."}, status=status.HTTP_501_NOT_IMPLEMENTED)


class EditSocietyMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        return Response({"message": "Edit society message not implemented yet."}, status=status.HTTP_501_NOT_IMPLEMENTED)


class DeleteSocietyMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        return Response({"message": "Delete society message not implemented yet."}, status=status.HTTP_501_NOT_IMPLEMENTED)


class SocietyMessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"results": [], "count": 0})


class PinMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({"message": "Pin message not implemented yet."}, status=status.HTTP_501_NOT_IMPLEMENTED)