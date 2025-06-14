from rest_framework import generics, status, permissions, serializers
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework.views import APIView
from .serializers import (
    RegisterSerializer, LoginSerializer, UserProfileSerializer,
    UpdateProfileSerializer, DeleteAccountSerializer, FollowSerializer,
    UserSearchSerializer, TokenRefreshSerializer
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
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.db.models import Q
from django_redis import get_redis_connection
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
import logging

logger = logging.getLogger(__name__)

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        data = {
            'user_id': str(user.user_id),
            'username': user.username,
            'email': user.email,
            'token': str(refresh.access_token),
            'refresh': str(refresh),
        }
        logger.info(f"User registered: {user.username} ({user.user_id})")
        return Response(data, status=status.HTTP_201_CREATED)

class CustomTokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        if settings.DEBUG:
            logger.debug(f"Refresh request headers: {request.headers}")
            logger.debug(f"Refresh request data: {request.data}")
        serializer = TokenRefreshSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except InvalidToken as e:
            logger.error(f"Token refresh failed: {str(e)}")
            return Response({'detail': str(e), 'code': 'token_not_valid'}, status=status.HTTP_401_UNAUTHORIZED)
        except serializers.ValidationError as e:
            logger.error(f"Validation error: {str(e)}")
            return Response({'detail': str(e), 'code': 'validation_error'}, status=status.HTTP_400_BAD_REQUEST)
        refresh_token = serializer.validated_data['refresh_token']
        try:
            new_access_token = str(refresh_token.access_token)
            response_data = {'access': new_access_token}
            if getattr(settings, 'SIMPLE_JWT', {}).get('ROTATE_REFRESH_TOKENS', False):
                refresh_token.set_jti()
                refresh_token.set_exp()
                response_data['refresh'] = str(refresh_token)
            logger.info("Successfully issued new access token")
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error generating new token: {str(e)}")
            return Response(
                {'detail': 'Error processing token', 'code': 'token_error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if settings.DEBUG:
            logger.debug(f"Login request headers: {request.headers}")
        safe_data = request.data.copy()
        safe_data.pop('password', None)
        logger.info(f"Login request data: {safe_data}")
        
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        logger.info(f"Generated tokens for user {user.username}: user_id={user.user_id}")
        return Response({
            "user_id": str(user.user_id),
            "username": user.username,
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "token": str(refresh.access_token),  # For backward compatibility
            "refresh": str(refresh)             # For backward compatibility
        }, status=status.HTTP_200_OK)

class LogoutView(APIView):
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
            user = CustomUser.objects.get(username=identifier)
        except CustomUser.DoesNotExist:
            try:
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
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if settings.DEBUG:
            logger.debug(f"Profile request headers: {request.headers}")
        try:
            user = request.user
            serializer = UserProfileSerializer(user, context={'request': request})  # Add request to context
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Profile request failed: {str(e)}")
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        user = request.user
        serializer = UpdateProfileSerializer(
            user, 
            data=request.data, 
            partial=True,
            context={'request': request}  # Add request to context
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        if settings.DEBUG:
            logger.debug(f"Delete account request headers: {request.headers}")
            logger.debug(f"Delete account request data: {request.data}")
        serializer = DeleteAccountSerializer(data=request.data, context={'request': request})
        try:
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError as e:
            logger.error(f"Delete account validation failed: {str(e)}")
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.validated_data['user']
        logger.info(f"Soft deleting account for user_id={user.user_id}")
        user.is_active = False
        user.email = f"deleted_{user.user_id}@bookswap.com"
        user.username = f"deleted_{user.user_id}"
        user.save()
        try:
            send_mail(
                'Account Deletion Confirmation',
                'Your BookSwap account has been successfully deleted. Thank you for using our platform!',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=True,
            )
            logger.info(f"Deletion confirmation email sent to deleted_{user.user_id}@bookswap.com")
        except Exception as e:
            logger.error(f"Failed to send deletion confirmation email: {str(e)}")
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class FollowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        try:
            followed_user = CustomUser.objects.get(user_id=user_id)
            
            serializer = FollowSerializer(
                data={
                    'followed_id': user_id,
                    'source': request.data.get('source', 'Search')
                },
                context={'request': request}
            )
            serializer.is_valid(raise_exception=True)
            
            follow = serializer.save()
            
            # Invalidate cache for both users
            redis = get_redis_connection('default')
            redis.delete(f'followers_count:{followed_user.user_id}')
            redis.delete(f'following_count:{request.user.user_id}')
            
            # WebSocket notification
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f"user_{follow.followed.user_id}",
                    {
                        'type': 'notification',
                        'message': f"{request.user.username} started following you",
                        'follow_id': str(follow.follow_id),
                        'user_id': str(follow.followed.user_id)
                    }
                )
            
            return Response({
                "follow_id": str(follow.follow_id),
                "follower": request.user.username,
                "followed": follow.followed.username,
                "is_mutual": follow.is_mutual,
                "followers_count": Follows.objects.filter(followed=followed_user, active=True).count(),
                "following_count": Follows.objects.filter(follower=request.user, active=True).count()
            }, status=status.HTTP_201_CREATED)
            
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in FollowUserView: {str(e)}")
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
class UnfollowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        try:
            followed_user = CustomUser.objects.get(user_id=user_id)
            follow = Follows.objects.filter(
                follower=request.user, 
                followed=followed_user, 
                active=True
            ).first()
            
            if not follow:
                return Response(
                    {"detail": "You are not following this user"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            follow.active = False
            follow.save()
            
            # Update mutual status for reverse follow if it exists
            reverse_follow = Follows.objects.filter(
                follower=followed_user,
                followed=request.user,
                active=True
            ).first()
            
            if reverse_follow:
                reverse_follow.is_mutual = False
                reverse_follow.save(update_fields=['is_mutual'])
            
            # Invalidate cache
            redis = get_redis_connection('default')
            redis.delete(f'followers_count:{followed_user.user_id}')
            redis.delete(f'following_count:{request.user.user_id}')
            
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class RemoveFollowerView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        try:
            follower_user = CustomUser.objects.get(user_id=user_id)
            follow = Follows.objects.filter(
                follower=follower_user,
                followed=request.user,
                active=True
            ).first()
            
            if not follow:
                return Response(
                    {"detail": "This user is not following you"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            follow.active = False
            follow.save()
            
            # Update mutual status for reverse follow if it exists
            reverse_follow = Follows.objects.filter(
                follower=request.user,
                followed=follower_user,
                active=True
            ).first()
            
            if reverse_follow:
                reverse_follow.is_mutual = False
                reverse_follow.save(update_fields=['is_mutual'])
            
            # Invalidate cache
            redis = get_redis_connection('default')
            redis.delete(f'followers_count:{request.user.user_id}')
            redis.delete(f'following_count:{follower_user.user_id}')
            
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class FollowersFollowingView(APIView):
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
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get('q', '').strip()
        if not query:
            return Response([], status=status.HTTP_200_OK)
        
        redis = get_redis_connection('default')
        cache_key = f"search_users:{request.user.user_id}:{query.lower()}"
        cached = redis.get(cache_key)
        
        if cached:
            return Response(json.loads(cached), status=status.HTTP_200_OK)
            
        users = CustomUser.objects.filter(
            Q(username__icontains=query) | 
            Q(city__icontains=query) | 
            Q(genres__contains=query),
            profile_public=True, 
            is_active=True
        ).exclude(user_id=request.user.user_id).order_by('username')[:10]
        
        serializer = UserSearchSerializer(users, many=True, context={'request': request})
        redis.setex(cache_key, 300, json.dumps(serializer.data))
        return Response({
            'results': serializer.data,
            'count': len(serializer.data),
            'next': None,
            'previous': None
        }, status=status.HTTP_200_OK)

class RecommendedUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Get IDs of users the current user is already following
        following_ids = Follows.objects.filter(
            follower=user,
            active=True
        ).values_list('followed__user_id', flat=True)
        
        recommended = CustomUser.objects.filter(
            Q(genres__overlap=user.genres) | Q(city=user.city),
            profile_public=True,
            is_active=True
        ).exclude(
            user_id__in=following_ids  # Exclude already followed users
        ).exclude(
            user_id=user.user_id  # Exclude self
        ).distinct()[:5]
        
        if not recommended:
            # Fallback to random public users if no recommendations
            recommended = CustomUser.objects.filter(
                profile_public=True,
                is_active=True
            ).exclude(
                user_id__in=following_ids
            ).exclude(
                user_id=user.user_id
            ).order_by('?')[:5]  # Random order
            
        serializer = UserSearchSerializer(recommended, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)