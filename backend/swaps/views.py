from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.core.cache import cache
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import timedelta
from .models import Notifications, Swaps, Locations
from django.db import transaction
from .serializers import SwapCreateSerializer, SwapSerializer, SwapAcceptSerializer, LocationSerializer, NotificationSerializer, ShareSerializer
from library.models import Books, Libraries, BookHistory
from rest_framework.pagination import PageNumberPagination
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point
from django.db.models import Q

import uuid
import qrcode 
from django.conf import settings
import requests


class InitiateSwapView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        initiator_book = Books.objects.get(book_id=request.data.get('initiator_book_id'))
        if not Libraries.objects.filter(user=request.user, book=initiator_book).exists():
            return Response({"error": "Not your book"}, status=status.HTTP_403_FORBIDDEN)
        if initiator_book.locked_until and initiator_book.locked_until > timezone.now():
            return Response({"error": "Book locked"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate unique qr_code_id
        qr_code_id = str(uuid.uuid4())
        
        serializer = SwapCreateSerializer(
            data=request.data,
            context={'initiator': request.user, 'qr_code_id': qr_code_id}
        )
        if serializer.is_valid():
            swap = serializer.save()
            
            # Generate and save QR code image
            qr = qrcode.make(qr_code_id)
            qr_path = f"static/qr/{qr_code_id}.png"
            qr.save(qr_path)
            
            # Lock books
            initiator_book.locked_until = timezone.now() + timedelta(hours=24)
            initiator_book.save()
            if swap.receiver_book:
                swap.receiver_book.locked_until = timezone.now() + timedelta(hours=24)
                swap.receiver_book.save()
            
            # Notify receiver
            Notifications.objects.create(
                user=swap.receiver,
                type='Swap',
                content={'swap_id': str(swap.swap_id), 'message': f"{request.user.username} requested a swap"}
            )
            
            return Response(SwapSerializer(swap).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AcceptSwapView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, swap_id):
        # Fetch swap, ensure only the intended receiver can accept
        swap = get_object_or_404(Swaps, swap_id=swap_id, receiver=request.user, status='Requested')

        serializer = SwapAcceptSerializer(swap, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(status='Accepted')  # Update status to Accepted

            # Notify initiator
            Notifications.objects.create(
                user=swap.initiator,
                type='Swap',
                content={
                    'swap_id': str(swap.swap_id),
                    'message': f"{request.user.username} accepted your swap."
                }
            )

            return Response({
                "swap_id": str(swap.swap_id),
                "status": "Accepted",
                "meetup_location": serializer.validated_data['meetup_location'],
                "meetup_time": serializer.validated_data['meetup_time']
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ConfirmSwapView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, swap_id):
        swap = get_object_or_404(Swaps, swap_id=swap_id)

        if request.user not in [swap.initiator, swap.receiver]:
            return Response({"error": "Unauthorized user"}, status=status.HTTP_403_FORBIDDEN)

        if swap.status != "Accepted":
            return Response({"error": "Swap not in Accepted state"}, status=status.HTTP_400_BAD_REQUEST)

        if swap.qr_code_id != request.data.get("qr_code_id"):
            return Response({"error": "Invalid QR Code"}, status=status.HTTP_400_BAD_REQUEST)

        # Track confirmations via cache
        cache_key = f"swap_confirm_{swap_id}"
        confirmations = cache.get(cache_key, set())
        confirmations.add(str(request.user.id))
        cache.set(cache_key, confirmations, timeout=3600)  # 1 hour TTL

        # Check if both confirmed
        if {str(swap.initiator.id), str(swap.receiver.id)}.issubset(confirmations):
            swap.status = "Completed"

            initiator_book = swap.initiator_book
            receiver_book = swap.receiver_book

            if receiver_book:
                # Swap logic
                initiator_book.owner, receiver_book.owner = swap.receiver, swap.initiator
                initiator_book.save()
                receiver_book.save()

                Libraries.objects.filter(user=swap.initiator, book=initiator_book).delete()
                Libraries.objects.filter(user=swap.receiver, book=receiver_book).delete()

                Libraries.objects.create(user=swap.receiver, book=initiator_book, status='Owned')
                Libraries.objects.create(user=swap.initiator, book=receiver_book, status='Owned')
            else:
                # Borrow logic
                Libraries.objects.create(user=swap.receiver, book=initiator_book, status='Borrowed')

            # Unlock books
            initiator_book.locked_until = None
            initiator_book.save()
            if receiver_book:
                receiver_book.locked_until = None
                receiver_book.save()

            # Book history
            BookHistory.objects.create(
                book=initiator_book, user=swap.receiver,
                status='Swapped' if receiver_book else 'Borrowed'
            )
            if receiver_book:
                BookHistory.objects.create(book=receiver_book, user=swap.initiator, status='Swapped')

            # Notify both users
            Notifications.objects.bulk_create([
                Notifications(
                    user=swap.initiator, type='Swap',
                    content={'swap_id': str(swap.swap_id), 'message': "Swap completed"}
                ),
                Notifications(
                    user=swap.receiver, type='Swap',
                    content={'swap_id': str(swap.swap_id), 'message': "Swap completed"}
                )
            ])

            # Clear cache
            cache.delete(cache_key)
        else:
            swap.status = "Confirmed"  # Intermediate state, one user confirmed

        swap.save()
        return Response({
            "swap_id": str(swap.swap_id),
            "status": swap.status,
            "confirmed_users": list(confirmations)
        }, status=status.HTTP_200_OK)
    
class CancelSwapView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, swap_id):
        swap = get_object_or_404(Swaps, swap_id=swap_id)

        if request.user not in [swap.initiator, swap.receiver]:
            return Response({"error": "Not part of this swap"}, status=status.HTTP_403_FORBIDDEN)

        if swap.status == 'Completed':
            return Response({"error": "Swap already completed"}, status=status.HTTP_400_BAD_REQUEST)

        if swap.status == 'Cancelled':
            return Response({"message": "Swap already cancelled"}, status=status.HTTP_200_OK)

        # Perform cancellation
        swap.status = 'Cancelled'
        swap.initiator_book.locked_until = None
        swap.initiator_book.save()

        if swap.receiver_book:
            swap.receiver_book.locked_until = None
            swap.receiver_book.save()

        swap.save()

        other_user = swap.receiver if request.user == swap.initiator else swap.initiator
        Notifications.objects.create(
            user=other_user,
            type='Swap',
            content={
                'swap_id': str(swap.swap_id),
                'message': f"{request.user.username} cancelled the swap",
                'cancelled_at': timezone.now().isoformat()
            }
        )

        return Response({"swap_id": str(swap.swap_id), "status": swap.status}, status=status.HTTP_200_OK)
    
class SwapListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch swaps where the authenticated user is either the initiator or receiver
        swaps = Swaps.objects.filter(
            Q(initiator=request.user) | Q(receiver=request.user)
        ).select_related('initiator', 'receiver', 'initiator_book', 'receiver_book')

        # Optional filtering by status
        status_param = request.query_params.get('status')
        if status_param:
            swaps = swaps.filter(status=status_param)

        # Paginate results
        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(swaps.order_by('-created_at'), request)

        # Serialize data
        serializer = SwapSerializer(result_page, many=True)

        return paginator.get_paginated_response(serializer.data)
    
class AddLocationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LocationSerializer(data=request.data)
        
        if serializer.is_valid():
            latitude = serializer.validated_data.get('latitude')
            longitude = serializer.validated_data.get('longitude')
            is_default = serializer.validated_data.get('is_default', False)

            # Basic lat/lng validation (range check)
            if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
                return Response(
                    {"error": "Invalid latitude or longitude."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                with transaction.atomic():
                    # Remove other defaults if this one is going to be default
                    if is_default:
                        Locations.objects.filter(user=request.user, is_default=True).update(is_default=False)

                    # Save new location
                    location = Locations.objects.create(
                        user=request.user,
                        coords={"lat": latitude, "lng": longitude},
                        is_active=True,  # optional: mark new entries active by default
                        verified=False,  # assuming user-added locations start unverified
                        name="User Drop",  # placeholder name if none provided
                        type="User Submitted",  # or 'Manual'
                        city="Unknown",  # might want to update with reverse geocoding
                        **{k: v for k, v in serializer.validated_data.items() if k not in ['latitude', 'longitude']}
                    )

                    # Include coords in the response explicitly
                    response_data = {
                        "location_id": str(location.location_id),
                        "latitude": latitude,
                        "longitude": longitude,
                        "is_default": location.is_default,
                    }

                    return Response(response_data, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response(
                    {"error": f"Something went wrong: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Filter notifications by user
        notifications = Notifications.objects.filter(user=request.user)
        
        # Apply filters if query params are present
        if 'is_read' in request.query_params:
            is_read = request.query_params['is_read'].lower() == 'true'
            notifications = notifications.filter(is_read=is_read)
        
        if 'type' in request.query_params:
            notification_type = request.query_params['type']
            notifications = notifications.filter(type=notification_type)
        
        # Pagination
        paginator = PageNumberPagination()
        result = paginator.paginate_queryset(notifications.order_by('-created_at'), request)
        
        # Serialize the data
        serializer = NotificationSerializer(result, many=True)
        
        # Return paginated response
        return paginator.get_paginated_response(serializer.data)
    
class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, notification_id):
        notification = get_object_or_404(Notifications, notification_id=notification_id, user=request.user)
        notification.is_read = True
        notification.save()
        return Response({
            "notification_id": str(notification.notification_id),
            "is_read": notification.is_read
        }, status=status.HTTP_200_OK)
        
class ShareView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = ShareSerializer(data=request.data, context={'user': request.user})
        if serializer.is_valid():
            share = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class MidpointView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Expect user to provide their coords and other user's coords
        user_lat = float(request.query_params.get('user_lat'))
        user_lon = float(request.query_params.get('user_lon'))
        other_lat = float(request.query_params.get('other_lat'))
        other_lon = float(request.query_params.get('other_lon'))

        if not all([user_lat, user_lon, other_lat, other_lon]):
            return Response({"error": "Missing coordinates"}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate midpoint
        lat = (user_lat + other_lat) / 2
        lon = (user_lon + other_lon) / 2

        # Get formatted address from Google Maps
        try:
            response = requests.get(
                f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lon}&key={settings.GOOGLE_MAPS_API_KEY}"
            )
            response.raise_for_status()
            data = response.json()
            address = data['results'][0]['formatted_address'] if data['status'] == 'OK' and data['results'] else "Unknown location"
        except requests.RequestException:
            address = "Geocoding failed"

        # Find nearby active locations (within 5km, sorted by popularity)
        midpoint = Point(lon, lat, srid=4326)
        nearby_locations = Locations.objects.filter(
            is_active=True
        ).annotate(
            distance=Distance('coords', midpoint)
        ).order_by('-popularity_score', 'distance')[:5]

        serializer = LocationSerializer(nearby_locations, many=True)
        return Response({
            "midpoint": {
                "latitude": lat,
                "longitude": lon,
                "address": address
            },
            "suggested_locations": serializer.data
        })
    
class GetQRCodeView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, swap_id):
        swap = Swaps.objects.get(swap_id=swap_id)
        if request.user not in [swap.initiator, swap.receiver]:
            return Response({"error": "Not part of swap"}, status=status.HTTP_403_FORBIDDEN)
        if not swap.qr_code_id:
            return Response({"error": "No QR code generated"}, status=status.HTTP_400_BAD_REQUEST)
        qr_url = f"{settings.STATIC_URL}qr/{swap.qr_code_id}.png"
        return Response({"qr_code_id": swap.qr_code_id, "qr_url": qr_url})