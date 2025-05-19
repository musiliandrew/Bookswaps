from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import CustomUser, Follows
from django_redis import get_redis_connection
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
import logging

logger = logging.getLogger(__name__)

class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['user_id', 'username', 'profile_picture']
        read_only_fields = ['user_id', 'username', 'profile_picture']


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=CustomUser.objects.all())]
    )
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    genres = serializers.ListField(
        child=serializers.CharField(), allow_empty=True, required=False
    )  # List for JSONField

    class Meta:
        model = CustomUser
        fields = ('user_id', 'username', 'email', 'password', 'city', 'genres', 'age', 'country', 'profile_public')
        read_only_fields = ('user_id',)

    def create(self, validated_data):
        chat_prefs_default = {"location_enabled": False}
        genres = validated_data.pop('genres', [])  # Default to empty list

        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            city=validated_data.get('city', None),  # Use None for optional CharField
            genres=genres,
            chat_preferences=chat_prefs_default,
            age=validated_data.get('age', None),
            country=validated_data.get('country', None),
            profile_public=validated_data.get('profile_public', True)
        )
        return user

class TokenRefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, attrs):
        refresh_token = attrs.get('refresh')
        if not refresh_token:
            raise serializers.ValidationError('Refresh token is required', code='missing_refresh')

        try:
            token = RefreshToken(refresh_token)
            token.check_blacklist()
            token.verify()
        except TokenError as e:
            logger.error(f"Token validation failed: {str(e)}")
            raise InvalidToken('Token is invalid or expired')
        
        attrs['refresh_token'] = token
        return attrs

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        # Get request from the context, which is passed from the view
        request = self.context.get('request')
        if not request:
            raise serializers.ValidationError("Request is required for authentication")
            
        identifier = data.get('username')
        password = data.get('password')

        # Find user by username or email
        user = CustomUser.objects.filter(email=identifier).first() or CustomUser.objects.filter(username=identifier).first()
        
        if user:
            # Pass the request object to authenticate for Axes to work
            user = authenticate(request=request, username=user.username, password=password)
            
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")

        # Update last_active and last_login
        user.last_active = timezone.now()
        user.last_login = timezone.now()
        user.save(update_fields=['last_active', 'last_login'])

        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['user_id', 'username', 'profile_picture']  # Fixed field names
        extra_kwargs = {'user_id': {'source': 'user_id'}}  # Map id to user_id


class UserProfileSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'user_id', 'username', 'city', 'country', 'age', 'about_you',
            'genres', 'profile_picture', 'profile_public', 'email_notifications',
            'followers_count', 'following_count', 'created_at', 'last_active'
        ]
        extra_kwargs = {}

    def get_followers_count(self, obj):
        # Cache count in Redis for performance
        from django_redis import get_redis_connection
        redis = get_redis_connection('default')
        cache_key = f'followers_count:{obj.user_id}'
        count = redis.get(cache_key)
        if count is None:
            count = Follows.objects.filter(followed=obj, active=True).count()
            redis.setex(cache_key, 3600, count)  # Cache for 1 hour
        return int(count)

    def get_following_count(self, obj):
        redis = get_redis_connection('default')
        cache_key = f'following_count:{obj.user_id}'
        count = redis.get(cache_key)
        if count is None:
            count = Follows.objects.filter(follower=obj, active=True).count()
            redis.setex(cache_key, 3600, count)
        return int(count)


class UpdateProfileSerializer(serializers.ModelSerializer):
    genres = serializers.ListField(
        child=serializers.CharField(), allow_empty=True, required=False
    )

    class Meta:
        model = CustomUser
        fields = [
            'city', 'country', 'age', 'about_you', 'genres',
            'profile_picture', 'profile_public', 'email_notifications'
        ]

    def validate_profile_picture(self, value):
        # Validate S3 URL (example pattern)
        if value and not value.startswith('https://bookswap-bucket.s3.'):
            raise serializers.ValidationError("Profile picture must be a valid S3 URL.")
        return value

    def validate_age(self, value):
        if value is not None and value < 13:
            raise serializers.ValidationError("Users must be at least 13 years old.")
        return value


class DeleteAccountSerializer(serializers.Serializer):
    confirm = serializers.BooleanField(
        required=True,
        error_messages={
            'required': 'Confirmation is required to delete your account.',
            'invalid': 'Confirmation must be a boolean value (true).'
        }
    )

    def validate(self, data):
        user = self.context['request'].user
        if not user.is_authenticated:
            raise serializers.ValidationError("Authentication required to delete account.")
        if not data.get('confirm'):
            raise serializers.ValidationError("You must confirm account deletion by setting 'confirm' to true.")
        data['user'] = user
        return data


class FollowSerializer(serializers.ModelSerializer):
    followed_id = serializers.UUIDField(write_only=True)
    source = serializers.ChoiceField(choices=Follows.FOLLOW_SOURCES, default='Search')

    class Meta:
        model = Follows
        fields = ['followed_id', 'source', 'created_at', 'is_mutual']
        read_only_fields = ['created_at', 'is_mutual']

    def validate_followed_id(self, value):
        # Ensure followed user exists and is not the requester
        user = self.context['request'].user
        if not CustomUser.objects.filter(user_id=value).exists():
            raise serializers.ValidationError("User does not exist.")
        if value == user.user_id:
            raise serializers.ValidationError("Cannot follow yourself.")
        return value

    def create(self, validated_data):
        follower = self.context['request'].user
        followed = CustomUser.objects.get(user_id=validated_data['followed_id'])
        follow, created = Follows.objects.get_or_create(
            follower=follower,
            followed=followed,
            defaults={'source': validated_data['source'], 'active': True}
        )
        if not created and not follow.active:
            # Re-activate if previously unfollowed
            follow.active = True
            follow.source = validated_data['source']
            follow.save()
        return follow


class UserSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['user_id', 'username', 'profile_picture', 'city']