from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

app_name = 'users'

urlpatterns = [
    # Authentication endpoints
    path('register/', views.RegisterView.as_view(), name='register'),
    path('token/refresh/', views.CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('password/reset/', views.PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password/reset/confirm/', views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # Profile endpoints
    path('profile/<str:identifier>/', views.UserProfileView.as_view(), name='user_profile'),
    path('me/profile/', views.UpdateProfileView.as_view(), name='update_profile'),
    path('me/delete/', views.DeleteAccountView.as_view(), name='delete_account'),
    
    # Follow system endpoints
    path('follow/<uuid:user_id>/', views.FollowUserView.as_view(), name='follow_user'),
    path('unfollow/<uuid:user_id>/', views.UnfollowUserView.as_view(), name='unfollow_user'),
    path('remove-follower/<uuid:user_id>/', views.RemoveFollowerView.as_view(), name='remove_follower'),
    path('followers/<uuid:user_id>/', views.FollowersFollowingView.as_view(), name='followers'),
    path('following/<uuid:user_id>/', views.FollowersFollowingView.as_view(), name='following'),
    path('follow-status/<uuid:user_id>/', views.FollowStatusView.as_view(), name='follow_status'),
    
    # Settings endpoints
    path('me/settings/preferences/', views.UpdateChatPreferencesView.as_view(), name='update_chat_preferences'),
    path('me/settings/account/', views.UpdateAccountSettingsView.as_view(), name='update_account_settings'),
    
    # Search and recommendations
    path('search/', views.SearchUsersView.as_view(), name='search_users'),
    path('recommended/', views.RecommendedUsersView.as_view(), name='recommended_users'),

    # User library endpoint
    path('<uuid:user_id>/library/', views.UserLibraryView.as_view(), name='user_library'),

    # User statistics endpoints
    path('me/stats/', views.UserStatsView.as_view(), name='my_stats'),
    path('<uuid:user_id>/stats/', views.UserStatsView.as_view(), name='user_stats'),
]