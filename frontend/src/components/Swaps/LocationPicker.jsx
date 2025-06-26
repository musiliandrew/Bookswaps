import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPinIcon, 
  StarIcon,
  ClockIcon,
  WifiIcon,
  CarIcon,
  ShieldCheckIcon,
  BuildingLibraryIcon,
  BuildingStorefrontIcon,
  HomeModernIcon,
  AcademicCapIcon,
  TrainIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useSwaps } from '../../hooks/useSwaps';

const LocationPicker = ({ 
  isOpen, 
  onClose, 
  onLocationSelect, 
  userLocation, 
  otherUserLocation,
  preferences = {}
}) => {
  const { getMidpoint } = useSwaps();
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    maxDistance: 10,
    minRating: 0
  });

  useEffect(() => {
    if (isOpen && userLocation && otherUserLocation) {
      loadSuggestedLocations();
    }
  }, [isOpen, userLocation, otherUserLocation, filters]);

  const loadSuggestedLocations = async () => {
    setIsLoading(true);
    try {
      const params = {
        user_lat: userLocation.latitude,
        user_lon: userLocation.longitude,
        other_lat: otherUserLocation.latitude,
        other_lon: otherUserLocation.longitude,
        transport_mode: preferences.transport_mode || 'driving',
        max_distance: filters.maxDistance
      };

      if (filters.type) {
        params.place_types = [filters.type];
      }

      const result = await getMidpoint(params);
      if (result && result.suggested_locations) {
        const filteredLocations = result.suggested_locations.filter(
          location => (location.rating || 0) >= filters.minRating
        );
        setLocations(filteredLocations);
      }
    } catch (error) {
      console.error('Failed to load locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationIcon = (type) => {
    const iconMap = {
      library: BuildingLibraryIcon,
      cafe: BuildingStorefrontIcon,
      bookstore: BuildingStorefrontIcon,
      hotel: HomeModernIcon,
      school: AcademicCapIcon,
      train_station: TrainIcon,
      mall: BuildingStorefrontIcon,
      restaurant: BuildingStorefrontIcon
    };
    
    const IconComponent = iconMap[type] || MapPinIcon;
    return <IconComponent className="w-5 h-5" />;
  };

  const getLocationTypeColor = (type) => {
    const colorMap = {
      library: 'text-blue-600 bg-blue-100',
      cafe: 'text-orange-600 bg-orange-100',
      bookstore: 'text-purple-600 bg-purple-100',
      hotel: 'text-green-600 bg-green-100',
      school: 'text-indigo-600 bg-indigo-100',
      train_station: 'text-gray-600 bg-gray-100',
      mall: 'text-pink-600 bg-pink-100',
      restaurant: 'text-red-600 bg-red-100'
    };
    
    return colorMap[type] || 'text-gray-600 bg-gray-100';
  };

  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIconSolid key={i} className="w-4 h-4 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className="w-4 h-4 text-gray-300" />
            <StarIconSolid className="w-4 h-4 text-yellow-400 absolute inset-0 clip-path-half" />
          </div>
        );
      } else {
        stars.push(
          <StarIcon key={i} className="w-4 h-4 text-gray-300" />
        );
      }
    }

    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="text-sm text-gray-600 ml-1">
          {rating ? rating.toFixed(1) : 'No rating'}
        </span>
      </div>
    );
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const confirmSelection = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h2 className="text-2xl font-bold mb-2">Choose Meetup Location</h2>
            <p className="text-blue-100">
              Select a safe, public place that's convenient for both parties
            </p>
          </div>

          {/* Filters */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Place Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="library">Libraries</option>
                  <option value="cafe">Cafes</option>
                  <option value="bookstore">Bookstores</option>
                  <option value="hotel">Hotels</option>
                  <option value="school">Schools</option>
                  <option value="mall">Shopping Malls</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Distance (km)
                </label>
                <select
                  value={filters.maxDistance}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={20}>20 km</option>
                  <option value={50}>50 km</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Rating
                </label>
                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={0}>Any Rating</option>
                  <option value={3}>3+ Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                </select>
              </div>
            </div>
          </div>

          {/* Locations List */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Finding optimal locations...</span>
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-12">
                <MapPinIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
                <p className="text-gray-600">Try adjusting your filters or expanding the search radius</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {locations.map((location, index) => (
                  <motion.div
                    key={location.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedLocation?.id === location.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => handleLocationSelect(location)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${getLocationTypeColor(location.type)}`}>
                          {getLocationIcon(location.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{location.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{location.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {location.distance?.toFixed(1) || 'N/A'} km
                        </div>
                        <div className="text-xs text-gray-500">from midpoint</div>
                      </div>
                    </div>

                    {renderRating(location.rating)}

                    {location.address && (
                      <p className="text-sm text-gray-600 mt-2">{location.address}</p>
                    )}

                    {/* Amenities */}
                    {location.amenities && location.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {location.amenities.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {amenity === 'wifi' && <WifiIcon className="w-3 h-3" />}
                            {amenity === 'parking' && <CarIcon className="w-3 h-3" />}
                            {amenity === 'security' && <ShieldCheckIcon className="w-3 h-3" />}
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Score */}
                    {location.score && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-500">
                          Match Score: {location.score}/100
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${Math.min(location.score, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50 flex justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmSelection}
              disabled={!selectedLocation}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Confirm Location
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LocationPicker;
