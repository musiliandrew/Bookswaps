from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def send_notification_to_user(user_id, notification_data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{user_id}",
        {
            "type": "notification",
            "notification_id": str(notification_data.get("notification_id")),
            "message": notification_data.get("message"),
            "type": notification_data.get("type"),
            "content_type": notification_data.get("content_type"),
            "content_id": str(notification_data.get("content_id")) if notification_data.get("content_id") else None,
            "follow_id": str(notification_data.get("follow_id")) if notification_data.get("follow_id") else None,
        }
    )