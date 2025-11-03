import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  UsersIcon,
  LockClosedIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

// Society Item Component
const SocietyItem = ({ society, index, isSelected, onClick, isMember }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`p-4 cursor-pointer transition-all duration-200 ${
        isMember
          ? 'hover:bg-[var(--accent)]/10'
          : 'hover:bg-[var(--secondary)]/10 opacity-75'
      } ${
        isSelected
          ? 'bg-[var(--accent)]/10 border-r-4 border-[var(--accent)]'
          : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        {/* Society Icon */}
        <div className="relative">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isMember
              ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]'
              : 'bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary)]/70'
          }`}>
            <svg viewBox="0 0 16 16" className="w-6 h-6 text-white" fill="currentColor">
              <rect x="0" y="0" width="2" height="16"></rect>
              <path d="M11,6 L11,9 L11.885,9 L12,6 L11,6 Z"></path>
              <path d="M3,0 L3,16 L13.8208442,16 C14.4713435,16 15,15.5473033 15,14.9895162 L15,1.01048377 C15,0.451686245 14.4723504,0 13.8208442,0 L3,0 Z M13.051,9.053 L12.08,9.053 L12.062,10.063 L7.906,10.063 L7.924,9.042 L6.957,9.042 L6.957,6.99 L7.915,6.99 L7.915,5.948 L10.957,5.938 L10.957,5.051 L7.026,5.051 L7.026,6.048 L6.029,6.048 L6.029,9.958 L7.041,9.958 L7.041,10.975 L11.047,10.975 L11.047,12.014 L6.961,12.014 L6.961,11.063 L5.958,11.063 L5.958,10.032 L4.953,10.032 L4.953,5.991 L5.973,5.991 L5.973,4.973 L6.938,4.973 L6.938,3.938 L11.032,3.938 L11.032,4.959 L12.011,4.959 L12.011,5.949 L13.052,5.949 L13.052,9.053 L13.051,9.053 Z"></path>
              <rect x="8" y="7" width="2" height="2"></rect>
            </svg>
          </div>

          {/* Status Indicators */}
          <div className="absolute -bottom-1 -right-1 flex gap-1">
            {/* Membership Status */}
            {isMember && (
              <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-2 h-2 text-white" />
              </div>
            )}

            {/* Visibility Indicator */}
            <div className={`w-3 h-3 rounded-full border-2 border-white ${
              society.visibility === 'public' ? 'bg-green-400' : 'bg-yellow-400'
            }`} title={society.visibility === 'public' ? 'Public Society' : 'Private Society'}>
              {society.visibility === 'public' ? (
                <GlobeAltIcon className="w-2 h-2 text-white" />
              ) : (
                <LockClosedIcon className="w-2 h-2 text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Society Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-semibold font-open-sans truncate ${
              isMember ? 'text-[var(--primary)]' : 'text-[var(--text)]'
            }`}>
              {society.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text)] font-open-sans flex items-center gap-1">
                <UsersIcon className="w-3 h-3" />
                {society.member_count || 0}
              </span>
              {!isMember && (
                <span className="text-xs bg-[var(--accent)]/20 text-[var(--accent)] px-2 py-1 rounded-full font-semibold">
                  Join to Chat
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text)] font-open-sans truncate">
              {society.description ?
                society.description.replace(/<[^>]*>/g, '').substring(0, 40) + '...' :
                isMember ? 'Click to open chat' : 'Join this book society'
              }
            </p>

            {/* Focus Type Badge */}
            {society.focus_type && (
              <span className={`inline-flex items-center px-2 py-1 text-xs font-bold leading-none rounded-full ${
                isMember
                  ? 'text-white bg-[var(--primary)]'
                  : 'text-[var(--primary)] bg-[var(--primary)]/20'
              }`}>
                📚 {society.focus_type}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SocietyList = ({ societies, isSocietiesLoading, listSocieties, societiesPagination, onSocietySelect, selectedSociety }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSocietyClick = (society) => {
    if (!society.is_member) {
      toast.error(`You must be a member of "${society.name}" to access the chat. Join the society first!`);
      return;
    }

    if (onSocietySelect) {
      onSocietySelect(society);
    } else {
      toast.info(`Selected society: ${society.name}`);
    }
  };

  const filteredSocieties = societies.filter(society =>
    society.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (society.description && society.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const memberSocieties = filteredSocieties.filter(s => s.is_member);
  const availableSocieties = filteredSocieties.filter(s => !s.is_member);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--secondary)]/30 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--accent)]/5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-lora font-semibold text-[var(--primary)] flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            Society Chats
          </h3>
          <button
            onClick={() => window.location.href = '/socials/discussions/societies'}
            className="p-2 hover:bg-[var(--secondary)]/20 rounded-lg transition-colors"
            title="Browse all societies"
          >
            <PlusIcon className="w-5 h-5 text-[var(--primary)]" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text)]/60" />
          <input
            type="text"
            placeholder="Search societies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/50 border border-[var(--secondary)]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] text-sm font-open-sans"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isSocietiesLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
            <span className="ml-2 text-[var(--text)] font-open-sans">Loading societies...</span>
          </div>
        ) : societies.length === 0 ? (
          <div className="text-center py-8 px-4">
            <ChatBubbleLeftRightIcon className="w-16 h-16 text-[var(--secondary)] mx-auto mb-4" />
            <h3 className="text-lg font-lora font-semibold text-[var(--primary)] mb-2">No Societies Found</h3>
            <p className="text-[var(--text)] font-open-sans mb-4">Join book societies to start chatting with fellow readers!</p>
            <button
              onClick={() => window.location.href = '/socials/discussions/societies'}
              className="btn btn-primary text-white px-6 py-2 rounded-lg"
            >
              Browse Societies
            </button>
          </div>
        ) : (
        <div className="space-y-4">
          {/* My Societies (Member) */}
          {memberSocieties.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-[var(--primary)]/5">
                <h4 className="text-sm font-semibold text-[var(--primary)] font-open-sans flex items-center gap-2">
                  <UsersIcon className="w-4 h-4" />
                  My Societies ({memberSocieties.length})
                </h4>
              </div>
              <div className="divide-y divide-[var(--secondary)]/30">
                {memberSocieties.map((society, index) => (
                  <SocietyItem
                    key={society.id || society.society_id}
                    society={society}
                    index={index}
                    isSelected={(selectedSociety?.id || selectedSociety?.society_id) === (society.id || society.society_id)}
                    onClick={() => handleSocietyClick(society)}
                    isMember={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Available Societies (Non-member) */}
          {availableSocieties.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-[var(--secondary)]/10">
                <h4 className="text-sm font-semibold text-[var(--text)] font-open-sans flex items-center gap-2">
                  <GlobeAltIcon className="w-4 h-4" />
                  Available Societies ({availableSocieties.length})
                </h4>
                <p className="text-xs text-[var(--text)]/70 mt-1">Join these societies to access their chats</p>
              </div>
              <div className="divide-y divide-[var(--secondary)]/30">
                {availableSocieties.map((society, index) => (
                  <SocietyItem
                    key={society.id || society.society_id}
                    society={society}
                    index={index + memberSocieties.length}
                    isSelected={false}
                    onClick={() => handleSocietyClick(society)}
                    isMember={false}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredSocieties.length === 0 && searchTerm && (
            <div className="text-center py-8 px-4">
              <MagnifyingGlassIcon className="w-12 h-12 text-[var(--secondary)] mx-auto mb-3" />
              <p className="text-[var(--text)] font-open-sans">No societies found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Pagination */}
      {(societiesPagination.societies.previous || societiesPagination.societies.next) && (
        <div className="p-4 border-t border-[var(--secondary)]/30">
          <div className="flex justify-center gap-2">
            <motion.button
              onClick={() => listSocieties({}, societiesPagination.societies.page - 1)}
              disabled={!societiesPagination.societies.previous}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Previous
            </motion.button>
            <span className="px-4 py-2 text-[var(--text)] text-sm">
              Page {societiesPagination.societies.page}
            </span>
            <motion.button
              onClick={() => listSocieties({}, societiesPagination.societies.page + 1)}
              disabled={!societiesPagination.societies.next}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Next
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocietyList;