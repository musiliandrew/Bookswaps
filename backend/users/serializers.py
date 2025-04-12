from rest_framework import serializers
from .models import CustomUser, Follows
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.utils import timezone


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=CustomUser.objects.all())]
    )
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )

    class Meta:
        model = CustomUser
        fields = ('user_id', 'username', 'email', 'password', 'city', 'genres')
        read_only_fields = ('user_id',)

    def create(self, validated_data):
        chat_prefs_default = {"location_enabled": False}

        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            city=validated_data.get('city', ''),
            genres=validated_data.get('genres', ''),
            chat_preferences=chat_prefs_default
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])

        if not user:
            raise serializers.ValidationError("Invalid credentials")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")

        # Update last_active
        user.last_active = timezone.now()
        user.save()

        data['user'] = user
        return data
    
class UserProfileSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            "id", "username", "city", "about_you", "genres", "profile_pic",
            "followers_count", "following_count", "created_at"
        ]

    def get_followers_count(self, obj):
        return Follows.objects.filter(followed=obj).count()

    def get_following_count(self, obj):
        return Follows.objects.filter(follower=obj).count()
    
class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['city', 'about_you', 'genres', 'profile_pic']

    def validate_genres(self, value):
        # Example of validating genre format (comma-separated)
        genres_list = value.split(',')
        if not all([genre.strip() for genre in genres_list]):
            raise serializers.ValidationError("Genres must be comma-separated and non-empty.")
        return value

    def validate_profile_pic(self, value):
        # Optional: Validate URL format (assuming profile_pic is a URL)
        if value and not value.startswith('http'):
            raise serializers.ValidationError("Profile picture URL must start with 'http' or 'https'.")
        return value
    
class DeleteAccountSerializer(serializers.Serializer):
    confirm = serializers.BooleanField(required=True)

class FollowSerializer(serializers.Serializer):
    # Just a placeholder to handle the input request body for now
    pass

class UserSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['user_id', 'username', 'profile_picture']