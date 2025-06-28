import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwaps } from '../../hooks/useSwaps';
import { toast } from 'react-toastify';
import {
  MapPinIcon,
  PlusIcon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const LocationManager = ({ isOpen, onClose, onLocationSelect, selectedLocation }) => {
  const { addLocation, getMidpoint, isLoading } = useSwaps();
  const [showAddForm, setShowAddForm] = useState(false);
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    description: '',
    is_public: true
  });
  const [midpointData, setMidpointData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadSavedLocations();
      getCurrentLocation();
    }
  }, [isOpen]);

  const loadSavedLocations = () => {
    // Load from localStorage for now - in a real app this would come from backend
    const saved = localStorage.getItem('bookswap_locations');
    if (saved) {
      setLocations(JSON.parse(saved));
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  };

  const handleAddLocation = async () => {
    if (!newLocation.name || !newLocation.address) {
      toast.error('Please fill in name and address');
      return;
    }

    try {
      const result = await addLocation(newLocation);
      if (result) {
        const updatedLocations = [...locations, { ...newLocation, id: Date.now() }];
        setLocations(updatedLocations);
        localStorage.setItem('bookswap_locations', JSON.stringify(updatedLocations));
        
        setNewLocation({
          name: '',
          address: '',
          latitude: '',
          longitude: '',
          description: '',
          is_public: true
        });
        setShowAddForm(false);
        toast.success('Location added successfully!');
      }
    } catch (error) {
      toast.error('Failed to add location');
      console.error('Add location error:', error);
    }
  };

  const handleGetMidpoint = async (otherUserLocation) => {
    if (!userLocation) {
      toast.error('Your location is required for midpoint calculation');
      return;
    }

    try {
      const result = await getMidpoint({
        user1_lat: userLocation.latitude,
        user1_lng: userLocation.longitude,
        user2_lat: otherUserLocation.latitude,
        user2_lng: otherUserLocation.longitude
      });
      
      if (result) {
        setMidpointData(result);
        toast.success('Midpoint calculated successfully!');
      }
    } catch (error) {
      toast.error('Failed to calculate midpoint');
      console.error('Midpoint calculation error:', error);
    }
  };

  const handleLocationSelect = (location) => {
    onLocationSelect(location);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bookish-glass rounded-2xl border border-white/20 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl">
                <MapPinIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-lora font-bold text-primary">
                  Meetup Locations
                </h3>
                <p className="text-sm text-primary/70">
                  Choose or add a location for your book swap
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-primary/70" />
            </button>
          </div>

          {/* Current Selection */}
          {selectedLocation && (
            <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="w-5 h-5 text-accent" />
                <span className="font-semibold text-primary">Selected Location</span>
              </div>
              <p className="text-primary">{selectedLocation.name}</p>
              <p className="text-sm text-primary/70">{selectedLocation.address}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bookish-button-enhanced text-white rounded-xl"
            >
              <PlusIcon className="w-4 h-4" />
              Add Location
            </button>
            
            {userLocation && (
              <button
                onClick={() => handleGetMidpoint({ latitude: 0, longitude: 0 })} // Demo coordinates
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-primary"
              >
                <GlobeAltIcon className="w-4 h-4" />
                Find Midpoint
              </button>
            )}
          </div>

          {/* Add Location Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10"
              >
                <h4 className="font-semibold text-primary mb-4">Add New Location</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Location Name *
                    </label>
                    <input
                      type="text"
                      value={newLocation.name}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Central Library"
                      className="w-full px-3 py-2 bookish-input rounded-lg border-0 bg-white/10 text-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={newLocation.address}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Full address"
                      className="w-full px-3 py-2 bookish-input rounded-lg border-0 bg-white/10 text-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Latitude (optional)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newLocation.latitude}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, latitude: e.target.value }))}
                      placeholder="0.000000"
                      className="w-full px-3 py-2 bookish-input rounded-lg border-0 bg-white/10 text-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Longitude (optional)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newLocation.longitude}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, longitude: e.target.value }))}
                      placeholder="0.000000"
                      className="w-full px-3 py-2 bookish-input rounded-lg border-0 bg-white/10 text-primary"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-primary mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={newLocation.description}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional details about this location"
                    rows={2}
                    className="w-full px-3 py-2 bookish-input rounded-lg border-0 bg-white/10 text-primary resize-none"
                  />
                </div>
                
                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={newLocation.is_public}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, is_public: e.target.checked }))}
                    className="rounded border-white/20"
                  />
                  <label htmlFor="is_public" className="text-sm text-primary">
                    Make this location public for other users
                  </label>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddLocation}
                    disabled={isLoading}
                    className="flex-1 bookish-button-enhanced text-white py-2 rounded-lg disabled:opacity-50"
                  >
                    {isLoading ? 'Adding...' : 'Add Location'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Midpoint Results */}
          {midpointData && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <h4 className="font-semibold text-primary mb-2">Suggested Midpoint</h4>
              <p className="text-primary">{midpointData.name || 'Calculated Midpoint'}</p>
              <p className="text-sm text-primary/70">{midpointData.address}</p>
              <button
                onClick={() => handleLocationSelect(midpointData)}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Use This Location
              </button>
            </div>
          )}

          {/* Saved Locations */}
          <div>
            <h4 className="font-semibold text-primary mb-4">Saved Locations</h4>
            {locations.length === 0 ? (
              <div className="text-center py-8">
                <MapPinIcon className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                <p className="text-primary/70">No saved locations yet</p>
                <p className="text-sm text-primary/50">Add your first location above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {locations.map((location) => (
                  <motion.div
                    key={location.id}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-all"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleLocationSelect(location)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-primary">{location.name}</h5>
                        <p className="text-sm text-primary/70 mt-1">{location.address}</p>
                        {location.description && (
                          <p className="text-xs text-primary/50 mt-2">{location.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {location.is_public && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" title="Public location" />
                        )}
                        <MapPinIcon className="w-5 h-5 text-primary/50" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LocationManager;
