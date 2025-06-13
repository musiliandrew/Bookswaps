from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.authentication import JWTAuthentication
import json
import logging

logger = logging.getLogger(__name__)

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        token = self.scope['query_string'].decode().split('token=')[-1]
        if not token:
            logger.warning("WebSocket connection attempt without token")
            await self.close()
            return

        try:
            user = await self.authenticate_user(token)
            if user and user.is_authenticated:
                self.scope['user'] = user
                self.group_name = f"user_{user.user_id}"
                await self.channel_layer.group_add(self.group_name, self.channel_name)
                await self.accept()
                logger.info(f"WebSocket connected for user_id={user.user_id}")
            else:
                logger.warning("WebSocket authentication failed")
                await self.close()
        except Exception as e:
            logger.error(f"WebSocket authentication error: {str(e)}")
            await self.close()

    @database_sync_to_async
    def authenticate_user(self, token):
        jwt_auth = JWTAuthentication()
        try:
            validated_token = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated_token)
            return user
        except Exception:
            return None

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            logger.info(f"WebSocket disconnected for group={self.group_name}")

    async def notification(self, event):
        await self.send(text_data=json.dumps({
            'type': event['type'],
            'message': event['message'],
            'follow_id': event['follow_id']
        }))