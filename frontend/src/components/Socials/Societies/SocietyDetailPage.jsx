import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocieties } from '../../../hooks/useSocieties';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  UsersIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  PlusIcon,
  ArrowLeftIcon,
  Cog6ToothIcon,
  UserPlusIcon,
  UserMinusIcon,
  BookOpenIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import CreateEventModal from './CreateEventModal';
import EventDetailModal from './EventDetailModal';

const SocietyDetailPage = () => {
  const { societyId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const {
    getSociety,
    joinSociety,
    leaveSociety,
    getSocietyMembers,
    getSocietyEvents,
    society,
    societyMembers,
    societyEvents,
    isLoading,
    error
  } = useSocieties();

  const [activeTab, setActiveTab] = useState('overview');
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (societyId) {
      loadSocietyData();
    }
  }, [societyId]);

  useEffect(() => {
    if (society && societyMembers && profile) {
      const membership = societyMembers.find(m => m.user.user_id === profile.user_id);
      setIsMember(!!membership);
      setIsAdmin(membership?.role === 'ADMIN' || membership?.role === 'MODERATOR');
    }
  }, [society, societyMembers, profile]);

  const loadSocietyData = async () => {
    try {
      await Promise.all([
        getSociety(societyId),
        getSocietyMembers(societyId),
        getSocietyEvents(societyId)
      ]);
    } catch (error) {
      console.error('Error loading society data:', error);
      toast.error('Failed to load society information');
    }
  };

  const handleJoinSociety = async () => {
    try {
      const result = await joinSociety(societyId);
      if (result) {
        toast.success('Successfully joined the society!');
        loadSocietyData(); // Refresh data
      }
    } catch (error) {
      toast.error('Failed to join society');
    }
  };

  const handleLeaveSociety = async () => {
    if (window.confirm('Are you sure you want to leave this society?')) {
      try {
        const result = await leaveSociety(societyId);
        if (result) {
          toast.success('Successfully left the society');
          loadSocietyData(); // Refresh data
        }
      } catch (error) {
        toast.error('Failed to leave society');
      }
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventDetailModal(true);
  };

  const handleEventCreated = () => {
    loadSocietyData(); // Refresh events
    setShowCreateEventModal(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BookOpenIcon className="w-4 h-4" /> },
    { id: 'members', label: 'Members', icon: <UsersIcon className="w-4 h-4" /> },
    { id: 'events', label: 'Events', icon: <CalendarIcon className="w-4 h-4" /> },
    { id: 'discussions', label: 'Discussions', icon: <ChatBubbleLeftRightIcon className="w-4 h-4" /> }
  ];

  if (isLoading && !society) {
    return (
      <div className="min-h-screen bookish-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto mb-4"></div>
          <p className="text-primary">Loading society...</p>
        </div>
      </div>
    );
  }

  if (error || !society) {
    return (
      <div className="min-h-screen bookish-gradient flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Society Not Found</h2>
          <button
            onClick={() => navigate('/socials')}
            className="bookish-button-enhanced text-white px-6 py-3 rounded-xl"
          >
            Back to Socials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bookish-gradient font-open-sans text-text">
      {/* Header */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-accent rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-primary rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 pt-20 pb-8">
          <div className="max-w-6xl mx-auto px-4">
            {/* Back Button */}
            <button
              onClick={() => navigate('/socials')}
              className="flex items-center gap-2 text-primary/70 hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Socials
            </button>

            {/* Society Header */}
            <div className="bookish-glass rounded-2xl border border-white/20 p-8">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                {/* Society Icon */}
                <div className="flex-shrink-0">
                  {society.icon_url ? (
                    <img
                      src={society.icon_url}
                      alt={society.name}
                      className="w-24 h-24 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl flex items-center justify-center">
                      <UsersIcon className="w-12 h-12 text-primary" />
                    </div>
                  )}
                </div>

                {/* Society Info */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-lora font-bold text-primary mb-2">
                        {society.name}
                      </h1>
                      <p className="text-primary/70 mb-4 max-w-2xl">
                        {society.description}
                      </p>
                      
                      {/* Society Meta */}
                      <div className="flex flex-wrap gap-4 text-sm text-primary/60">
                        <div className="flex items-center gap-1">
                          <UsersIcon className="w-4 h-4" />
                          <span>{societyMembers?.length || 0} members</span>
                        </div>
                        {society.focus_type && (
                          <div className="flex items-center gap-1">
                            <TagIcon className="w-4 h-4" />
                            <span>{society.focus_type}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${
                            society.visibility === 'public' ? 'bg-green-500' : 'bg-yellow-500'
                          }`} />
                          <span>{society.visibility}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {!isMember ? (
                        <button
                          onClick={handleJoinSociety}
                          disabled={isLoading}
                          className="flex items-center gap-2 bookish-button-enhanced text-white px-6 py-3 rounded-xl disabled:opacity-50"
                        >
                          <UserPlusIcon className="w-5 h-5" />
                          Join Society
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => navigate(`/socials/societies/${societyId}/chat`)}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-colors"
                          >
                            <ChatBubbleLeftRightIcon className="w-5 h-5" />
                            Chat
                          </button>
                          
                          {isAdmin && (
                            <button
                              onClick={() => navigate(`/socials/societies/${societyId}/settings`)}
                              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-primary px-6 py-3 rounded-xl transition-colors"
                            >
                              <Cog6ToothIcon className="w-5 h-5" />
                              Settings
                            </button>
                          )}
                          
                          <button
                            onClick={handleLeaveSociety}
                            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-6 py-3 rounded-xl transition-colors"
                          >
                            <UserMinusIcon className="w-5 h-5" />
                            Leave
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="bookish-glass rounded-2xl border border-white/20 p-2">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-accent to-primary text-white shadow-lg'
                    : 'text-primary/70 hover:text-primary hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <SocietyOverview society={society} />
            )}
            {activeTab === 'members' && (
              <SocietyMembers members={societyMembers} isAdmin={isAdmin} />
            )}
            {activeTab === 'events' && (
              <SocietyEvents
                events={societyEvents}
                societyId={societyId}
                isMember={isMember}
                isAdmin={isAdmin}
                onEventClick={handleEventClick}
                onCreateEvent={() => setShowCreateEventModal(true)}
              />
            )}
            {activeTab === 'discussions' && (
              <SocietyDiscussions societyId={societyId} isMember={isMember} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals */}
      <CreateEventModal
        isOpen={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        societyId={societyId}
        onSuccess={handleEventCreated}
      />

      <EventDetailModal
        isOpen={showEventDetailModal}
        onClose={() => setShowEventDetailModal(false)}
        event={selectedEvent}
        societyId={societyId}
      />
    </div>
  );
};

// Placeholder components for tab content
const SocietyOverview = ({ society }) => (
  <div className="bookish-glass rounded-2xl border border-white/20 p-8">
    <h3 className="text-xl font-lora font-bold text-primary mb-4">About This Society</h3>
    <p className="text-primary/70 leading-relaxed">
      {society.description || 'No description available.'}
    </p>
  </div>
);

const SocietyMembers = ({ members, isAdmin }) => (
  <div className="bookish-glass rounded-2xl border border-white/20 p-8">
    <h3 className="text-xl font-lora font-bold text-primary mb-6">Members ({members?.length || 0})</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members?.map((member) => (
        <div key={member.user.user_id} className="p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center">
              <span className="text-primary font-semibold">
                {member.user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-primary">{member.user.username}</p>
              <p className="text-xs text-primary/60">{member.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SocietyEvents = ({ events, societyId, isMember, isAdmin, onEventClick, onCreateEvent }) => {
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

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isUpcoming = date > now;

    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUpcoming
    };
  };

  return (
    <div className="bookish-glass rounded-2xl border border-white/20 p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-lora font-bold text-primary">Events</h3>
        {(isMember || isAdmin) && (
          <button
            onClick={onCreateEvent}
            className="flex items-center gap-2 bookish-button-enhanced text-white px-4 py-2 rounded-xl"
          >
            <PlusIcon className="w-4 h-4" />
            Create Event
          </button>
        )}
      </div>

      {events?.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="w-16 h-16 text-primary/30 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-primary mb-2">No Events Yet</h4>
          <p className="text-primary/70 mb-6">
            {isMember || isAdmin
              ? "Be the first to create an event for this society!"
              : "No events scheduled yet."
            }
          </p>
          {(isMember || isAdmin) && (
            <button
              onClick={onCreateEvent}
              className="bookish-button-enhanced text-white px-6 py-3 rounded-xl"
            >
              Create First Event
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const eventDate = formatEventDate(event.start_time);
            const attendeeCount = event.attendees?.filter(a => a.status === 'ATTENDING').length || 0;

            return (
              <motion.div
                key={event.event_id}
                className="p-6 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                onClick={() => onEventClick(event)}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getEventTypeIcon(event.event_type)}</div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-primary text-lg">{event.title}</h4>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        eventDate.isUpcoming
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {eventDate.isUpcoming ? 'Upcoming' : 'Past'}
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-primary/70 mb-3 line-clamp-2">{event.description}</p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-primary/60">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{eventDate.date} at {eventDate.time}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <UsersIcon className="w-4 h-4" />
                        <span>{attendeeCount} attending</span>
                      </div>

                      {event.is_virtual && (
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span>Virtual</span>
                        </div>
                      )}

                      {event.location && !event.is_virtual && (
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="truncate max-w-32">{event.location}</span>
                        </div>
                      )}
                    </div>

                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {event.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {event.tags.length > 3 && (
                          <span className="px-2 py-1 bg-white/10 text-primary/60 text-xs rounded-full">
                            +{event.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SocietyDiscussions = ({ societyId, isMember }) => (
  <div className="bookish-glass rounded-2xl border border-white/20 p-8">
    <h3 className="text-xl font-lora font-bold text-primary mb-6">Society Discussions</h3>
    <p className="text-primary/70 text-center py-8">
      Society-specific discussions coming soon!
    </p>
  </div>
);

export default SocietyDetailPage;
