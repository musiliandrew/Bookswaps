import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.core.validators import EmailValidator, MinValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email must be set")
        if not username:
            raise ValueError("Username must be set")

        # Stricter email validation
        EmailValidator(message="Enter a valid email address")(email)
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)  # Hashes the password
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('profile_public', True)
        extra_fields.setdefault('email_notifications', True)

        return self.create_user(username, email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Non-binary', 'Non-binary'),
        ('Prefer not to say', 'Prefer not to say'),
    ]
    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    birth_date = models.DateField(blank=True, null=True) 
    gender = models.CharField(max_length=17, choices=GENDER_CHOICES, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    ethnicity = models.CharField(max_length=100, blank=True, null=True)
    role = models.CharField(max_length=50, blank=True, null=True)
    about_you = models.TextField(blank=True, null=True)
    genres = models.JSONField(blank=True, null=True, default=list)
    chat_preferences = models.JSONField(blank=True, null=True, default=dict)
    profile_picture = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(blank=True, null=True)
    last_login = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    profile_public = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    profile_completed = models.BooleanField(default=False)
    registration_step = models.IntegerField(default=1)  # Track registration progress

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def clean(self):
        if self.genres and not isinstance(self.genres, list):
            raise ValidationError("Genres must be a list (e.g., ['Fiction', 'Sci-Fi'])")
        if self.chat_preferences and not isinstance(self.chat_preferences, dict):
            raise ValidationError("Chat preferences must be a dictionary")
        if self.birth_date and self.birth_date > timezone.now().date():
            raise ValidationError("Birth date cannot be in the future")

    def __str__(self):
        return self.username

    def get_profile_completion_percentage(self):
        """Calculate profile completion percentage"""
        total_fields = 10  # Total important fields
        completed_fields = 0

        # Essential fields (always required)
        if self.username: completed_fields += 1
        if self.email: completed_fields += 1

        # Profile fields
        if self.birth_date: completed_fields += 1
        if self.gender: completed_fields += 1
        if self.city: completed_fields += 1
        if self.country: completed_fields += 1
        if self.about_you: completed_fields += 1
        if self.genres: completed_fields += 1
        if self.profile_picture: completed_fields += 1
        if self.ethnicity: completed_fields += 1

        return int((completed_fields / total_fields) * 100)

    def update_profile_completion_status(self):
        """Update profile_completed based on completion percentage"""
        completion_percentage = self.get_profile_completion_percentage()
        self.profile_completed = completion_percentage >= 80
        return completion_percentage

    class Meta:
        db_table = 'users'
        db_table_comment = 'Stores user profiles, driving social features and personalization'
        indexes = [
            models.Index(fields=['username'], name='idx_users_username'),
            models.Index(fields=['email'], name='idx_users_email'),
            models.Index(fields=['city'], name='idx_users_city'),
        ]

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
    updated_at = models.DateTimeField(auto_now=True)  # Added for tracking changes

    class Meta:
        db_table = 'follows'
        db_table_comment = 'Manages user follows to drive chats, personalization, and feed logic'
        unique_together = ('follower', 'followed')
        indexes = [
            models.Index(fields=['follower'], name='idx_follows_follower_id'),
            models.Index(fields=['followed'], name='idx_follows_followed_id'),
        ]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        reverse_follow = Follows.objects.filter(
            follower=self.followed, followed=self.follower, active=True
        ).exists()
        self.is_mutual = reverse_follow
        super().save(update_fields=['is_mutual'])
        if reverse_follow:
            Follows.objects.filter(follower=self.followed, followed=self.follower).update(is_mutual=True)

    def __str__(self):
        return f"{self.follower.username} follows {self.followed.username}"