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
              <SocietyEvents events={societyEvents} societyId={societyId} isMember={isMember} />
            )}
            {activeTab === 'discussions' && (
              <SocietyDiscussions societyId={societyId} isMember={isMember} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
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

const SocietyEvents = ({ events, societyId, isMember }) => (
  <div className="bookish-glass rounded-2xl border border-white/20 p-8">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-lora font-bold text-primary">Events</h3>
      {isMember && (
        <button className="flex items-center gap-2 bookish-button-enhanced text-white px-4 py-2 rounded-xl">
          <PlusIcon className="w-4 h-4" />
          Create Event
        </button>
      )}
    </div>
    {events?.length === 0 ? (
      <p className="text-primary/70 text-center py-8">No events scheduled yet.</p>
    ) : (
      <div className="space-y-4">
        {events?.map((event) => (
          <div key={event.event_id} className="p-4 bg-white/5 rounded-xl">
            <h4 className="font-semibold text-primary">{event.title}</h4>
            <p className="text-sm text-primary/70 mt-1">{event.description}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

const SocietyDiscussions = ({ societyId, isMember }) => (
  <div className="bookish-glass rounded-2xl border border-white/20 p-8">
    <h3 className="text-xl font-lora font-bold text-primary mb-6">Society Discussions</h3>
    <p className="text-primary/70 text-center py-8">
      Society-specific discussions coming soon!
    </p>
  </div>
);

export default SocietyDetailPage;
