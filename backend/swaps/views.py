from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import timedelta
from django.db import transaction
from django.core.cache import cache
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
import requests
from math import radians, sin, cos, sqrt, atan2
from .models import Swap, Notification, Location, ExtensionRequest
from .serializers import (
    SwapCreateSerializer, SwapSerializer, SwapAcceptSerializer,
    SwapConfirmSerializer, SwapHistorySerializer, LocationSerializer,
    NotificationSerializer, ShareSerializer
)
from .qr_utils import qr_manager
from .location_utils import location_service
from backend.library.models import Book
from backend.users.models import Follows
from django.conf import settings
import uuid
from backend.utils.websocket import send_notification_to_user

def haversine(coord1, coord2):
    """Calculate distance (km) between two coordinates."""
    try:
        lat1, lon1 = radians(float(coord1['latitude'])), radians(float(coord1['longitude']))
        lat2, lon2 = radians(float(coord2['latitude'])), radians(float(coord2['longitude']))
        dlat, dlon = lat2 - lat1, lon2 - lon1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        return 6371 * c  # Earth's radius in km
    except (KeyError, TypeError, ValueError):
        return float('inf')

class InitiateSwapView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            initiator_book = Book.objects.get(book_id=request.data.get('initiator_book_id'))
        except Book.DoesNotExist:
            return Response({"error": "Invalid initiator book ID"}, status=status.HTTP_400_BAD_REQUEST)
        
        if initiator_book.user != request.user:
            return Response({"error": "Not your book"}, status=status.HTTP_403_FORBIDDEN)
        if initiator_book.locked_until and initiator_book.locked_until > timezone.now():
            return Response({"error": "Book locked"}, status=status.HTTP_400_BAD_REQUEST)

        # Generate secure QR code
        qr_result = qr_manager.generate_swap_qr_code(
            swap_id=uuid.uuid4(),  # Temporary ID, will be updated after creation
            user_id=request.user.user_id
        )

        serializer = SwapCreateSerializer(
            data=request.data,
            context={'request': request, 'qr_code_url': qr_result['qr_code_url']}
        )
        if serializer.is_valid():
            with transaction.atomic():
                swap = serializer.save()

                # Update QR code with actual swap ID
                qr_result = qr_manager.generate_swap_qr_code(
                    swap_id=swap.swap_id,
                    user_id=request.user.user_id
                )
                swap.qr_code_url = qr_result['qr_code_url']
                swap.qr_code_data = qr_result['qr_data']

                # Set borrowing details if specified
                is_borrowing = request.data.get('is_borrowing', False)
                if is_borrowing:
                    swap.is_borrowing = True
                    return_days = int(request.data.get('return_days', 14))
                    swap.return_deadline = timezone.now() + timedelta(days=return_days)

                swap.save()

                initiator_book.locked_until = timezone.now() + timedelta(hours=24)
                initiator_book.save()
                if swap.receiver_book:
                    swap.receiver_book.locked_until = timezone.now() + timedelta(hours=24)
                    swap.receiver_book.save()

                notification = Notification.objects.create(
                    user=swap.receiver,
                    swap=swap,
                    type='swap_proposed',
                    message=f"{request.user.username} requested a swap."
                )
                # Send notification via WebSocket to the receiver's group
                send_notification_to_user(
                    swap.receiver.user_id,
                    {
                        "notification_id": str(notification.notification_id),
                        "message": f"{request.user.username} requested a swap.",
                        "type": "swap_proposed",
                        "content_type": "swap",
                        "content_id": str(swap.swap_id),
                        "follow_id": None
                    }
                )

            return Response(SwapSerializer(swap).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AcceptSwapView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, swap_id):
        swap = get_object_or_404(
            Swap,
            swap_id=swap_id,
            receiver=request.user,
            status='Requested'
        )
        serializer = SwapAcceptSerializer(swap, data=request.data, partial=True)
        if serializer.is_valid():
            with transaction.atomic():
                serializer.save(status='Accepted')

                notification = Notification.objects.create(
                    user=swap.initiator,
                    swap=swap,
                    type='swap_accepted',
                    message=f"{request.user.username} accepted your swap."
                )
                # Send notification via WebSocket to the initiator's group
                send_notification_to_user(
                    swap.initiator.user_id,
                    {
                        "notification_id": str(notification.notification_id),
                        "message": f"{request.user.username} accepted your swap.",
                        "type": "swap_accepted",
                        "content_type": "swap",
                        "content_id": str(swap.swap_id),
                        "follow_id": None
                    }
                )

            return Response(SwapSerializer(swap).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ConfirmSwapView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, swap_id):
        swap = get_object_or_404(Swap, swap_id=swap_id)
        if request.user not in [swap.initiator, swap.receiver]:
            return Response({"error": "Unauthorized user"}, status=status.HTTP_403_FORBIDDEN)
        if swap.status != 'Accepted':
            return Response({"error": "Swap not in Accepted state"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = SwapConfirmSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                swap_confirm_key = f"swap_confirm_{swap_id}_{request.user.user_id}"
                if cache.get(swap_confirm_key):
                    return Response({"error": "User already confirmed"}, status=status.HTTP_400_BAD_REQUEST)
                cache.set(swap_confirm_key, True, timeout=3600)

                other_user = swap.receiver if request.user == swap.initiator else swap.initiator
                other_confirm_key = f"swap_confirm_{swap_id}_{other_user.user_id}"
                if cache.get(other_confirm_key):
                    swap.set_status('Completed')

                    initiator_book = swap.initiator_book
                    receiver_book = swap.receiver_book
                    if receiver_book:
                        initiator_book.user, receiver_book.user = swap.receiver, swap.initiator
                        initiator_book.save()
                        receiver_book.save()
                    else:
                        initiator_book.user = swap.receiver
                        initiator_book.save()

                    initiator_book.locked_until = None
                    initiator_book.save()
                    if receiver_book:
                        receiver_book.locked_until = None
                        receiver_book.save()

                    notifications = [
                        Notification(
                            user=swap.initiator,
                            swap=swap,
                            type='swap_completed',
                            message="Swap completed."
                        ),
                        Notification(
                            user=swap.receiver,
                            swap=swap,
                            type='swap_completed',
                            message="Swap completed."
                        )
                    ]
                    Notification.objects.bulk_create(notifications)

                    # Send notifications via WebSocket to both users' groups
                    for notification in notifications:
                        send_notification_to_user(
                            notification.user.user_id,
                            {
                                "notification_id": str(notification.notification_id),
                                "message": "Swap completed.",
                                "type": "swap_completed",
                                "content_type": "swap",
                                "content_id": str(swap.swap_id),
                                "follow_id": None
                            }
                        )

                    cache.delete(swap_confirm_key)
                    cache.delete(other_confirm_key)
                else:
                    swap.set_status('Confirmed')

                swap.save()
            return Response(SwapSerializer(swap).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CancelSwapView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, swap_id):
        swap = get_object_or_404(Swap, swap_id=swap_id)
        if request.user not in [swap.initiator, swap.receiver]:
            return Response({"error": "Not part of this swap"}, status=status.HTTP_403_FORBIDDEN)
        if swap.status == 'Completed':
            return Response({"error": "Swap already completed"}, status=status.HTTP_400_BAD_REQUEST)
        if swap.status == 'Cancelled':
            return Response({"message": "Swap already cancelled"}, status=status.HTTP_200_OK)

        with transaction.atomic():
            swap.set_status('Cancelled')
            swap.initiator_book.locked_until = None
            swap.initiator_book.save()
            if swap.receiver_book:
                swap.receiver_book.locked_until = None
                swap.receiver_book.save()

            other_user = swap.receiver if request.user == swap.initiator else swap.initiator
            notification = Notification.objects.create(
                user=other_user,
                swap=swap,
                type='swap_cancelled',
                message=f"{request.user.username} cancelled the swap."
            )
            # Send notification via WebSocket to the other user's group
            send_notification_to_user(
                other_user.user_id,
                {
                    "notification_id": str(notification.notification_id),
                    "message": f"{request.user.username} cancelled the swap.",
                    "type": "swap_cancelled",
                    "content_type": "swap",
                    "content_id": str(swap.swap_id),
                    "follow_id": None
                }
            )

            swap.save()
        return Response(SwapSerializer(swap).data, status=status.HTTP_200_OK)

class SwapListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cache_key = f"swaps_user_{request.user.user_id}_{request.query_params.get('status', 'all')}"
        cached_swaps = cache.get(cache_key)
        if cached_swaps:
            return Response(cached_swaps, status=status.HTTP_200_OK)

        swaps = Swap.objects.filter(
            Q(initiator=request.user) | Q(receiver=request.user)
        ).select_related(
            'initiator', 'receiver', 'initiator_book', 'receiver_book', 'meetup_location'
        )
        status_param = request.query_params.get('status')
        if status_param:
            swaps = swaps.filter(status=status_param)

        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(swaps.order_by('-created_at'), request)
        serializer = SwapSerializer(result_page, many=True)

        response_data = paginator.get_paginated_response(serializer.data).data
        cache.set(cache_key, response_data, timeout=300)
        return Response(response_data)

class SwapHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        swaps = Swap.objects.filter(
            Q(initiator=request.user) | Q(receiver=request.user),
            status__in=['Completed', 'Cancelled']
        ).select_related('initiator', 'receiver', 'initiator_book', 'receiver_book')
        
        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(swaps.order_by('-updated_at'), request)
        serializer = SwapHistorySerializer(result_page, many=True)
        
        return paginator.get_paginated_response(serializer.data)

class AddLocationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LocationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    location = serializer.save(
                        verified=False,
                        is_active=True,
                        source='user_submission'
                    )
                return Response(LocationSerializer(location).data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"error": f"Failed to create location: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).select_related('swap', 'book')
        if 'is_read' in request.query_params:
            is_read = request.query_params['is_read'].lower() == 'true'
            notifications = notifications.filter(is_read=is_read)
        if 'type' in request.query_params:
            notifications = notifications.filter(type=request.query_params['type'])

        paginator = PageNumberPagination()
        result = paginator.paginate_queryset(notifications.order_by('-created_at'), request)
        serializer = NotificationSerializer(result, many=True)
        
        return paginator.get_paginated_response(serializer.data)

class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, notification_id):
        notification = get_object_or_404(Notification, notification_id=notification_id, user=request.user)
        notification.is_read = True
        notification.save()
        return Response(NotificationSerializer(notification).data, status=status.HTTP_200_OK)

class MarkAllNotificationsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Mark all notifications as read for the authenticated user"""
        updated_count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)

        return Response({
            'message': f'Marked {updated_count} notifications as read',
            'updated_count': updated_count
        }, status=status.HTTP_200_OK)

class DeleteNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, notification_id):
        """Delete a single notification"""
        notification = get_object_or_404(Notification, notification_id=notification_id, user=request.user)
        notification.delete()
        return Response({
            'message': 'Notification deleted successfully'
        }, status=status.HTTP_200_OK)

class BulkNotificationOperationsView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        """Bulk operations on notifications (mark as read, archive, etc.)"""
        notification_ids = request.data.get('notification_ids', [])
        operation = request.data.get('operation')  # 'mark_read', 'mark_unread', 'archive'

        if not notification_ids:
            return Response({'error': 'No notification IDs provided'}, status=status.HTTP_400_BAD_REQUEST)

        if not operation:
            return Response({'error': 'No operation specified'}, status=status.HTTP_400_BAD_REQUEST)

        notifications = Notification.objects.filter(
            notification_id__in=notification_ids,
            user=request.user
        )

        if operation == 'mark_read':
            updated_count = notifications.update(is_read=True)
        elif operation == 'mark_unread':
            updated_count = notifications.update(is_read=False)
        elif operation == 'archive':
            updated_count = notifications.update(is_archived=True)
        else:
            return Response({'error': 'Invalid operation'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': f'Successfully {operation} {updated_count} notifications',
            'updated_count': updated_count
        }, status=status.HTTP_200_OK)

    def delete(self, request):
        """Bulk delete notifications"""
        notification_ids = request.data.get('notification_ids', [])

        if not notification_ids:
            return Response({'error': 'No notification IDs provided'}, status=status.HTTP_400_BAD_REQUEST)

        deleted_count, _ = Notification.objects.filter(
            notification_id__in=notification_ids,
            user=request.user
        ).delete()

        return Response({
            'message': f'Successfully deleted {deleted_count} notifications',
            'deleted_count': deleted_count
        }, status=status.HTTP_200_OK)

class ShareView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ShareSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            with transaction.atomic():
                share = serializer.save()
                share.metadata['url'] = f"https://x.com/intent/post?text={share.metadata.get('text')}"
                share.status = 'success'
                share.save()
            return Response(ShareSerializer(share).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MidpointView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user_lat = float(request.query_params.get('user_lat'))
            user_lon = float(request.query_params.get('user_lon'))
            other_lat = float(request.query_params.get('other_lat'))
            other_lon = float(request.query_params.get('other_lon'))
        except (TypeError, ValueError):
            return Response({"error": "Invalid or missing coordinates"}, status=status.HTTP_400_BAD_REQUEST)

        # Get user preferences
        preferences = {
            'transport_mode': request.query_params.get('transport_mode', 'driving'),
            'place_types': request.query_params.getlist('place_types'),
            'max_distance': float(request.query_params.get('max_distance', 10))  # km
        }

        cache_key = f"midpoint_v2_{user_lat}_{user_lon}_{other_lat}_{other_lon}_{hash(str(preferences))}"
        cached_result = cache.get(cache_key)
        if cached_result:
            return Response(cached_result, status=status.HTTP_200_OK)

        coord1 = {'latitude': user_lat, 'longitude': user_lon}
        coord2 = {'latitude': other_lat, 'longitude': other_lon}

        # Use advanced location discovery service
        result = location_service.calculate_optimal_midpoint(coord1, coord2, preferences)

        # Format response
        response_data = {
            "midpoint": result['midpoint'],
            "suggested_locations": result['suggested_locations'],
            "distance_analysis": {
                "distance_from_user1_km": result['distance_from_user1'],
                "distance_from_user2_km": result['distance_from_user2'],
                "total_distance_km": result['distance_from_user1'] + result['distance_from_user2']
            },
            "preferences_applied": preferences
        }

        cache.set(cache_key, response_data, timeout=3600)
        return Response(response_data, status=status.HTTP_200_OK)

class GetQRCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, swap_id):
        swap = get_object_or_404(Swap, swap_id=swap_id)
        if request.user not in [swap.initiator, swap.receiver]:
            return Response({"error": "Not part of swap"}, status=status.HTTP_403_FORBIDDEN)
        if not swap.qr_code_url:
            return Response({"error": "No QR code generated"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"qr_code_url": swap.qr_code_url}, status=status.HTTP_200_OK)


class RequestExtensionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, swap_id):
        swap = get_object_or_404(Swap, swap_id=swap_id)

        # Only the receiver (borrower) can request extension
        if request.user != swap.receiver:
            return Response({"error": "Only the borrower can request extension"}, status=status.HTTP_403_FORBIDDEN)

        if not swap.is_borrowing:
            return Response({"error": "This is not a borrowing swap"}, status=status.HTTP_400_BAD_REQUEST)

        if swap.status != 'Completed':
            return Response({"error": "Swap must be completed to request extension"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if there's already a pending extension request
        existing_request = ExtensionRequest.objects.filter(
            swap=swap,
            status='pending'
        ).first()

        if existing_request:
            return Response({"error": "Extension request already pending"}, status=status.HTTP_400_BAD_REQUEST)

        days_requested = request.data.get('days_requested')
        reason = request.data.get('reason', '')

        if not days_requested or days_requested <= 0:
            return Response({"error": "Invalid number of days requested"}, status=status.HTTP_400_BAD_REQUEST)

        # Create extension request
        extension_request = ExtensionRequest.objects.create(
            swap=swap,
            requester=request.user,
            days_requested=days_requested,
            reason=reason
        )

        # Notify the book owner
        notification = Notification.objects.create(
            user=swap.initiator,
            swap=swap,
            type='extension_requested',
            message=f"{request.user.username} requested {days_requested} day extension for '{swap.initiator_book.title}'"
        )

        return Response({
            "message": "Extension request sent successfully",
            "extension_id": extension_request.extension_id,
            "days_requested": days_requested
        }, status=status.HTTP_201_CREATED)


class RespondToExtensionView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, extension_id):
        extension_request = get_object_or_404(ExtensionRequest, extension_id=extension_id)

        # Only the book owner can respond
        if request.user != extension_request.swap.initiator:
            return Response({"error": "Only the book owner can respond to extension requests"}, status=status.HTTP_403_FORBIDDEN)

        if extension_request.status != 'pending':
            return Response({"error": "Extension request is no longer pending"}, status=status.HTTP_400_BAD_REQUEST)

        action = request.data.get('action')  # 'approve' or 'deny'
        response_message = request.data.get('response', '')

        if action == 'approve':
            extension_request.approve(response_message)

            # Notify the requester
            notification = Notification.objects.create(
                user=extension_request.requester,
                swap=extension_request.swap,
                type='extension_approved',
                message=f"Your extension request for '{extension_request.swap.initiator_book.title}' was approved"
            )

            return Response({
                "message": "Extension approved successfully",
                "new_deadline": extension_request.swap.return_deadline.isoformat()
            }, status=status.HTTP_200_OK)

        elif action == 'deny':
            extension_request.deny(response_message)

            # Notify the requester
            notification = Notification.objects.create(
                user=extension_request.requester,
                swap=extension_request.swap,
                type='extension_denied',
                message=f"Your extension request for '{extension_request.swap.initiator_book.title}' was denied"
            )

            return Response({
                "message": "Extension denied",
                "reason": response_message
            }, status=status.HTTP_200_OK)

        else:
            return Response({"error": "Invalid action. Use 'approve' or 'deny'"}, status=status.HTTP_400_BAD_REQUEST)


class QRVerificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, swap_id):
        swap = get_object_or_404(Swap, swap_id=swap_id)

        if request.user not in [swap.initiator, swap.receiver]:
            return Response({"error": "Not part of this swap"}, status=status.HTTP_403_FORBIDDEN)

        if swap.status != 'Accepted':
            return Response({"error": "Swap must be in Accepted status for QR verification"}, status=status.HTTP_400_BAD_REQUEST)

        qr_data = request.data.get('qr_data')
        current_location = request.data.get('current_location')  # {latitude, longitude}

        if not qr_data:
            return Response({"error": "QR data is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Determine which user should be verified
        other_user = swap.receiver if request.user == swap.initiator else swap.initiator

        # Verify QR code
        verification_result = qr_manager.verify_qr_code(
            qr_data=qr_data,
            expected_swap_id=swap.swap_id,
            expected_user_id=other_user.user_id,
            current_location=current_location
        )

        if not verification_result['success']:
            return Response({
                "error": verification_result['error'],
                "error_code": verification_result['error_code']
            }, status=status.HTTP_400_BAD_REQUEST)

        # Mark location as verified for this user
        if not hasattr(swap, '_verified_users'):
            swap._verified_users = set()
        swap._verified_users.add(request.user.user_id)

        # If both users have verified, complete the swap
        if len(getattr(swap, '_verified_users', set())) >= 2:
            swap.status = 'Confirmed'
            swap.location_verified = True
            swap.save()

            # Create exchange record
            from .models import Exchange
            exchange = Exchange.objects.create(
                swap=swap,
                exchange_date=timezone.now(),
                location=swap.meetup_location
            )

            return Response({
                "message": "Swap confirmed successfully! Both parties have verified their presence.",
                "status": "confirmed",
                "exchange_id": exchange.exchange_id
            }, status=status.HTTP_200_OK)

        else:
            return Response({
                "message": "QR code verified. Waiting for the other party to verify.",
                "status": "partially_verified"
            }, status=status.HTTP_200_OK)