from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, PasswordResetRequestView,
    PasswordResetConfirmView, UserProfileView, UpdateProfileView,
    DeleteAccountView, FollowUserView, UnfollowUserView,
    FollowersFollowingView, FollowStatusView, UpdateChatPreferencesView,
    UpdateAccountSettingsView, SearchUsersView, RecommendedUsersView, CustomTokenRefreshView
)

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('password/reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),

    # Profile Management
    path('profile/<str:identifier>/', UserProfileView.as_view(), name='user_profile'),  # GET: Lookup by user_id or username
    path('me/profile/', UpdateProfileView.as_view(), name='update_profile'),  # PATCH: Update profile
    path('me/delete/', DeleteAccountView.as_view(), name='delete_account'),  # DELETE: Soft delete account

    # Follow System
    path('follow/<uuid:user_id>/', FollowUserView.as_view(), name='follow_user'),  # POST: Follow a user
    path('unfollow/<uuid:user_id>/', UnfollowUserView.as_view(), name='unfollow_user'),  # DELETE: Unfollow a user
    path('followers/<uuid:user_id>/', FollowersFollowingView.as_view(), name='list_followers'),  # GET: List followers
    path('following/<uuid:user_id>/', FollowersFollowingView.as_view(), name='list_following'),  # GET: List following
    path('follow-status/<uuid:user_id>/', FollowStatusView.as_view(), name='check_follow_status'),  # GET: Check follow status

    # Settings
    path('me/settings/preferences/', UpdateChatPreferencesView.as_view(), name='update_chat_preferences'),  # PATCH: Update chat preferences
    path('me/settings/account/', UpdateAccountSettingsView.as_view(), name='update_account_settings'),  # PATCH: Update email, password, privacy

    # Search and Recommendations
    path('search/', SearchUsersView.as_view(), name='search_users'),  # GET: Search users
    path('recommended/', RecommendedUsersView.as_view(), name='recommended_users'),  # GET: Recommended users
]