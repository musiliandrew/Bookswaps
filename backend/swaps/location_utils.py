"""
Advanced location discovery and midpoint calculation for swap meetups
"""
import requests
import json
from math import radians, sin, cos, sqrt, atan2, degrees, atan
from django.conf import settings
from django.core.cache import cache
from .models import Location
import logging

logger = logging.getLogger(__name__)


class LocationDiscoveryService:
    """Advanced service for discovering optimal meetup locations"""
    
    def __init__(self):
        self.google_api_key = getattr(settings, 'GOOGLE_MAPS_API_KEY', None)
        self.places_api_url = "https://maps.googleapis.com/maps/api/place"
    
    def calculate_optimal_midpoint(self, coord1, coord2, preferences=None):
        """
        Calculate optimal midpoint considering travel routes and preferences
        
        Args:
            coord1: First user's coordinates
            coord2: Second user's coordinates
            preferences: Dict with user preferences (transport_mode, place_types, etc.)
            
        Returns:
            dict: Optimal midpoint with suggested locations
        """
        # Basic geometric midpoint
        basic_midpoint = {
            'latitude': (coord1['latitude'] + coord2['latitude']) / 2,
            'longitude': (coord1['longitude'] + coord2['longitude']) / 2
        }
        
        # If Google Maps API is available, get route-based midpoint
        if self.google_api_key:
            route_midpoint = self._get_route_based_midpoint(coord1, coord2, preferences)
            if route_midpoint:
                midpoint = route_midpoint
            else:
                midpoint = basic_midpoint
        else:
            midpoint = basic_midpoint
        
        # Find optimal public places near midpoint
        suggested_locations = self._find_optimal_locations(
            midpoint, 
            coord1, 
            coord2, 
            preferences
        )
        
        return {
            'midpoint': midpoint,
            'suggested_locations': suggested_locations,
            'distance_from_user1': self._calculate_distance(coord1, midpoint),
            'distance_from_user2': self._calculate_distance(coord2, midpoint)
        }
    
    def _get_route_based_midpoint(self, coord1, coord2, preferences=None):
        """Get midpoint based on actual travel routes"""
        try:
            transport_mode = preferences.get('transport_mode', 'driving') if preferences else 'driving'
            
            # Get route from Google Directions API
            url = f"{self.places_api_url}/../directions/json"
            params = {
                'origin': f"{coord1['latitude']},{coord1['longitude']}",
                'destination': f"{coord2['latitude']},{coord2['longitude']}",
                'mode': transport_mode,
                'key': self.google_api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data['status'] == 'OK' and data['routes']:
                route = data['routes'][0]
                legs = route['legs']
                
                # Find midpoint along the route
                total_distance = sum(leg['distance']['value'] for leg in legs)
                target_distance = total_distance / 2
                
                current_distance = 0
                for leg in legs:
                    if current_distance + leg['distance']['value'] >= target_distance:
                        # Midpoint is in this leg
                        steps = leg['steps']
                        remaining_distance = target_distance - current_distance
                        
                        step_distance = 0
                        for step in steps:
                            if step_distance + step['distance']['value'] >= remaining_distance:
                                # Return the end location of this step as midpoint
                                return {
                                    'latitude': step['end_location']['lat'],
                                    'longitude': step['end_location']['lng']
                                }
                            step_distance += step['distance']['value']
                    current_distance += leg['distance']['value']
            
            return None
            
        except Exception as e:
            logger.warning(f"Failed to get route-based midpoint: {e}")
            return None
    
    def _find_optimal_locations(self, midpoint, coord1, coord2, preferences=None):
        """Find optimal public places near the midpoint"""
        # Define search radius (5km)
        search_radius = 5000  # meters
        
        # Priority order for place types
        place_type_priority = {
            'library': 10,
            'cafe': 9,
            'bookstore': 8,
            'community_center': 7,
            'hotel': 6,
            'restaurant': 5,
            'mall': 4,
            'school': 3,
            'train_station': 2,
            'park': 1
        }
        
        # Get preferred place types from preferences
        preferred_types = preferences.get('place_types', []) if preferences else []
        
        # First, check our database for existing locations
        db_locations = self._get_database_locations(midpoint, search_radius)
        
        # If Google Places API is available, search for additional locations
        if self.google_api_key:
            api_locations = self._search_google_places(midpoint, search_radius, preferred_types)
            # Merge and deduplicate locations
            all_locations = self._merge_locations(db_locations, api_locations)
        else:
            all_locations = db_locations
        
        # Score and rank locations
        scored_locations = []
        for location in all_locations:
            score = self._calculate_location_score(
                location, midpoint, coord1, coord2, place_type_priority, preferred_types
            )
            scored_locations.append({
                **location,
                'score': score
            })
        
        # Sort by score and return top 10
        scored_locations.sort(key=lambda x: x['score'], reverse=True)
        return scored_locations[:10]
    
    def _get_database_locations(self, midpoint, radius_meters):
        """Get locations from our database within radius"""
        # Convert radius to approximate degrees (rough approximation)
        radius_degrees = radius_meters / 111000  # 1 degree ≈ 111km
        
        locations = Location.objects.filter(
            is_active=True,
            coords__latitude__gte=midpoint['latitude'] - radius_degrees,
            coords__latitude__lte=midpoint['latitude'] + radius_degrees,
            coords__longitude__gte=midpoint['longitude'] - radius_degrees,
            coords__longitude__lte=midpoint['longitude'] + radius_degrees
        )
        
        # Filter by actual distance and convert to dict format
        result = []
        for location in locations:
            distance = self._calculate_distance(midpoint, location.coords)
            if distance <= radius_meters / 1000:  # Convert to km
                result.append({
                    'id': str(location.location_id),
                    'name': location.name,
                    'type': location.type,
                    'coords': location.coords,
                    'address': location.address,
                    'rating': location.rating or 0,
                    'safety_score': location.safety_score,
                    'usage_count': location.usage_count,
                    'amenities': location.amenities,
                    'opening_hours': location.opening_hours,
                    'source': 'database',
                    'distance': distance
                })
        
        return result
    
    def _search_google_places(self, midpoint, radius, preferred_types):
        """Search Google Places API for locations"""
        try:
            # Map our types to Google Places types
            google_type_mapping = {
                'library': 'library',
                'cafe': 'cafe',
                'bookstore': 'book_store',
                'hotel': 'lodging',
                'restaurant': 'restaurant',
                'mall': 'shopping_mall',
                'school': 'school',
                'train_station': 'transit_station',
                'park': 'park',
                'community_center': 'community_center'
            }
            
            all_places = []
            search_types = preferred_types if preferred_types else list(google_type_mapping.keys())
            
            for place_type in search_types[:5]:  # Limit to 5 types to avoid API limits
                google_type = google_type_mapping.get(place_type, place_type)
                
                url = f"{self.places_api_url}/nearbysearch/json"
                params = {
                    'location': f"{midpoint['latitude']},{midpoint['longitude']}",
                    'radius': radius,
                    'type': google_type,
                    'key': self.google_api_key
                }
                
                response = requests.get(url, params=params, timeout=10)
                response.raise_for_status()
                data = response.json()
                
                if data['status'] == 'OK':
                    for place in data.get('results', []):
                        all_places.append({
                            'id': place['place_id'],
                            'name': place['name'],
                            'type': place_type,
                            'coords': {
                                'latitude': place['geometry']['location']['lat'],
                                'longitude': place['geometry']['location']['lng']
                            },
                            'address': place.get('vicinity', ''),
                            'rating': place.get('rating', 0),
                            'safety_score': 4.0,  # Default safety score
                            'usage_count': 0,
                            'amenities': [],
                            'opening_hours': place.get('opening_hours', {}),
                            'source': 'google_places',
                            'distance': self._calculate_distance(
                                midpoint, 
                                {
                                    'latitude': place['geometry']['location']['lat'],
                                    'longitude': place['geometry']['location']['lng']
                                }
                            )
                        })
            
            return all_places
            
        except Exception as e:
            logger.warning(f"Failed to search Google Places: {e}")
            return []
    
    def _merge_locations(self, db_locations, api_locations):
        """Merge and deduplicate locations from different sources"""
        # Simple deduplication based on name and proximity
        merged = list(db_locations)
        
        for api_loc in api_locations:
            is_duplicate = False
            for db_loc in db_locations:
                # Check if locations are very close (within 50 meters) and have similar names
                distance = self._calculate_distance(api_loc['coords'], db_loc['coords'])
                if distance < 0.05 and self._similar_names(api_loc['name'], db_loc['name']):
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                merged.append(api_loc)
        
        return merged
    
    def _similar_names(self, name1, name2):
        """Check if two location names are similar"""
        # Simple similarity check
        name1_clean = name1.lower().replace(' ', '')
        name2_clean = name2.lower().replace(' ', '')
        
        # Check if one name contains the other
        return name1_clean in name2_clean or name2_clean in name1_clean
    
    def _calculate_location_score(self, location, midpoint, coord1, coord2, type_priority, preferred_types):
        """Calculate a score for a location based on various factors"""
        score = 0
        
        # Base score from type priority
        score += type_priority.get(location['type'], 0) * 10
        
        # Bonus for preferred types
        if location['type'] in preferred_types:
            score += 20
        
        # Distance factor (closer to midpoint is better)
        distance_from_midpoint = location['distance']
        distance_score = max(0, 5 - distance_from_midpoint)  # 5km max, linear decay
        score += distance_score * 10
        
        # Balance factor (equal distance from both users is better)
        dist1 = self._calculate_distance(coord1, location['coords'])
        dist2 = self._calculate_distance(coord2, location['coords'])
        balance_factor = 1 - abs(dist1 - dist2) / max(dist1, dist2, 1)
        score += balance_factor * 15
        
        # Rating factor
        score += (location.get('rating', 0) / 5) * 10
        
        # Safety factor
        score += (location.get('safety_score', 0) / 5) * 10
        
        # Usage count factor (popular locations get bonus)
        usage_bonus = min(location.get('usage_count', 0) / 10, 5)
        score += usage_bonus
        
        # Amenities bonus
        amenities_count = len(location.get('amenities', []))
        score += min(amenities_count, 5)
        
        return round(score, 2)
    
    def _calculate_distance(self, coord1, coord2):
        """Calculate distance between two coordinates in kilometers"""
        # Haversine formula
        lat1, lon1 = radians(coord1['latitude']), radians(coord1['longitude'])
        lat2, lon2 = radians(coord2['latitude']), radians(coord2['longitude'])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        # Earth's radius in kilometers
        R = 6371
        return R * c


# Global instance
location_service = LocationDiscoveryService()
