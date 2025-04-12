import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email must be set")
        if not username:
            raise ValueError("Username must be set")

        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)  # hashes the password
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(username, email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    age = models.IntegerField(blank=True, null=True)
    city = models.TextField(blank=True, null=True)
    country = models.TextField(blank=True, null=True)
    ethnicity = models.TextField(blank=True, null=True)
    role = models.TextField(blank=True, null=True)
    about_you = models.TextField(blank=True, null=True)
    genres = models.TextField(blank=True, null=True)
    chat_preferences = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    profile_pic = models.TextField(blank=True, null=True)
    last_active = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

    class Meta:
        db_table = 'users'
        db_table_comment = 'Stores user profiles, driving social features and personalization'

class Follows(models.Model):
    FOLLOW_SOURCES = [
        ('Search', 'Search'),
        ('Swap', 'Swap'),
        ('Chat', 'Chat'),
        ('Recommendation', 'Recommendation'),
    ]

    follow_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    follower = models.ForeignKey(CustomUser, related_name='following', on_delete=models.CASCADE)
    followed = models.ForeignKey(CustomUser, related_name='followers', on_delete=models.CASCADE)
    is_mutual = models.BooleanField(default=False, help_text='Precomputed mutual status to accelerate chat unlocks')
    active = models.BooleanField(default=True, help_text='Soft deletion for unfollow events, keeps social history')
    source = models.CharField(max_length=20, choices=FOLLOW_SOURCES, default='Search', help_text='Origin of follow for funnel analysis and personalization')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'follows'
        db_table_comment = 'Manages user follows to drive chats, personalization, and feed logic'
        unique_together = ('follower', 'followed')
        indexes = [
            models.Index(fields=['follower'], name='idx_follows_follower_id'),
            models.Index(fields=['followed'], name='idx_follows_followed_id'),
        ]

    def __str__(self):
        return f"{self.follower.username} follows {self.followed.username}"
