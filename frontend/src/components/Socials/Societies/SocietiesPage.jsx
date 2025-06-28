import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSocieties } from '../../../hooks/useSocieties';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  GlobeAltIcon,
  LockClosedIcon,
  BookOpenIcon,
  TagIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import CreateSocietyModal from './CreateSocietyModal';
import Pagination from '../../Common/Pagination';

const SocietiesPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const {
    listSocieties,
    joinSociety,
    leaveSociety,
    societies,
    isLoading,
    error,
    pagination
  } = useSocieties();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    visibility: '',
    focus_type: '',
    my_societies: false
  });
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadSocieties();
  }, [filters, activeTab]);

  const loadSocieties = async (page = 1) => {
    const searchFilters = { ...filters };
    if (activeTab === 'my_societies') {
      searchFilters.my_societies = true;
    }
    await listSocieties(searchFilters, page);
  };

  const handleJoinSociety = async (societyId) => {
    try {
      const result = await joinSociety(societyId);
      if (result) {
        toast.success('Successfully joined the society!');
        loadSocieties(); // Refresh the list
      }
    } catch (error) {
      toast.error('Failed to join society');
    }
  };

  const handleLeaveSociety = async (societyId) => {
    if (window.confirm('Are you sure you want to leave this society?')) {
      try {
        const result = await leaveSociety(societyId);
        if (result) {
          toast.success('Successfully left the society');
          loadSocieties(); // Refresh the list
        }
      } catch (error) {
        toast.error('Failed to leave society');
      }
    }
  };

  const handleSocietyClick = (society) => {
    navigate(`/socials/societies/${society.society_id}`);
  };

  const tabs = [
    { id: 'all', label: 'All Societies', count: societies?.length || 0 },
    { id: 'my_societies', label: 'My Societies', count: 0 }, // Would need to calculate this
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h2 className="text-3xl font-lora font-bold text-primary mb-2">
            Reading Societies
          </h2>
          <p className="text-primary/70">
            Join communities of readers who share your interests
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bookish-button-enhanced text-white px-6 py-3 rounded-xl"
        >
          <PlusIcon className="w-5 h-5" />
          Create Society
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="bookish-glass rounded-2xl border border-white/20 p-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
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
              <span className="font-medium">{tab.label}</span>
              <span className="text-xs opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="bookish-glass rounded-2xl border border-white/20 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary/50" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search societies..."
              className="w-full pl-10 pr-4 py-2 bookish-input rounded-lg border-0 bg-white/10 text-primary"
            />
          </div>

          <select
            value={filters.visibility}
            onChange={(e) => setFilters(prev => ({ ...prev, visibility: e.target.value }))}
            className="px-4 py-2 bookish-input rounded-lg border-0 bg-white/10 text-primary"
          >
            <option value="">All Visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          <select
            value={filters.focus_type}
            onChange={(e) => setFilters(prev => ({ ...prev, focus_type: e.target.value }))}
            className="px-4 py-2 bookish-input rounded-lg border-0 bg-white/10 text-primary"
          >
            <option value="">All Types</option>
            <option value="Genre">Genre-based</option>
            <option value="Book">Book-specific</option>
          </select>

          <button
            onClick={() => setFilters({ search: '', visibility: '', focus_type: '', my_societies: false })}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-primary"
          >
            Clear Filters
          </button>
        </div>
      </motion.div>

      {/* Societies Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            <span className="ml-2 text-primary/70">Loading societies...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">Failed to load societies</p>
            <button
              onClick={() => loadSocieties()}
              className="bookish-button-enhanced text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : societies?.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-primary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">No Societies Found</h3>
            <p className="text-primary/70 mb-6">
              {activeTab === 'my_societies' 
                ? "You haven't joined any societies yet"
                : "No societies match your current filters"
              }
            </p>
            {activeTab !== 'my_societies' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bookish-button-enhanced text-white px-6 py-3 rounded-xl"
              >
                Create the First Society
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {societies.map((society, index) => (
                <SocietyCard
                  key={society.society_id}
                  society={society}
                  index={index}
                  onJoin={handleJoinSociety}
                  onLeave={handleLeaveSociety}
                  onClick={handleSocietyClick}
                  currentUserId={profile?.user_id}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination?.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  pagination={pagination}
                  onPageChange={loadSocieties}
                />
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Create Society Modal */}
      <CreateSocietyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadSocieties();
          setShowCreateModal(false);
        }}
      />
    </div>
  );
};

// Society Card Component
const SocietyCard = ({ society, index, onJoin, onLeave, onClick, currentUserId }) => {
  const isMember = society.members?.some(m => m.user_id === currentUserId);

  return (
    <motion.div
      className="bookish-glass rounded-2xl border border-white/20 p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={() => onClick(society)}
    >
      {/* Society Header */}
      <div className="flex items-start gap-4 mb-4">
        {society.icon_url ? (
          <img
            src={society.icon_url}
            alt={society.name}
            className="w-12 h-12 rounded-xl object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center">
            <UsersIcon className="w-6 h-6 text-primary" />
          </div>
        )}
        
        <div className="flex-1">
          <h3 className="font-lora font-bold text-primary mb-1">{society.name}</h3>
          <p className="text-sm text-primary/70 line-clamp-2">{society.description}</p>
        </div>

        {/* Visibility Badge */}
        <div className="flex items-center gap-1">
          {society.visibility === 'public' ? (
            <GlobeAltIcon className="w-4 h-4 text-green-500" />
          ) : (
            <LockClosedIcon className="w-4 h-4 text-yellow-500" />
          )}
        </div>
      </div>

      {/* Society Meta */}
      <div className="flex items-center gap-4 text-xs text-primary/60 mb-4">
        <div className="flex items-center gap-1">
          <UsersIcon className="w-3 h-3" />
          <span>{society.member_count || 0} members</span>
        </div>
        
        {society.focus_type && (
          <div className="flex items-center gap-1">
            {society.focus_type === 'Book' ? (
              <BookOpenIcon className="w-3 h-3" />
            ) : (
              <TagIcon className="w-3 h-3" />
            )}
            <span>{society.focus_type}</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        {isMember ? (
          <>
            <button
              onClick={() => onClick(society)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              Open
            </button>
            <button
              onClick={() => onLeave(society.society_id)}
              className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-sm rounded-lg transition-colors"
            >
              Leave
            </button>
          </>
        ) : (
          <button
            onClick={() => onJoin(society.society_id)}
            className="w-full flex items-center justify-center gap-1 bookish-button-enhanced text-white py-2 rounded-lg text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Join Society
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default SocietiesPage;
