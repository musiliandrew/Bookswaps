from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.response import Response
from rest_framework import status
from backend.discussions.models import Society, SocietyMember, SocietyMessage
from backend.users.models import CustomUser, Follows
from backend.swaps.models import Notification
from backend.utils.websocket import send_notification_to_user
from .serializers import (
    ChatSerializer, ChatReadStatusSerializer, SocietyCreateSerializer,
    SocietySerializer, SocietyMessageSerializer, MessageReactionSerializer
)
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

        serializer = ChatSerializer(data=request.data, context={'sender': request.user})
        if serializer.is_valid():
            chat = serializer.save()
            # Send WebSocket notification for the chat message
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"chat_{chat.chat_id}",
                {
                    "type": "chat_message",
                    "message": ChatSerializer(chat).data
                }
            )
            # Also send a notification to the receiver's user group
            notification = Notification.objects.create(
                user=receiver,
                type='message_received',
                message=f"{request.user.username} sent you a message.",
                content_type='chat',
                content_id=chat.chat_id
            )
            send_notification_to_user(
                receiver.user_id,
                {
                    "notification_id": str(notification.notification_id),
                    "message": f"{request.user.username} sent you a message.",
                    "type": "message_received",
                    "content_type": "chat",
                    "content_id": str(chat.chat_id),
                    "follow_id": None
                }
            )
            return Response(ChatSerializer(chat).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EditMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, chat_id):
        try:
            chat = Chats.objects.get(chat_id=chat_id, sender=request.user)
        except Chats.DoesNotExist:
            return Response({"error": "Chat not found or not your message."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ChatSerializer(chat, data=request.data, partial=True, context={'sender': request.user})
        if serializer.is_valid():
            chat = serializer.save()
            notification = Notification.objects.create(
                user=chat.receiver,
                type='message_edited',
                message=f"{request.user.username} edited a message.",
                content_type='chat',
                content_id=chat.chat_id
            )
            # Send notification via WebSocket
            send_notification_to_user(
                chat.receiver.user_id,
                {
                    "notification_id": str(notification.notification_id),
                    "message": f"{request.user.username} edited a message.",
                    "type": "message_edited",
                    "content_type": "chat",
                    "content_id": str(chat.chat_id),
                    "follow_id": None
                }
            )
            return Response(ChatSerializer(chat).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, chat_id):
        try:
            chat = Chats.objects.get(chat_id=chat_id)
        except Chats.DoesNotExist:
            return Response({"error": "Chat not found."}, status=status.HTTP_404_NOT_FOUND)

        if chat.sender == request.user:
            chat.is_deleted_by_sender = True
        elif chat.receiver == request.user:
            chat.is_deleted_by_receiver = True
        else:
            return Response({"error": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        chat.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class MessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print(f"MessageListView GET: user={request.user.username}, query_params={request.query_params}")
        user = request.user
        cache_key = f"chat_list_{user.user_id}_{str(request.query_params)}"
        cached_response = cache.get(cache_key)
        
        if cached_response:
            print(f"Cache hit: {cache_key}")
            # Return the cached response directly
            return Response(cached_response)

        chats = Chats.objects.filter(
            Q(sender=user) | Q(receiver=user),
            is_deleted_by_sender=False,
            is_deleted_by_receiver=False
        ).select_related('sender', 'receiver', 'book')

        receiver_id = request.query_params.get('receiver_id')
        unread = request.query_params.get('unread')

        if receiver_id:
            chats = chats.filter(
                Q(sender__user_id=receiver_id, receiver=user) |
                Q(receiver__user_id=receiver_id, sender=user)
            )
        if unread == 'true':
            chats = chats.filter(status='UNREAD', receiver=user)

        chats = chats.order_by('-created_at')
        print(f"Found {chats.count()} chats")
        
        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(chats, request)
        serializer = ChatSerializer(result_page, many=True)
        
        # Get the paginated response
        response = paginator.get_paginated_response(serializer.data)
        
        # Cache the response data, not the Response object
        cache.set(cache_key, response.data, timeout=300)
        
        return response

class MarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, chat_id):
        try:
            chat = Chats.objects.get(chat_id=chat_id, receiver=request.user)
        except Chats.DoesNotExist:
            raise NotFound("Chat not found or you're not the recipient.")

        chat.status = 'READ'
        chat.save()
        serializer = ChatReadStatusSerializer(chat)
        notification = Notification.objects.create(
            user=chat.sender,
            type='message_read',
            message=f"{request.user.username} read your message.",
            content_type='chat',
            content_id=chat.chat_id
        )
        # Send notification via WebSocket
        send_notification_to_user(
            chat.sender.user_id,
            {
                "notification_id": str(notification.notification_id),
                "message": f"{request.user.username} read your message.",
                "type": "message_read",
                "content_type": "chat",
                "content_id": str(chat.chat_id),
                "follow_id": None
            }
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

class AddReactionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, society_id=None, message_id=None, chat_id=None):
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        channel_layer = get_channel_layer()

        if chat_id:
            try:
                chat = Chats.objects.get(chat_id=chat_id)
            except Chats.DoesNotExist:
                return Response({"error": "Chat not found."}, status=status.HTTP_404_NOT_FOUND)
            context = {'chat': chat, 'user': request.user}
            group_name = f"chat_{chat_id}"
        elif society_id and message_id:
            try:
                society_message = SocietyMessage.objects.get(
                    message_id=message_id,
                    society__society_id=society_id,
                    status='ACTIVE'
                )
            except SocietyMessage.DoesNotExist:
                return Response({"error": "Society message not found."}, status=status.HTTP_404_NOT_FOUND)
            context = {'society_message': society_message, 'user': request.user}
            group_name = f"society_{society_id}"
        else:
            return Response({"error": "Chat or society message ID required."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = MessageReactionSerializer(data=request.data, context=context)
        if serializer.is_valid():
            reaction = serializer.save()
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    "type": "reaction_added",
                    "reaction": MessageReactionSerializer(reaction).data
                }
            )
            return Response(MessageReactionSerializer(reaction).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ListReactionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, society_id=None, message_id=None, chat_id=None):
        if chat_id:
            try:
                Chats.objects.get(chat_id=chat_id)
            except Chats.DoesNotExist:
                return Response({"error": "Chat not found."}, status=status.HTTP_404_NOT_FOUND)
            reactions = MessageReaction.objects.filter(chat__chat_id=chat_id)
        elif society_id and message_id:
            # Verify user is a society member
            if not SocietyMember.objects.filter(
                society__society_id=society_id,
                user=request.user,
                status='ACTIVE'
            ).exists():
                return Response({"error": "Not a society member."}, status=status.HTTP_403_FORBIDDEN)
            try:
                SocietyMessage.objects.get(
                    message_id=message_id,
                    society__society_id=society_id,
                    status='ACTIVE'
                )
            except SocietyMessage.DoesNotExist:
                return Response({"error": "Society message not found."}, status=status.HTTP_404_NOT_FOUND)
            reactions = MessageReaction.objects.filter(society_message__message_id=message_id)
        else:
            return Response({"error": "Chat or society message ID required."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = MessageReactionSerializer(reactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
class CreateSocietyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SocietyCreateSerializer(data=request.data)
        if serializer.is_valid():
            society = serializer.save(creator=request.user)
            SocietyMember.objects.create(
                society=society,
                user=request.user,
                role='admin',
                status='ACTIVE'
            )
            notification = Notification.objects.create(
                user=request.user,
                type='society_created',
                message=f"You created a new society: {society.name}",
                content_type='society',
                content_id=society.society_id
            )
            # Send notification via WebSocket to the user's group
            send_notification_to_user(
                request.user.user_id,
                {
                    "notification_id": str(notification.notification_id),
                    "message": f"You created a new society: {society.name}",
                    "type": "society_created",
                    "content_type": "society",
                    "content_id": str(society.society_id),
                    "follow_id": None
                }
            )
            return Response(SocietySerializer(society).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class JoinSocietyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, society_id):
        society = get_object_or_404(Society, society_id=society_id)
        if society.visibility == 'private':
            return Response({"error": "Private society. Join by invitation only."}, status=status.HTTP_403_FORBIDDEN)

        member, created = SocietyMember.objects.get_or_create(
            society=society,
            user=request.user,
            defaults={'role': 'member', 'status': 'ACTIVE'}
        )
        if not created:
            return Response({"error": "Already a member."}, status=status.HTTP_400_BAD_REQUEST)

        notification = Notification.objects.create(
            user=request.user,
            type='society_joined',
            message=f"You joined the society: {society.name}",
            content_type='society',
            content_id=society.society_id
        )
        # Send notification via WebSocket to the user's group
        send_notification_to_user(
            request.user.user_id,
            {
                "notification_id": str(notification.notification_id),
                "message": f"You joined the society: {society.name}",
                "type": "society_joined",
                "content_type": "society",
                "content_id": str(society.society_id),
                "follow_id": None
            }
        )
        return Response(SocietySerializer(society).data, status=status.HTTP_201_CREATED)
class LeaveSocietyView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, society_id):
        try:
            member = SocietyMember.objects.get(society__society_id=society_id, user=request.user)
        except SocietyMember.DoesNotExist:
            return Response({"error": "Not a member."}, status=status.HTTP_404_NOT_FOUND)

        society = member.society
        if member.role == 'admin' and SocietyMember.objects.filter(society=society, role='admin').count() == 1:
            return Response({"error": "Cannot leave as the only admin."}, status=status.HTTP_400_BAD_REQUEST)

        member.delete()
        notification = Notification.objects.create(
            user=request.user,
            type='society_left',
            message=f"You left the society: {society.name}",
            content_type='society',
            content_id=society.society_id
        )
        # Send notification via WebSocket to the user's group
        send_notification_to_user(
            request.user.user_id,
            {
                "notification_id": str(notification.notification_id),
                "message": f"You left the society: {society.name}",
                "type": "society_left",
                "content_type": "society",
                "content_id": str(society.society_id),
                "follow_id": None
            }
        )
        return Response(status=status.HTTP_204_NO_CONTENT)


class SocietyListView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        user = request.user if request.user.is_authenticated else None
        focus_type = request.query_params.get('focus_type')
        focus_id = request.query_params.get('focus_id')
        my_societies = request.query_params.get('my_societies') == 'true'

        cache_key = f"society_list_{user.user_id if user else 'anon'}_{request.query_params}"
        cached_response = cache.get(cache_key)
        
        if cached_response:
            # Return the cached response directly
            return Response(cached_response)

        societies = Society.objects.all()
        if my_societies and user:
            societies = societies.filter(members__user=user, members__status='ACTIVE')
        else:
            societies = societies.filter(Q(visibility='public') | Q(members__user=user, members__status='ACTIVE'))

        if focus_type:
            societies = societies.filter(focus_type=focus_type)
        if focus_id:
            societies = societies.filter(focus_id=focus_id)

        societies = societies.distinct()
        
        paginator = PageNumberPagination()
        paginated = paginator.paginate_queryset(societies, request)
        serializer = SocietySerializer(paginated, many=True)
        
        # Get the paginated response
        response = paginator.get_paginated_response(serializer.data)
        
        # Cache the response data
        cache.set(cache_key, response.data, timeout=3600)
        
        return response

class SendSocietyMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, society_id):
        is_member = SocietyMember.objects.filter(
            society__society_id=society_id, user=request.user, status='ACTIVE'
        ).exists()
        if not is_member:
            return Response({"error": "Not a member."}, status=status.HTTP_403_FORBIDDEN)

        serializer = SocietyMessageSerializer(
            data=request.data,
            context={'society_id': society_id, 'user': request.user}
        )
        if serializer.is_valid():
            message = serializer.save()
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"society_{society_id}",
                {
                    "type": "society_message",
                    "message": SocietyMessageSerializer(message).data
                }
            )
            return Response(SocietyMessageSerializer(message).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class EditSocietyMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, society_id, message_id):
        try:
            message = SocietyMessage.objects.get(message_id=message_id, society__society_id=society_id, user=request.user)
        except SocietyMessage.DoesNotExist:
            return Response({"error": "Message not found or not yours."}, status=status.HTTP_404_NOT_FOUND)

        serializer = SocietyMessageSerializer(message, data=request.data, partial=True, context={'society_id': society_id, 'user': request.user})
        if serializer.is_valid():
            message = serializer.save()
            return Response(SocietyMessageSerializer(message).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteSocietyMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, society_id, message_id):
        try:
            message = SocietyMessage.objects.get(message_id=message_id, society__society_id=society_id)
        except SocietyMessage.DoesNotExist:
            return Response({"error": "Message not found."}, status=status.HTTP_404_NOT_FOUND)

        if message.user != request.user and not SocietyMember.objects.filter(
            society__society_id=society_id, user=request.user, role='admin'
        ).exists():
            return Response({"error": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        message.status = 'DELETED'
        message.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class SocietyMessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, society_id):
        is_member = SocietyMember.objects.filter(
            society__society_id=society_id, user=request.user, status='ACTIVE'
        ).exists()
        if not is_member:
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        cache_key = f"society_messages_{society_id}_{request.query_params}"
        cached_response = cache.get(cache_key)
        
        if cached_response:
            # Return the cached response directly
            return Response(cached_response)

        messages = SocietyMessage.objects.filter(
            society__society_id=society_id, status='ACTIVE'
        ).select_related('user', 'book').order_by('-is_pinned', '-created_at')

        paginator = PageNumberPagination()
        paginated_messages = paginator.paginate_queryset(messages, request)
        serializer = SocietyMessageSerializer(paginated_messages, many=True)
        
        # Get the paginated response
        response = paginator.get_paginated_response(serializer.data)
        
        # Cache the response data
        cache.set(cache_key, response.data, timeout=300)
        
        return response

class PinMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, society_id, message_id):
        is_admin = SocietyMember.objects.filter(
            society__society_id=society_id, user=request.user, role='admin'
        ).exists()
        if not is_admin:
            return Response({"error": "Admins only."}, status=status.HTTP_403_FORBIDDEN)

        try:
            message = SocietyMessage.objects.get(message_id=message_id, society__society_id=society_id)
            message.is_pinned = True
            message.save()
            notification = Notification.objects.create(
                user=message.user,
                type='message_pinned',
                message=f"Your message in {message.society.name} was pinned.",
                content_type='society_message',
                content_id=message.message_id
            )
            # Send notification via WebSocket to the message owner's group
            send_notification_to_user(
                message.user.user_id,
                {
                    "notification_id": str(notification.notification_id),
                    "message": f"Your message in {message.society.name} was pinned.",
                    "type": "message_pinned",
                    "content_type": "society_message",
                    "content_id": str(message.message_id),
                    "follow_id": None
                }
            )
            return Response({
                "message_id": str(message.message_id),
                "is_pinned": message.is_pinned
            }, status=status.HTTP_200_OK)
        except SocietyMessage.DoesNotExist:
            return Response({"error": "Message not found."}, status=status.HTTP_404_NOT_FOUND)