from django.urls import path
from .views import RegisterView , LoginView, LogoutView, PasswordResetRequestView, PasswordResetConfirmView, UserProfileView, UpdateProfileView, DeleteAccountView,FollowUserView,UnfollowUserView, FollowersFollowingView, FollowStatusView, UpdateChatPreferencesView, UpdateAccountSettingsView, SearchUsersView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('password/reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('<str:identifier>/', UserProfileView.as_view(), name='user_profile'),
    path('me/', UpdateProfileView.as_view(), name='update_profile'),# Update Profile: PATCH
    path('me/', DeleteAccountView.as_view(), name='delete_account'),# Delete Account: DELETE
    path('<uuid:user_id>/follow/', FollowUserView.as_view(), name='follow_user'),
    path('<uuid:user_id>/follow/', UnfollowUserView.as_view(), name='unfollow_user'),
    path('<uuid:user_id>/followers/', FollowersFollowingView.as_view(), name='list_followers'),
    path('<uuid:user_id>/following/', FollowersFollowingView.as_view(), name='list_following'),
    path('<uuid:user_id>/follow-status/', FollowStatusView.as_view(), name='check_follow_status'),
    path('me/preferences/', UpdateChatPreferencesView.as_view(), name='update_chat_preferences'),
    path('me/account/', UpdateAccountSettingsView.as_view(), name='update_account_settings'),
    path('search/', SearchUsersView.as_view(), name='search_users'),
    
]