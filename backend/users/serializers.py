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
from datetime import date
from backend.utils.minio_storage import upload_profile_picture, delete_file

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
    )
    birth_date = serializers.DateField(required=True)
    gender = serializers.ChoiceField(choices=CustomUser.GENDER_CHOICES, required=True)
    profile_picture = serializers.FileField(required=False, allow_null=True)
    
    class Meta:
        model = CustomUser
        fields = ('user_id', 'username', 'email', 'password', 'city', 'genres', 'birth_date', 'gender', 'country', 'profile_public', 'profile_picture')
        read_only_fields = ('user_id',)
        
    def validate_birth_date(self, value):
        today = date.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 13:
            raise serializers.ValidationError("Users must be at least 13 years old.")
        if value > today:
            raise serializers.ValidationError("Birth date cannot be in the future.")
        return value

    def create(self, validated_data):
        chat_prefs_default = {"location_enabled": False}
        genres = validated_data.pop('genres', [])
        profile_picture_file = validated_data.pop('profile_picture', None)
        profile_picture_url = None

        if profile_picture_file:
            profile_picture_url = upload_profile_picture(profile_picture_file, validated_data['username'])

        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            city=validated_data.get('city', None),
            genres=genres,
            chat_preferences=chat_prefs_default,
            birth_date=validated_data['birth_date'],
            gender=validated_data['gender'],
            country=validated_data.get('country', None),
            profile_public=validated_data.get('profile_public', True),
            profile_picture=profile_picture_url
        )
        return user

# Simplified registration serializers for multi-step process
class SimpleRegisterSerializer(serializers.ModelSerializer):
    """Step 1: Basic registration with minimal required fields"""
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            registration_step=1
        )
        return user

class ProfileStepSerializer(serializers.ModelSerializer):
    """Step 2: Essential profile information"""
    birth_date = serializers.DateField(required=True)
    gender = serializers.ChoiceField(choices=CustomUser.GENDER_CHOICES, required=True)

    class Meta:
        model = CustomUser
        fields = ('birth_date', 'gender')

    def validate_birth_date(self, value):
        today = date.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 13:
            raise serializers.ValidationError("Users must be at least 13 years old.")
        if value > today:
            raise serializers.ValidationError("Birth date cannot be in the future.")
        return value

    def update(self, instance, validated_data):
        instance.birth_date = validated_data.get('birth_date', instance.birth_date)
        instance.gender = validated_data.get('gender', instance.gender)
        instance.registration_step = 2
        instance.save()
        return instance

class GoogleAuthSerializer(serializers.Serializer):
    """Handle Google OAuth authentication"""
    access_token = serializers.CharField()

    def validate_access_token(self, access_token):
        # This will be implemented to verify Google token
        # and extract user information
        return access_token

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
        request = self.context.get('request')
        if not request:
            raise serializers.ValidationError("Request is required for authentication")
        identifier = data.get('username')
        password = data.get('password')
        user = CustomUser.objects.filter(email=identifier).first() or CustomUser.objects.filter(username=identifier).first()
        if user:
            user = authenticate(request=request, username=user.username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")
        user.last_active = timezone.now()
        user.last_login = timezone.now()
        user.save(update_fields=['last_active', 'last_login'])
        data['user'] = user
        return data

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['user_id', 'username', 'profile_picture'] 
        extra_kwargs = {'user_id': {'source': 'user_id'}} 


class UserProfileSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    profile_completion = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'user_id', 'username', 'city', 'country', 'birth_date', 'gender', 'about_you',
            'genres', 'profile_picture', 'profile_public', 'email_notifications',
            'followers_count', 'following_count', 'created_at', 'last_active', 'age',
            'profile_completed', 'registration_step', 'profile_completion'
        ]

    def get_followers_count(self, obj):
    # Make request access more defensive
        request = self.context.get('request')
        force_refresh = request and request.query_params.get('refresh') == 'true'
        
        redis = get_redis_connection('default')
        cache_key = f'followers_count:{obj.user_id}'
        
        if force_refresh:
            redis.delete(cache_key)
            
        count = redis.get(cache_key)
        if count is None:
            count = Follows.objects.filter(followed=obj, active=True).count()
            redis.setex(cache_key, 3600, count)
        return int(count)

    def get_following_count(self, obj):
        # Make request access more defensive
        request = self.context.get('request')
        force_refresh = request and request.query_params.get('refresh') == 'true'
        
        redis = get_redis_connection('default')
        cache_key = f'following_count:{obj.user_id}'
        
        if force_refresh:
            redis.delete(cache_key)
            
        count = redis.get(cache_key)
        if count is None:
            count = Follows.objects.filter(follower=obj, active=True).count()
            redis.setex(cache_key, 3600, count)
        return int(count)

    def get_age(self, obj):
        if obj.birth_date:
            today = date.today()
            return today.year - obj.birth_date.year - ((today.month, today.day) < (obj.birth_date.month, obj.birth_date.day))
        return None

    def get_profile_completion(self, obj):
        return obj.get_profile_completion_percentage()

class UpdateProfileSerializer(serializers.ModelSerializer):
    genres = serializers.ListField(
        child=serializers.CharField(), allow_empty=True, required=False
    )
    profile_picture = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = CustomUser
        fields = [
            'city', 'country', 'birth_date', 'about_you', 'genres',
            'profile_picture', 'profile_public', 'email_notifications'
        ]

    def validate_profile_picture(self, value):
        if value:
            # Delete old profile picture if it exists
            if self.instance.profile_picture:
                delete_file(self.instance.profile_picture)

            # Upload new profile picture
            url = upload_profile_picture(value, self.instance.username)
            return url
        return self.instance.profile_picture

    def validate_birth_date(self, value):
        if value:
            today = date.today()
            age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
            if age < 13:
                raise serializers.ValidationError("Users must be at least 13 years old.")
            if value > today:
                raise serializers.ValidationError("Birth date cannot be in the future.")
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
    followed_id = serializers.UUIDField(write_only=True, required=True)
    source = serializers.CharField(default='Search', required=False)

    class Meta:
        model = Follows
        fields = ['followed_id', 'source']
        read_only_fields = ['created_at', 'is_mutual']

    def validate(self, attrs):
        user = self.context['request'].user
        followed_id = attrs.get('followed_id')
        
        try:
            followed = CustomUser.objects.get(user_id=followed_id)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError({"followed_id": "User does not exist."})
        
        if followed_id == user.user_id:
            raise serializers.ValidationError({"followed_id": "Cannot follow yourself."})
            
        attrs['followed'] = followed
        return attrs

    def create(self, validated_data):
        follower = self.context['request'].user
        followed = validated_data['followed']
        source = validated_data.get('source', 'Search')
        
        # Check if follow relationship already exists (active or inactive)
        follow, created = Follows.objects.get_or_create(
            follower=follower,
            followed=followed,
            defaults={
                'source': source,
                'active': True
            }
        )
        
        if not created:
            if not follow.active:
                follow.active = True
                follow.source = source
                follow.save()
        
        return follow
class UserSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['user_id', 'username', 'profile_picture', 'city']