import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocieties } from '../../../hooks/useSocieties';
import { toast } from 'react-toastify';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  DocumentTextIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const CreateEventModal = ({ isOpen, onClose, societyId, onSuccess }) => {
  const { createSocietyEvent, isLoading } = useSocieties();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'DISCUSSION',
    start_time: '',
    end_time: '',
    location: '',
    max_attendees: '',
    is_virtual: false,
    meeting_link: '',
    tags: ''
  });

  const eventTypes = [
    { value: 'DISCUSSION', label: 'Book Discussion', icon: '📚' },
    { value: 'MEETUP', label: 'In-Person Meetup', icon: '🤝' },
    { value: 'READING', label: 'Reading Session', icon: '📖' },
    { value: 'WORKSHOP', label: 'Workshop', icon: '🎓' },
    { value: 'SOCIAL', label: 'Social Event', icon: '🎉' },
    { value: 'OTHER', label: 'Other', icon: '📅' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Event title is required');
      return;
    }
    
    if (!formData.start_time) {
      toast.error('Start time is required');
      return;
    }

    // Validate end time is after start time
    if (formData.end_time && new Date(formData.end_time) <= new Date(formData.start_time)) {
      toast.error('End time must be after start time');
      return;
    }

    const eventData = {
      ...formData,
      max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
    };

    try {
      const result = await createSocietyEvent(societyId, eventData);
      if (result) {
        toast.success('Event created successfully!');
        onSuccess?.(result);
        onClose();
        resetForm();
      }
    } catch (error) {
      toast.error('Failed to create event');
      console.error('Event creation error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: 'DISCUSSION',
      start_time: '',
      end_time: '',
      location: '',
      max_attendees: '',
      is_virtual: false,
      meeting_link: '',
      tags: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Get current date for min date validation
  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
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
                <CalendarIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-lora font-bold text-primary">
                  Create Society Event
                </h3>
                <p className="text-sm text-primary/70">
                  Organize an event for your society members
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-primary/70" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Monthly Book Discussion"
                  className="w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this event is about..."
                  rows={3}
                  className="w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary resize-none"
                />
              </div>
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-primary mb-3">
                Event Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {eventTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, event_type: type.value }))}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                      formData.event_type === type.value
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-white/20 bg-white/5 text-primary/70 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-lg">{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  min={minDateTime}
                  className="w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  min={formData.start_time || minDateTime}
                  className="w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary"
                />
              </div>
            </div>

            {/* Location and Virtual Options */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_virtual"
                  checked={formData.is_virtual}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_virtual: e.target.checked }))}
                  className="rounded border-white/20"
                />
                <label htmlFor="is_virtual" className="text-sm text-primary">
                  This is a virtual event
                </label>
              </div>

              {formData.is_virtual ? (
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    value={formData.meeting_link}
                    onChange={(e) => setFormData(prev => ({ ...prev, meeting_link: e.target.value }))}
                    placeholder="https://zoom.us/j/..."
                    className="w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Central Library, Room 201"
                    className="w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary"
                  />
                </div>
              )}
            </div>

            {/* Additional Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Max Attendees (optional)
                </label>
                <input
                  type="number"
                  value={formData.max_attendees}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_attendees: e.target.value }))}
                  placeholder="Leave empty for unlimited"
                  min="1"
                  className="w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., fiction, mystery, beginner"
                  className="w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.title.trim() || !formData.start_time}
                className="flex-1 bookish-button-enhanced text-white py-3 rounded-xl disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateEventModal;
