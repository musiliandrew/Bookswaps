import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocieties } from '../../../hooks/useSocieties';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  LinkIcon,
  TagIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

const EventDetailModal = ({ isOpen, onClose, event, societyId }) => {
  const { profile } = useAuth();
  const { rsvpToEvent, isLoading } = useSocieties();
  
  const [rsvpStatus, setRsvpStatus] = useState(null);
  const [attendeesList, setAttendeesList] = useState([]);

  useEffect(() => {
    if (event && profile) {
      // Check if user has RSVP'd
      const userRsvp = event.attendees?.find(a => a.user_id === profile.user_id);
      setRsvpStatus(userRsvp?.status || null);
      setAttendeesList(event.attendees || []);
    }
  }, [event, profile]);

  const handleRSVP = async (status) => {
    if (!event || !profile) return;

    try {
      const result = await rsvpToEvent(societyId, event.event_id, { status });
      if (result) {
        setRsvpStatus(status);
        toast.success(`RSVP updated: ${status}`);
        
        // Update attendees list
        const updatedAttendees = attendeesList.filter(a => a.user_id !== profile.user_id);
        if (status === 'ATTENDING') {
          updatedAttendees.push({
            user_id: profile.user_id,
            username: profile.username,
            status: 'ATTENDING'
          });
        }
        setAttendeesList(updatedAttendees);
      }
    } catch (error) {
      toast.error('Failed to update RSVP');
      console.error('RSVP error:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Join us for: ${event.title}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share failed:', error);
        copyEventLink();
      }
    } else {
      copyEventLink();
    }
  };

  const copyEventLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Event link copied to clipboard');
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getEventTypeIcon = (type) => {
    const icons = {
      'DISCUSSION': '📚',
      'MEETUP': '🤝',
      'READING': '📖',
      'WORKSHOP': '🎓',
      'SOCIAL': '🎉',
      'OTHER': '📅'
    };
    return icons[type] || '📅';
  };

  const attendingCount = attendeesList.filter(a => a.status === 'ATTENDING').length;
  const isEventPast = event && new Date(event.start_time) < new Date();
  const isEventFull = event?.max_attendees && attendingCount >= event.max_attendees;

  if (!isOpen || !event) return null;

  const startDateTime = formatDateTime(event.start_time);
  const endDateTime = event.end_time ? formatDateTime(event.end_time) : null;

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
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{getEventTypeIcon(event.event_type)}</span>
                <div>
                  <h3 className="text-xl font-lora font-bold text-primary">
                    {event.title}
                  </h3>
                  <p className="text-sm text-primary/70 capitalize">
                    {event.event_type.toLowerCase().replace('_', ' ')} Event
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Share event"
              >
                <ShareIcon className="w-5 h-5 text-primary/70" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-primary/70" />
              </button>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-6">
            {/* Description */}
            {event.description && (
              <div>
                <h4 className="font-semibold text-primary mb-2">Description</h4>
                <p className="text-primary/80 leading-relaxed">{event.description}</p>
              </div>
            )}

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                <CalendarIcon className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-semibold text-primary">Start</p>
                  <p className="text-sm text-primary/70">{startDateTime.date}</p>
                  <p className="text-sm text-primary/70">{startDateTime.time}</p>
                </div>
              </div>
              
              {endDateTime && (
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                  <ClockIcon className="w-5 h-5 text-accent" />
                  <div>
                    <p className="font-semibold text-primary">End</p>
                    <p className="text-sm text-primary/70">{endDateTime.date}</p>
                    <p className="text-sm text-primary/70">{endDateTime.time}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
              {event.is_virtual ? (
                <LinkIcon className="w-5 h-5 text-accent" />
              ) : (
                <MapPinIcon className="w-5 h-5 text-accent" />
              )}
              <div className="flex-1">
                <p className="font-semibold text-primary">
                  {event.is_virtual ? 'Virtual Event' : 'Location'}
                </p>
                {event.is_virtual ? (
                  event.meeting_link ? (
                    <a
                      href={event.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:text-accent/80 text-sm underline"
                    >
                      Join Meeting
                    </a>
                  ) : (
                    <p className="text-sm text-primary/70">Meeting link will be provided</p>
                  )
                ) : (
                  <p className="text-sm text-primary/70">
                    {event.location || 'Location to be announced'}
                  </p>
                )}
              </div>
            </div>

            {/* Attendees */}
            <div className="p-4 bg-white/5 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-accent" />
                  <span className="font-semibold text-primary">Attendees</span>
                </div>
                <span className="text-sm text-primary/70">
                  {attendingCount}
                  {event.max_attendees && ` / ${event.max_attendees}`}
                </span>
              </div>
              
              {attendeesList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {attendeesList
                    .filter(a => a.status === 'ATTENDING')
                    .slice(0, 10)
                    .map((attendee) => (
                      <div
                        key={attendee.user_id}
                        className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm"
                      >
                        <div className="w-6 h-6 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">
                            {attendee.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-primary">{attendee.username}</span>
                      </div>
                    ))}
                  {attendingCount > 10 && (
                    <span className="text-sm text-primary/70 px-3 py-1">
                      +{attendingCount - 10} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-primary/70">No attendees yet</p>
              )}
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div>
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <TagIcon className="w-4 h-4" />
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-accent/20 text-accent text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* RSVP Section */}
            {!isEventPast && (
              <div className="border-t border-white/10 pt-6">
                <h4 className="font-semibold text-primary mb-4">Will you attend?</h4>
                
                {rsvpStatus && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <p className="text-green-400 text-sm">
                      ✓ You've RSVP'd as: <strong>{rsvpStatus}</strong>
                    </p>
                  </div>
                )}

                {isEventFull && rsvpStatus !== 'ATTENDING' ? (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <p className="text-yellow-400 text-sm">
                      This event is full. You can join the waitlist.
                    </p>
                  </div>
                ) : null}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleRSVP('ATTENDING')}
                    disabled={isLoading}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors ${
                      rsvpStatus === 'ATTENDING'
                        ? 'bg-green-500 text-white'
                        : 'bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400'
                    }`}
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    {isLoading ? 'Updating...' : 'Attending'}
                  </button>
                  
                  <button
                    onClick={() => handleRSVP('NOT_ATTENDING')}
                    disabled={isLoading}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors ${
                      rsvpStatus === 'NOT_ATTENDING'
                        ? 'bg-red-500 text-white'
                        : 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400'
                    }`}
                  >
                    <XCircleIcon className="w-5 h-5" />
                    {isLoading ? 'Updating...' : 'Not Attending'}
                  </button>
                </div>
              </div>
            )}

            {isEventPast && (
              <div className="border-t border-white/10 pt-6">
                <div className="p-3 bg-gray-500/10 border border-gray-500/20 rounded-xl">
                  <p className="text-gray-400 text-sm text-center">
                    This event has already ended
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EventDetailModal;
