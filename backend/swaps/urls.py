from django.urls import path
from .views import (
    InitiateSwapView, AcceptSwapView, ConfirmSwapView, CancelSwapView,
    SwapListView, SwapHistoryView, AddLocationView, NotificationListView,
    MarkNotificationReadView, ShareView, MidpointView, GetQRCodeView
)

app_name = 'swaps'

urlpatterns = [
    path('', InitiateSwapView.as_view(), name='initiate_swap'),
    path('<uuid:swap_id>/accept/', AcceptSwapView.as_view(), name='accept_swap'),
    path('<uuid:swap_id>/confirm/', ConfirmSwapView.as_view(), name='confirm_swap'),
    path('<uuid:swap_id>/cancel/', CancelSwapView.as_view(), name='cancel_swap'),
    path('list/', SwapListView.as_view(), name='swap_list'),
    path('history/', SwapHistoryView.as_view(), name='swap_history'),
    path('locations/add/', AddLocationView.as_view(), name='add_location'),
    path('notifications/', NotificationListView.as_view(), name='notification_list'),
    path('notifications/<uuid:notification_id>/read/', MarkNotificationReadView.as_view(), name='mark_notification_read'),
    path('share/', ShareView.as_view(), name='share'),
    path('midpoint/', MidpointView.as_view(), name='midpoint'),
    path('<uuid:swap_id>/qr/', GetQRCodeView.as_view(), name='get_qr_code'),
]