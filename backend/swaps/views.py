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
from .models import Swap, Notification, Location
from .serializers import (
    SwapCreateSerializer, SwapSerializer, SwapAcceptSerializer,
    SwapConfirmSerializer, SwapHistorySerializer, LocationSerializer,
    NotificationSerializer, ShareSerializer
)
from backend.library.models import Book
from backend.users.models import Follows
from django.conf import settings
import uuid

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

        qr_code_url = f"https://bookswap-bucket.s3.amazonaws.com/qr/{uuid.uuid4()}.png"

        serializer = SwapCreateSerializer(
            data=request.data,
            context={'request': request, 'qr_code_url': qr_code_url}
        )
        if serializer.is_valid():
            with transaction.atomic():
                swap = serializer.save()

                initiator_book.locked_until = timezone.now() + timedelta(hours=24)
                initiator_book.save()
                if swap.receiver_book:
                    swap.receiver_book.locked_until = timezone.now() + timedelta(hours=24)
                    swap.receiver_book.save()

                Notification.objects.create(
                    user=swap.receiver,
                    swap=swap,
                    type='swap_proposed',
                    message=f"{request.user.username} requested a swap."
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

                Notification.objects.create(
                    user=swap.initiator,
                    swap=swap,
                    type='swap_accepted',
                    message=f"{request.user.username} accepted your swap."
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

                    Notification.objects.bulk_create([
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
                    ])

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
            Notification.objects.create(
                user=other_user,
                swap=swap,
                type='swap_cancelled',
                message=f"{request.user.username} cancelled the swap."
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

        cache_key = f"midpoint_{user_lat}_{user_lon}_{other_lat}_{other_lon}"
        cached_result = cache.get(cache_key)
        if cached_result:
            return Response(cached_result, status=status.HTTP_200_OK)

        midpoint = {
            'latitude': (user_lat + other_lat) / 2,
            'longitude': (user_lon + other_lon) / 2
        }
        address = "Unknown location"
        if hasattr(settings, 'GOOGLE_MAPS_API_KEY'):
            try:
                response = requests.get(
                    f"https://maps.googleapis.com/maps/api/geocode/json?latlng={midpoint['latitude']},{midpoint['longitude']}&key={settings.GOOGLE_MAPS_API_KEY}",
                    timeout=5
                )
                response.raise_for_status()
                data = response.json()
                if data['status'] == 'OK' and data['results']:
                    address = data['results'][0]['formatted_address']
            except requests.RequestException:
                address = "Geocoding failed"

        nearby_locations = sorted(
            Location.objects.filter(is_active=True),
            key=lambda loc: haversine(midpoint, loc.coords)
        )[:5]

        serializer = LocationSerializer(nearby_locations, many=True)
        response_data = {
            "midpoint": {
                "latitude": midpoint['latitude'],
                "longitude": midpoint['longitude'],
                "address": address
            },
            "suggested_locations": serializer.data
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