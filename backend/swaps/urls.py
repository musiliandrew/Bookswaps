
from django.urls import path
from .views import InitiateSwapView, ConfirmSwapView, AcceptSwapView, CancelSwapView, SwapListView, AddLocationView, NotificationListView, MarkNotificationReadView, ShareView, MidpointView, GetQRCodeView

urlpatterns = [
    path('', InitiateSwapView.as_view(), name='initiate-swap'),
    path('', SwapListView.as_view(), name="swap_list"),
    path('<uuid:swap_id>/accept/', AcceptSwapView.as_view(), name='accept_swap'),
    path('<uuid:swap_id>/confirm/' , ConfirmSwapView.as_view(), name='confirm_swap'),
    path('<uuid:swap_id>/cancel/' , CancelSwapView.as_view(), name='cancel_swap'),
    path('<uuid:swap_id>/qr/', GetQRCodeView.as_view(), name='get_qr_code'),
    path('locations/', AddLocationView.as_view(), name="add_or_update_location"),
    path('midpoint/<uuid:other_user_id>/', MidpointView.as_view(), name='calculate-midpoint'),
    path('notifications/', NotificationListView.as_view(), name='notification_list'),
    path('notifications/<uuid:notification_id>/read/', MarkNotificationReadView.as_view(), name='mark-notification-read'),
    path('shares/', ShareView.as_view(), name='share-content'),
]
