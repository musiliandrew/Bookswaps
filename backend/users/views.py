from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import RegisterSerializer, UserProfileSerializer, LoginSerializer, UpdateProfileSerializer, FollowSerializer, UserSearchSerializer
from rest_framework.views import APIView
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth import password_validation
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.core.mail import send_mail
from django.conf import settings
from .models import CustomUser, Follows
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import ValidationError
from django.db.models import Q

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # JWT token generation
        refresh = RefreshToken.for_user(user)

        return Response({
            "user_id": str(user.user_id),
            "username": user.username,
            "email": user.email,
            "token": str(refresh.access_token)
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)

        return Response({
            "user_id": str(user.user_id),
            "username": user.username,
            "token": str(refresh.access_token)
        }, status=status.HTTP_200_OK)
        
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

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
    def post(self, request):
        email = request.data.get("email")
        user = CustomUser.objects.filter(email=email).first()
        if user:
            token_generator = PasswordResetTokenGenerator()
            token = token_generator.make_token(user)
            uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

            reset_link = f"{settings.FRONTEND_URL}/reset-password/{uidb64}/{token}/"

            send_mail(
                subject="Password Reset",
                message=f"Use the link to reset your password: {reset_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

        # Security: Always return success response (prevent email fishing)
        return Response({"message": "Reset link sent"}, status=status.HTTP_200_OK)
    
class PasswordResetConfirmView(APIView):
    def post(self, request):
        uidb64 = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("password")

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response({"error": "Invalid user"}, status=status.HTTP_400_BAD_REQUEST)

        token_generator = PasswordResetTokenGenerator()

        if token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password updated"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)
class UserProfileView(APIView):
    permission_classes = [AllowAny]  # Publicly visible

    def get(self, request, identifier):
        user = None
        # Try fetching by UUID
        try:
            user = CustomUser.objects.get(id=identifier)
        except (CustomUser.DoesNotExist, ValueError):
            # Try fetching by username fallback
            user = get_object_or_404(CustomUser, username=identifier)

        serializer = UserProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user  # The authenticated user
        serializer = UpdateProfileSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()  # Save changes to the user
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        confirm = request.data.get("confirm", False)

        if not confirm:
            return Response({"detail": "Confirmation required"}, status=status.HTTP_400_BAD_REQUEST)

        # Option 1: Soft delete (deactivate the user)
        # user.is_active = False
        # user.save()

        # Option 2: Hard delete (delete the user)
        # Deleting the user cascades and deletes related Follows as well.
        user.delete()

        # Optional: Send an email notification after account deletion
        send_mail(
            'Account Deletion Confirmation',
            'Your account has been successfully deleted.',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )

        return Response(status=status.HTTP_204_NO_CONTENT)
    
class FollowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        # Get the user to be followed
        try:
            followed_user = CustomUser.objects.get(user_id=user_id)
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Prevent self-follow
        if request.user.user_id == followed_user.user_id:
            return Response({"detail": "You cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if follow relationship already exists
        if Follows.objects.filter(follower=request.user, followed=followed_user).exists():
            return Response({"detail": "You are already following this user."}, status=status.HTTP_400_BAD_REQUEST)

        # Create a new follow relationship
        follow = Follows.objects.create(follower=request.user, followed=followed_user)

        # Return the response
        return Response({
            "follow_id": str(follow.follow_id),
            "follower": request.user.username,
            "followed": followed_user.username
        }, status=status.HTTP_201_CREATED)
        
class UnfollowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        # Get the user to be unfollowed
        try:
            followed_user = CustomUser.objects.get(user_id=user_id)
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if the user is following the target user
        follow_relation = Follows.objects.filter(follower=request.user, followed=followed_user)

        # If no follow relationship exists, return error
        if not follow_relation.exists():
            return Response({"detail": "You are not following this user."}, status=status.HTTP_400_BAD_REQUEST)

        # Delete the follow relationship
        follow_relation.delete()

        # Return response (No content, but you can return a message if needed)
        return Response({}, status=status.HTTP_204_NO_CONTENT)
    
class CustomPagination(PageNumberPagination):
    page_size = 10  # Set the number of items per page
    page_size_query_param = 'page_size'
    max_page_size = 100

class FollowersFollowingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        # Try to get the user whose followers or following we need to fetch
        try:
            user = CustomUser.objects.get(user_id=user_id)
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        # Determine which list to fetch based on the request
        if 'followers' in request.path:
            # Fetch followers of the user
            follows = Follows.objects.filter(followed=user)
            user_list = follows.values('follower__user_id', 'follower__username')
        elif 'following' in request.path:
            # Fetch users the user is following
            follows = Follows.objects.filter(follower=user)
            user_list = follows.values('followed__user_id', 'followed__username')
        else:
            return Response({"detail": "Invalid endpoint."}, status=status.HTTP_400_BAD_REQUEST)

        # Paginate the result
        paginator = CustomPagination()
        result_page = paginator.paginate_queryset(user_list, request)
        
        # Return the paginated response
        return paginator.get_paginated_response(result_page)
    
class FollowStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        # Get the other_user_id from query parameters
        other_user_id = request.query_params.get('other_user_id')

        # Ensure both user_id and other_user_id are provided
        if not other_user_id:
            return Response({"detail": "other_user_id query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(user_id=user_id)
            other_user = CustomUser.objects.get(user_id=other_user_id)
        except CustomUser.DoesNotExist:
            return Response({"detail": "One or both users not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if user is following other_user
        is_following = Follows.objects.filter(follower=user, followed=other_user, active=True).exists()

        # Check if other_user is following user (mutual follow check)
        is_mutual = Follows.objects.filter(follower=other_user, followed=user, active=True).exists() and is_following

        # Prepare the response data
        follow_status = {
            "is_following": is_following,
            "is_mutual": is_mutual
        }

        return Response(follow_status, status=status.HTTP_200_OK)
    
class UpdateChatPreferencesView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user  # Get the authenticated user
        chat_preferences = request.data.get('chat_preferences')

        # Validate chat_preferences structure
        if not isinstance(chat_preferences, dict):
            raise ValidationError({"detail": "chat_preferences must be a JSON object."})
        
        location_enabled = chat_preferences.get("location_enabled")
        mute_societies = chat_preferences.get("mute_societies")

        # Validate location_enabled
        if location_enabled is not None and not isinstance(location_enabled, bool):
            raise ValidationError({"detail": "location_enabled must be a boolean."})

        # Validate mute_societies (should be a list)
        if mute_societies is not None and not isinstance(mute_societies, list):
            raise ValidationError({"detail": "mute_societies must be a list."})

        # Update chat_preferences for the user
        user.chat_preferences = chat_preferences
        user.save()

        # Return updated user data
        return Response({
            "user_id": str(user.user_id),
            "username": user.username,
            "chat_preferences": user.chat_preferences
        }, status=status.HTTP_200_OK)
        
class UpdateAccountSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user  # Get the authenticated user
        new_email = request.data.get('email')
        new_password = request.data.get('password')

        # Validate email uniqueness
        if new_email:
            if CustomUser.objects.filter(email=new_email).exists():
                raise ValidationError({"detail": "Email address is already in use."})

        # If password is provided, hash it and validate
        if new_password:
            try:
                password_validation.validate_password(new_password, user)
            except ValidationError as e:
                raise ValidationError({"detail": str(e)})

            user.set_password(new_password)  # Hash the new password

        # Update user fields
        if new_email:
            user.email = new_email

        # Save updated user
        user.save()

        # Return updated user data
        return Response({
            "user_id": str(user.user_id),
            "username": user.username,
            "email": user.email
        }, status=status.HTTP_200_OK)
        
class SearchUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get('q', '').strip()
        if not query:
            return Response([], status=status.HTTP_200_OK)
        
        users = CustomUser.objects.filter(
            Q(username__icontains=query)
        ).exclude(id=request.user.id)[:10]  # Limit results
        
        serializer = UserSearchSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)