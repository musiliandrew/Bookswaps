from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.response import Response
from rest_framework import status
from .models import Chats, SocietyMembers, Societies, SocietyMessages
from users.models import CustomUser, Follows
from .serializers import ChatSerializer, ChatReadStatusSerializer, SocietyCreateSerializer, SocietySerializer, SocietyMessageSerializer
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        receiver_id = request.data.get('receiver_id')

        try:
            receiver = CustomUser.objects.get(user_id=receiver_id)
        except CustomUser.DoesNotExist:
            return Response({"error": "Receiver not found."}, status=status.HTTP_404_NOT_FOUND)

        # Follow gating logic (upgradeable later to mutual follow check)
        if not Follows.objects.filter(follower=request.user, followed=receiver).exists():
            return Response({"error": "You must follow the user to send messages."}, status=status.HTTP_403_FORBIDDEN)

        serializer = ChatSerializer(data=request.data, context={'sender': request.user})
        if serializer.is_valid():
            chat = serializer.save()
            return Response(ChatSerializer(chat).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        chats = Chats.objects.filter(Q(sender=user) | Q(receiver=user)).select_related('sender', 'receiver', 'book')

        receiver_id = request.query_params.get('receiver_id')
        unread = request.query_params.get('unread')

        if receiver_id:
            chats = chats.filter(
                Q(sender__user_id=receiver_id, receiver=user) |
                Q(receiver__user_id=receiver_id, sender=user)
            )

        if unread == 'true':
            chats = chats.filter(status__in=['Sent', 'Received'], receiver=user)

        chats = chats.order_by('-created_at')
        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(chats, request)
        serializer = ChatSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
class MarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, chat_id):
        # Fetch the chat message by chat_id and verify the receiver
        try:
            chat = Chats.objects.get(chat_id=chat_id, receiver=request.user)
        except Chats.DoesNotExist:
            raise NotFound("Chat not found or you're not the intended recipient.")

        # Mark the message as read
        chat.status = 'Read'
        chat.save()

        # Serialize the response
        serializer = ChatReadStatusSerializer(chat)
        return Response(serializer.data)
    
class CreateSocietyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SocietyCreateSerializer(data=request.data)

        if serializer.is_valid():
            # Validate that the user is authenticated
            creator = request.user

            # Save the society instance
            society = serializer.save(creator=creator)

            # Add the creator as a member with the 'Admin' role
            SocietyMembers.objects.create(society=society, user=creator, role='Admin', is_creator=True)

            # Serialize and return the created society data
            society_data = SocietySerializer(society).data
            return Response(society_data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class JoinSocietyView(APIView):
    permission_classes = [IsAuthenticated]  # Ensures only authenticated users can join societies.

    def post(self, request, society_id):
        # Fetch the society using the provided ID
        society = get_object_or_404(Societies, society_id=society_id)

        # Check if society is public or if an invitation is required (future feature)
        if not society.is_public:
            return Response({"error": "Private society. Join by invitation only."}, status=status.HTTP_403_FORBIDDEN)

        # Prevent the user from joining the society more than once
        member, created = SocietyMembers.objects.get_or_create(
            society=society,
            user=request.user,
            defaults={'role': 'Member'}
        )
        
        if not created:  # If the user is already a member, no need to create another membership
            return Response({"error": "User is already a member of this society."}, status=status.HTTP_400_BAD_REQUEST)

        # Return success response with member details
        return Response({
            "member_id": str(member.member_id),
            "society_id": str(society.society_id),
            "user": {
                "user_id": str(request.user.user_id),
                "username": request.user.username
            }
        }, status=status.HTTP_201_CREATED)
        
class LeaveSocietyView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, society_id):
        # Check if the user is a member of the society
        try:
            member = SocietyMembers.objects.get(society__society_id=society_id, user=request.user)
        except SocietyMembers.DoesNotExist:
            return Response({"error": "You are not a member of this society."}, status=status.HTTP_404_NOT_FOUND)

        # Prevent creator from leaving the society unless they are the last member
        society = member.society
        if society.creator == request.user and society.societymembers_set.count() > 1:
            return Response({"error": "Creator cannot leave unless they are the last member."}, status=status.HTTP_400_BAD_REQUEST)

        # Delete the user from the society
        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class SocietyListView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        user = request.user if request.user.is_authenticated else None
        focus_type = request.query_params.get('focus_type')
        focus_id = request.query_params.get('focus_id')
        my_societies = request.query_params.get('my_societies') == 'true'

        societies = Societies.objects.all()

        if my_societies and user:
            societies = societies.filter(societymembers__user=user)
        else:
            societies = societies.filter(Q(is_public=True) | Q(societymembers__user=user))

        if focus_type:
            societies = societies.filter(focus_type=focus_type)
        if focus_id:
            societies = societies.filter(focus_id=focus_id)

        societies = societies.distinct()

        paginator = PageNumberPagination()
        paginated = paginator.paginate_queryset(societies, request)
        serializer = SocietySerializer(paginated, many=True)
        return paginator.get_paginated_response(serializer.data)
    
class SendSocietyMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, society_id):
        user = request.user

        # Check membership
        is_member = SocietyMembers.objects.filter(
            society__society_id=society_id, user=user
        ).exists()

        if not is_member:
            return Response({"error": "Not a member of this society."}, status=status.HTTP_403_FORBIDDEN)

        serializer = SocietyMessageSerializer(
            data=request.data,
            context={'society_id': society_id, 'user': user}
        )

        if serializer.is_valid():
            message = serializer.save()
            return Response(SocietyMessageSerializer(message).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class SocietyMessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, society_id):
        # Step 1: Access control – verify user is a member
        is_member = SocietyMembers.objects.filter(
            society__society_id=society_id,
            user=request.user,
            status='Active'  # Optional filter if you want to exclude banned/removed
        ).exists()

        if not is_member:
            return Response({"error": "Access denied. User is not a member of this society."},
                            status=status.HTTP_403_FORBIDDEN)

        # Step 2: Fetch messages with pinned ones first
        messages = SocietyMessages.objects.filter(
            society__society_id=society_id
        ).select_related('user', 'book').order_by('-is_pinned', '-created_at')

        # Step 3: Paginate results
        paginator = PageNumberPagination()
        paginated_messages = paginator.paginate_queryset(messages, request)

        # Step 4: Serialize data
        serializer = SocietyMessageSerializer(paginated_messages, many=True)

        return paginator.get_paginated_response(serializer.data)
    
class PinMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, society_id, message_id):
        try:
            # Verify that the user is an Admin of the society
            is_admin = SocietyMembers.objects.filter(
                society__society_id=society_id,
                user=request.user,
                role='Admin'
            ).exists()

            if not is_admin:
                return Response({"error": "Admins only"}, status=status.HTTP_403_FORBIDDEN)

            # Fetch and update the message
            message = SocietyMessages.objects.get(
                message_id=message_id,
                society__society_id=society_id
            )
            message.is_pinned = True
            message.save()

            return Response({
                "message_id": str(message.message_id),
                "is_pinned": message.is_pinned
            }, status=status.HTTP_200_OK)

        except SocietyMessages.DoesNotExist:
            return Response({"error": "Message not found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class SocietyListView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        societies = Societies.objects.all()

        # Filter for user's societies
        if request.query_params.get('my_societies') == 'true' and request.user.is_authenticated:
            societies = societies.filter(members__user=request.user)
        else:
            societies = societies.filter(is_public=True)

        # Optional filtering
        focus_type = request.query_params.get('focus_type')
        if focus_type:
            societies = societies.filter(focus_type=focus_type)

        focus_id = request.query_params.get('focus_id')
        if focus_id:
            societies = societies.filter(focus_id=focus_id)

        # Pagination
        paginator = PageNumberPagination()
        paginator.page_size = 10
        paginated = paginator.paginate_queryset(societies, request)
        serializer = SocietySerializer(paginated, many=True)

        return paginator.get_paginated_response(serializer.data)