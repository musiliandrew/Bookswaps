from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework.views import APIView
from .serializers import (
    RegisterSerializer, LoginSerializer, UserProfileSerializer,
    UpdateProfileSerializer, DeleteAccountSerializer, FollowSerializer,
    UserSearchSerializer
)
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth import password_validation
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.conf import settings
from .models import CustomUser, Follows
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import ValidationError
from django.db.models import Q
from django_redis import get_redis_connection
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

class RegisterView(generics.CreateAPIView):
    """Register a new user and return JWT token."""
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            "user_id": str(user.user_id),
            "username": user.username,
            "email": user.email,
            "token": str(refresh.access_token)
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Authenticate user and return JWT token."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)

        return Response({
            "user_id": str(user.user_id),
            "username": user.username,
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh)
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """Blacklist refresh token to log out user."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        except KeyError:
            return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
        except TokenError:
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        user = CustomUser.objects.filter(email=email).first()
        if user:
            token_generator = PasswordResetTokenGenerator()
            token = token_generator.make_token(user)
            uidb64 = urlsafe_base64_encode(force_bytes(user.user_id))

            reset_link = f"{settings.FRONTEND_URL}/reset-password/{uidb64}/{token}/"
            try:
                send_mail(
                    subject="Password Reset",
                    message=f"Use the link to reset your password: {reset_link}",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
            except Exception as e:
                return Response({"error": f"Failed to send email: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "Reset link sent"}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """Confirm password reset with token and update password."""
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("password")

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(user_id=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response({"error": "Invalid user"}, status=status.HTTP_400_BAD_REQUEST)

        token_generator = PasswordResetTokenGenerator()
        if token_generator.check_token(user, token):
            password_validation.validate_password(new_password, user)
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password updated"}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, identifier):
        try:
            # Try username first
            user = CustomUser.objects.get(username=identifier)
        except CustomUser.DoesNotExist:
            try:
                # Fallback to user_id
                user = CustomUser.objects.get(user_id=identifier)
            except (CustomUser.DoesNotExist, ValueError):
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            user.clean()
        except ValidationError as e:
            return Response({"error": f"Invalid user data: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.profile_public and (not request.user.is_authenticated or request.user != user):
            return Response({"detail": "Profile is private"}, status=status.HTTP_403_FORBIDDEN)

        serializer = UserProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateProfileView(APIView):
    """Update authenticated user's profile."""
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        serializer = UpdateProfileSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class DeleteAccountView(APIView):
    """Soft delete authenticated user's account."""
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        serializer = DeleteAccountSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        # Soft deletion for GDPR compliance
        user.is_active = False
        user.email = f"deleted_{user.user_id}@bookswap.com"
        user.username = f"deleted_{user.user_id}"
        user.save()

        send_mail(
            'Account Deletion Confirmation',
            'Your account has been successfully deleted.',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=True,
        )

        return Response(status=status.HTTP_204_NO_CONTENT)

class FollowUserView(APIView):
    """Follow a user and send WebSocket notification."""
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        serializer = FollowSerializer(
            data={'followed_id': user_id, 'source': request.data.get('source', 'Search')},
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        follow = serializer.save()

        # Send WebSocket notification
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"user_{follow.followed.user_id}",
                {
                    'type': 'notification',
                    'message': f"{request.user.username} started following you",
                    'follow_id': str(follow.follow_id)
                }
            )
        else:
            print("Warning: Channel layer not available, skipping WebSocket notification")

        return Response({
            "follow_id": str(follow.follow_id),
            "follower": request.user.username,
            "followed": follow.followed.username,
            "is_mutual": follow.is_mutual
        }, status=status.HTTP_201_CREATED)

class UnfollowUserView(APIView):
    """Soft unfollow a user."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        try:
            followed_user = CustomUser.objects.get(user_id=user_id)
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        follow = Follows.objects.filter(follower=request.user, followed=followed_user, active=True).first()
        if not follow:
            return Response({"detail": "You are not following this user"}, status=status.HTTP_400_BAD_REQUEST)

        follow.active = False
        follow.save()

        return Response(status=status.HTTP_204_NO_CONTENT)


class CustomPagination(PageNumberPagination):
    """Pagination for follower/following lists."""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class FollowersFollowingView(APIView):
    """List followers or following with pagination."""
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = CustomUser.objects.get(user_id=user_id)
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if not user.profile_public and (not request.user.is_authenticated or request.user != user):
            return Response({"detail": "Profile is private"}, status=status.HTTP_403_FORBIDDEN)

        if 'followers' in request.path:
            follows = Follows.objects.filter(followed=user, active=True)
            users = [follow.follower for follow in follows]
        elif 'following' in request.path:
            follows = Follows.objects.filter(follower=user, active=True)
            users = [follow.followed for follow in follows]
        else:
            return Response({"detail": "Invalid endpoint"}, status=status.HTTP_400_BAD_REQUEST)

        paginator = CustomPagination()
        result_page = paginator.paginate_queryset(users, request)
        serializer = UserSearchSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)


class FollowStatusView(APIView):
    """Check follow and mutual status between users."""
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = CustomUser.objects.get(user_id=user_id)
            other_user_id = request.query_params.get('other_user_id')
            if not other_user_id:
                return Response({"detail": "other_user_id query parameter required"}, status=status.HTTP_400_BAD_REQUEST)
            other_user = CustomUser.objects.get(user_id=other_user_id)
        except CustomUser.DoesNotExist:
            return Response({"detail": "One or both users not found"}, status=status.HTTP_404_NOT_FOUND)

        is_following = Follows.objects.filter(follower=user, followed=other_user, active=True).exists()
        is_mutual = is_following and Follows.objects.filter(follower=other_user, followed=user, active=True).exists()

        return Response({
            "is_following": is_following,
            "is_mutual": is_mutual
        }, status=status.HTTP_200_OK)


class UpdateChatPreferencesView(APIView):
    """Update user's chat preferences."""
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        chat_preferences = request.data.get('chat_preferences')
        if not isinstance(chat_preferences, dict):
            raise ValidationError({"detail": "chat_preferences must be a JSON object"})

        for key, value in chat_preferences.items():
            if key == "location_enabled" and not isinstance(value, bool):
                raise ValidationError({"detail": "location_enabled must be a boolean"})
            if key == "mute_societies" and not isinstance(value, list):
                raise ValidationError({"detail": "mute_societies must be a list"})

        user.chat_preferences = chat_preferences
        user.save()

        return Response({
            "user_id": str(user.user_id),
            "username": user.username,
            "chat_preferences": user.chat_preferences
        }, status=status.HTTP_200_OK)


class UpdateAccountSettingsView(APIView):
    """Update user's account settings (email, password, privacy)."""
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        new_email = request.data.get('email')
        new_password = request.data.get('password')
        profile_public = request.data.get('profile_public')
        email_notifications = request.data.get('email_notifications')

        if new_email and CustomUser.objects.filter(email=new_email).exclude(user_id=user.user_id).exists():
            raise ValidationError({"detail": "Email address is already in use"})

        if new_password:
            password_validation.validate_password(new_password, user)
            user.set_password(new_password)

        if new_email:
            user.email = new_email
        if profile_public is not None:
            user.profile_public = profile_public
        if email_notifications is not None:
            user.email_notifications = email_notifications

        user.save()

        return Response({
            "user_id": str(user.user_id),
            "username": user.username,
            "email": user.email,
            "profile_public": user.profile_public,
            "email_notifications": user.email_notifications
        }, status=status.HTTP_200_OK)


class SearchUsersView(APIView):
    """Search users by username, city, or genres with caching."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get('q', '').strip()
        if not query:
            return Response([], status=status.HTTP_200_OK)

        redis = get_redis_connection('default')
        cache_key = f"search_users:{query.lower()}"
        cached = redis.get(cache_key)
        if cached:
            return Response(json.loads(cached), status=status.HTTP_200_OK)

        users = CustomUser.objects.filter(
            Q(username__icontains=query) | Q(city__icontains=query) | Q(genres__contains=query),
            profile_public=True, is_active=True
        ).exclude(user_id=request.user.user_id)[:10]

        serializer = UserSearchSerializer(users, many=True)
        redis.setex(cache_key, 300, json.dumps(serializer.data))
        return Response(serializer.data, status=status.HTTP_200_OK)


class RecommendedUsersView(APIView):
    """Recommend users based on shared genres or city."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        recommended = CustomUser.objects.filter(
            Q(genres__overlap=user.genres) | Q(city=user.city),
            profile_public=True, is_active=True
        ).exclude(user_id=user.user_id).exclude(
            user_id__in=Follows.objects.filter(follower=user, active=True).values('followed__user_id')
        )[:5]

        serializer = UserSearchSerializer(recommended, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)