from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import CustomUser, Follows
from django_redis import get_redis_connection


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
        fields = ('user_id', 'username', 'email', 'password', 'city', 'genres')
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

        # Update last_active and last_login
        user.last_active = timezone.now()
        user.last_login = timezone.now()
        user.save(update_fields=['last_active', 'last_login'])

        data['user'] = UserSerializer(user).data  # Serialize user
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
        extra_kwargs = {'user_id': {'source': 'user_id'}}

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
    confirm = serializers.BooleanField(required=True)

    def validate(self, data):
        # Ensure user is deleting their own account
        user = self.context['request'].user
        if not user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")
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
        extra_kwargs = {'user_id': {'source': 'user_id'}}