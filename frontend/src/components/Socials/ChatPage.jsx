import { useState, useEffect, useCallback } from 'react';
import { useChat } from '../../hooks/useChat';
import { useSocieties } from '../../hooks/useSocieties';
import { useUsers } from '../../hooks/useUsers';
import { useUserInteractions } from '../../hooks/useUserInteractions';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UserPlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import ConversationList from './Chat/ConversationList';
import ConversationView from './Chat/ConversationView';
import SocietyChatView from './Chat/SocietyChatView';
import MediaUploadModal from './Chat/MediaUploadModal';
import EnhancedMediaUpload from './Chat/EnhancedMediaUpload';
import VoiceRecorder from './Chat/VoiceRecorder';
import SocietyList from './Chat/SocietyList';
import MessagePinning, { PinnedMessagesSection } from './Chat/MessagePinning';


const ChatPage = () => {
  console.log('ChatPage component is rendering');
  const { profile: currentUser } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState('dm');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [societyMessages, setSocietyMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showEnhancedMediaModal, setShowEnhancedMediaModal] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(true);

  // Chat hooks
  const {
    sendDirectMessage,
    listMessages,
    isLoading: isChatLoading,
  } = useChat();

  // Society hooks
  const {
    listSocieties,
    societies,
    getSocietyMessages,
    sendSocietyMessage,
    societyMessages: hookSocietyMessages,
    isLoading: isSocietiesLoading,
    pagination: societiesPagination,
  } = useSocieties();

  // User search hooks
  const {
    searchUsers,
    searchResults,
    isLoading: isSearchLoading,
  } = useUsers();

  // User interactions hooks
  const {
    handleFollow,
    handleUnfollow,
    userFollowStatuses,
    refreshFollowStatus,
  } = useUserInteractions(currentUser?.user_id);

  // Effects for responsive design
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle user search
  const handleUserSearch = useCallback(async (query) => {
    if (!query.trim()) {
      return;
    }

    try {
      await searchUsers({ query: query.trim() }, 1);
    } catch (error) {
      console.error('Failed to search users:', error);
      toast.error('Failed to search users');
    }
  }, [searchUsers]);

  // Load follow statuses when search results change
  useEffect(() => {
    if (searchResults && searchResults.length > 0 && currentUser?.user_id) {
      searchResults.forEach(user => {
        const userId = user.user_id || user.id;
        if (userId && !userFollowStatuses[userId]) {
          // Refresh follow status for this user
          refreshFollowStatus(userId);
        }
      });
    }
  }, [searchResults, userFollowStatuses, refreshFollowStatus, currentUser?.user_id]);

  // Handle society selection
  const handleSocietySelect = useCallback(async (society) => {
    try {
      console.log('Selected society:', society);
      setSelectedSociety(society);
      setSelectedConversation(null); // Clear DM selection

      // Load society messages
      setLoading(true);
      const societyId = society.id || society.society_id;
      const messages = await getSocietyMessages(societyId, 1);
      if (messages && messages.results) {
        setSocietyMessages(messages.results);
      }

      toast.success(`Opened ${society.name} chat`);
    } catch (error) {
      console.error('Failed to load society chat:', error);
      toast.error('Failed to load society chat');
    } finally {
      setLoading(false);
    }
  }, [getSocietyMessages]);

  // Handle sending society messages
  const handleSendSocietyMessage = useCallback(async (content) => {
    if (!selectedSociety || !content.trim()) return;

    try {
      const messageData = {
        content: content.trim(),
        message_type: 'TEXT'
      };

      const societyId = selectedSociety.id || selectedSociety.society_id;
      const result = await sendSocietyMessage(societyId, messageData);
      if (result) {
        setSocietyMessages(prev => [...prev, result]);
        toast.success('Message sent!');
      }
    } catch (error) {
      console.error('Failed to send society message:', error);
      toast.error('Failed to send message');
    }
  }, [selectedSociety, sendSocietyMessage]);

  // Update society messages when hook messages change
  useEffect(() => {
    if (hookSocietyMessages && selectedSociety) {
      setSocietyMessages(hookSocietyMessages);
    }
  }, [hookSocietyMessages, selectedSociety]);

  // Handle starting a new conversation
  const handleStartConversation = useCallback(async (user) => {
    try {
      console.log('Starting conversation with user:', user);
      console.log('Current user:', currentUser);

      // Check if current user is available
      if (!currentUser || !currentUser.user_id) {
        console.error('Current user not available:', currentUser);
        toast.error('Please log in to start a conversation');
        return;
      }

      // Handle different user ID field names
      const userId = user.user_id || user.id;
      if (!userId) {
        console.error('User ID not found in user object:', user);
        toast.error('Invalid user data');
        return;
      }

      // Check if trying to message yourself
      if (userId === currentUser.user_id) {
        toast.error('You cannot message yourself');
        return;
      }

      // Check if conversation already exists
      const existingConversation = conversations.find(
        conv => conv.partner.user_id === userId || conv.partner.id === userId
      );

      if (existingConversation) {
        setSelectedConversation(existingConversation);
        setShowUserSearch(false);
        toast.success(`Opened conversation with ${user.username}`);
        return;
      }

      // Create new conversation object
      const newConversation = {
        partner: {
          user_id: userId,
          id: userId, // Add both for compatibility
          username: user.username,
          profile_picture: user.profile_picture
        },
        latest_message: null,
        unread_count: 0,
        current_user_id: currentUser.user_id
      };

      setSelectedConversation(newConversation);
      setShowUserSearch(false);
      toast.success(`Started conversation with ${user.username}`);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error('Failed to start conversation');
    }
  }, [conversations, currentUser]);

  // Load conversations on mount
  useEffect(() => {
    if (!currentUser) {
      console.log('No current user, skipping conversation load');
      setLoading(false);
      return;
    }

    if (activeTab === 'dm') {
      console.log('ChatPage useEffect triggered, loading conversations...');
      const loadConversations = async () => {
        try {
          setLoading(true);
          console.log('Calling listMessages...');
          const result = await listMessages({}, 1);
          console.log('listMessages result:', result);

          if (result && result.results) {
            // Check if result.results is an array of conversations or messages
            if (Array.isArray(result.results)) {
              if (result.results.length > 0) {
                // Check if first item has 'partner' property (conversation format)
                if (result.results[0].partner) {
                  // Already in conversation format
                  setConversations(result.results);
                  console.log('Conversations set (direct format):', result.results);
                } else {
                  // Message format - need to group by conversation partner
                  const conversationMap = new Map();

                  result.results.forEach(message => {
                    const partnerId = message.sender?.user_id === currentUser.user_id
                      ? message.receiver?.user_id
                      : message.sender?.user_id;

                    const partner = message.sender?.user_id === currentUser.user_id
                      ? message.receiver
                      : message.sender;

                    if (!partnerId || !partner) return;

                    if (!conversationMap.has(partnerId)) {
                      conversationMap.set(partnerId, {
                        partner,
                        latest_message: message,
                        unread_count: 0,
                        current_user_id: currentUser.user_id
                      });
                    } else {
                      const existing = conversationMap.get(partnerId);
                      if (new Date(message.created_at) > new Date(existing.latest_message.created_at)) {
                        existing.latest_message = message;
                      }
                    }
                  });

                  const conversationsList = Array.from(conversationMap.values());
                  setConversations(conversationsList);
                  console.log('Conversations set (grouped format):', conversationsList);
                }
              } else {
                // No conversations found
                console.log('No conversations found');
                setConversations([]);
              }
            } else {
              console.log('Invalid result format');
              setConversations([]);
            }
          } else {
            console.log('No result data');
            setConversations([]);
          }
        } catch (error) {
          console.error('Failed to load conversations:', error);
          setConversations([]); // Set empty array on error
          toast.error('Failed to load conversations');
        } finally {
          setLoading(false);
        }
      };

      loadConversations();
    } else if (activeTab === 'societies') {
      console.log('Loading societies...');
      listSocieties({}, 1);
    }
  }, [currentUser, activeTab, listMessages, listSocieties]);

  // Load messages for selected conversation
  useEffect(() => {
    const loadConversationMessages = async () => {
      if (!selectedConversation) {
        setConversationMessages([]);
        return;
      }

      try {
        const result = await listMessages({
          receiver_id: selectedConversation.partner.user_id
        }, 1);
        if (result && result.results) {
          setConversationMessages(result.results);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
        toast.error('Failed to load messages');
      }
    };

    loadConversationMessages();
  }, [selectedConversation, listMessages]);

  // Handle conversation selection
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    // Add current user ID to conversation for message bubble logic
    conversation.current_user_id = currentUser?.user_id;
  };

  // Handle sending messages
  const handleSendMessage = async (messageData) => {
    try {
      await sendDirectMessage(messageData);
      // Reload messages after sending
      const result = await listMessages({
        receiver_id: selectedConversation.partner.user_id
      }, 1);
      if (result && result.results) {
        setConversationMessages(result.results);
      }
      toast.success('Message sent!');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  // Handle back navigation on mobile
  const handleBack = () => {
    setSelectedConversation(null);
  };

  // Handle media upload (images, voice notes, etc.)
  const handleMediaUpload = async (mediaData, messageType = 'IMAGE') => {
    try {
      if (!selectedConversation) {
        toast.error('Please select a conversation first');
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();

      if (mediaData instanceof Blob || mediaData instanceof File) {
        formData.append('file', mediaData);
        formData.append('message_type', messageType);
        formData.append('receiver_id', selectedConversation.partner.user_id);
      } else {
        // Handle other types of media data
        formData.append('content', mediaData);
        formData.append('message_type', messageType);
        formData.append('receiver_id', selectedConversation.partner.user_id);
      }

      await sendDirectMessage(formData);

      // Reload messages after sending
      const result = await listMessages({
        receiver_id: selectedConversation.partner.user_id
      }, 1);
      if (result && result.results) {
        setConversationMessages(result.results);
      }

      toast.success('Media sent successfully!');

      // Close modals
      setShowMediaModal(false);
      setShowVoiceRecorder(false);
    } catch (error) {
      console.error('Failed to send media:', error);
      toast.error('Failed to send media');
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const partnerName = conv.partner.username.toLowerCase();
    return partnerName.includes(searchQuery.toLowerCase());
  });

  console.log('ChatPage rendering with conversations:', conversations);

  return (
    <div className="min-h-[calc(100vh-12rem)] bookish-gradient flex rounded-xl overflow-hidden bookish-shadow">
      {/* Conversations Sidebar - Hidden on mobile when conversation is selected */}
      <div className={`${
        isMobile && selectedConversation ? 'hidden' : 'flex'
      } w-full lg:w-1/3 xl:w-1/4 border-r border-[var(--secondary)] bg-[#FEF3C7]/30 backdrop-blur-sm flex-col min-h-full`}>

        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <svg viewBox="0 0 16 16" className="w-6 h-6 text-white" fill="currentColor">
                <rect x="0" y="0" width="2" height="16"></rect>
                <path d="M11,6 L11,9 L11.885,9 L12,6 L11,6 Z"></path>
                <path d="M3,0 L3,16 L13.8208442,16 C14.4713435,16 15,15.5473033 15,14.9895162 L15,1.01048377 C15,0.451686245 14.4723504,0 13.8208442,0 L3,0 Z M13.051,9.053 L12.08,9.053 L12.062,10.063 L7.906,10.063 L7.924,9.042 L6.957,9.042 L6.957,6.99 L7.915,6.99 L7.915,5.948 L10.957,5.938 L10.957,5.051 L7.026,5.051 L7.026,6.048 L6.029,6.048 L6.029,9.958 L7.041,9.958 L7.041,10.975 L11.047,10.975 L11.047,12.014 L6.961,12.014 L6.961,11.063 L5.958,11.063 L5.958,10.032 L4.953,10.032 L4.953,5.991 L5.973,5.991 L5.973,4.973 L6.938,4.973 L6.938,3.938 L11.032,3.938 L11.032,4.959 L12.011,4.959 L12.011,5.949 L13.052,5.949 L13.052,9.053 L13.051,9.053 Z"></path>
                <rect x="8" y="7" width="2" height="2"></rect>
              </svg>
              <h1 className="text-xl font-bold font-lora text-white">Chat</h1>
            </div>
            <button
              onClick={() => {
                if (!currentUser) {
                  toast.error('Please log in to search for users');
                  return;
                }
                setShowUserSearch(!showUserSearch);
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Start new conversation"
              disabled={!currentUser}
            >
              <UserPlusIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 font-open-sans"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[var(--secondary)]/30 border-b border-[var(--secondary)]">
          <button
            onClick={() => setActiveTab('dm')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all font-open-sans ${
              activeTab === 'dm'
                ? 'text-[var(--primary)] border-b-2 border-[var(--accent)] bg-white/80'
                : 'text-[var(--text)] hover:text-[var(--primary)] hover:bg-white/40'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              <span>Chats</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('societies')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all font-open-sans ${
              activeTab === 'societies'
                ? 'text-[var(--primary)] border-b-2 border-[var(--accent)] bg-white/80'
                : 'text-[var(--text)] hover:text-[var(--primary)] hover:bg-white/40'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <UsersIcon className="w-4 h-4" />
              <span>Groups</span>
            </div>
          </button>
        </div>

        {/* User Search Modal */}
        {showUserSearch && currentUser && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-[var(--secondary)] bg-[#FEF3C7]/40 backdrop-blur-sm"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-lora text-[var(--primary)] font-semibold">Find People to Chat</h3>
                <button
                  onClick={() => setShowUserSearch(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 text-[var(--text)]" />
                </button>
              </div>

              <div className="relative mb-3">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text)]" />
                <input
                  type="text"
                  placeholder="Search users to message..."
                  onChange={(e) => handleUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[var(--secondary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-open-sans text-sm"
                />
              </div>

              {/* Search Results */}
              {searchResults && searchResults.length > 0 && (
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {searchResults.map((user) => {
                    const userId = user.user_id || user.id;
                    const followStatus = userFollowStatuses[userId] || { is_following: false, is_mutual: false };
                    const isOwnProfile = currentUser?.user_id === userId;

                    // Determine follow button config
                    const getFollowButtonConfig = () => {
                      if (isOwnProfile) return null;

                      if (followStatus.is_following) {
                        return {
                          text: 'Following',
                          action: () => handleUnfollow(userId),
                          className: 'bg-gray-500 hover:bg-gray-600 text-white'
                        };
                      } else {
                        return {
                          text: 'Follow',
                          action: () => handleFollow(userId),
                          className: 'bg-[var(--primary)] hover:bg-[var(--accent)] text-white'
                        };
                      }
                    };

                    const followButtonConfig = getFollowButtonConfig();

                    return (
                      <motion.div
                        key={userId}
                        className="flex items-center justify-between p-3 bg-[#FEF3C7]/30 rounded-lg bookish-glass"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => {
                            // Handle view profile if needed
                            console.log('View profile:', userId);
                          }}
                        >
                          <img
                            src={user.profile_picture || '/default-avatar.png'}
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover border border-[var(--secondary)]"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-['Open_Sans'] text-[#456A76] text-sm font-semibold">{user.username}</p>
                              {followStatus.is_mutual && (
                                <span className="text-xs bg-[var(--accent)] text-white px-1.5 py-0.5 rounded-full">
                                  Mutual
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[var(--text)]">{user.city || 'Book lover'}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {/* Follow/Unfollow Button */}
                          {followButtonConfig && (
                            <button
                              onClick={followButtonConfig.action}
                              className={`px-3 py-1.5 rounded-lg text-xs font-['Open_Sans'] transition-colors ${followButtonConfig.className}`}
                            >
                              {followButtonConfig.text}
                            </button>
                          )}

                          {/* Message Button */}
                          <button
                            onClick={() => handleStartConversation(user)}
                            className="px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white rounded-lg text-xs font-['Open_Sans'] transition-colors flex items-center gap-1"
                          >
                            💬 Message
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {isSearchLoading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary)]"></div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'dm' ? (
            <ConversationList
              conversations={filteredConversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              isLoading={loading || isChatLoading}
            />
          ) : (
            <SocietyList
              societies={societies}
              isSocietiesLoading={isSocietiesLoading}
              onSocietySelect={handleSocietySelect}
              listSocieties={listSocieties}
              societiesPagination={societiesPagination}
              selectedSociety={selectedSociety}
            />
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${
        isMobile && !selectedConversation && !selectedSociety ? 'hidden' : 'flex'
      } flex-1 flex-col bg-[#FEF3C7]/50 backdrop-blur-sm`}>
        {selectedConversation ? (
          <ConversationView
            conversation={selectedConversation}
            messages={conversationMessages}
            onSendMessage={handleSendMessage}
            onBack={handleBack}
            isLoading={isChatLoading}
            currentUser={currentUser}
          />
        ) : selectedSociety ? (
          <SocietyChatView
            society={selectedSociety}
            messages={societyMessages}
            onSendMessage={handleSendSocietyMessage}
            onBack={() => {
              setSelectedSociety(null);
              setSocietyMessages([]);
            }}
            isLoading={loading}
            currentUser={currentUser}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <svg viewBox="0 0 16 16" className="w-16 h-16 text-[var(--primary)]" fill="currentColor">
                  <rect x="0" y="0" width="2" height="16"></rect>
                  <path d="M11,6 L11,9 L11.885,9 L12,6 L11,6 Z"></path>
                  <path d="M3,0 L3,16 L13.8208442,16 C14.4713435,16 15,15.5473033 15,14.9895162 L15,1.01048377 C15,0.451686245 14.4723504,0 13.8208442,0 L3,0 Z M13.051,9.053 L12.08,9.053 L12.062,10.063 L7.906,10.063 L7.924,9.042 L6.957,9.042 L6.957,6.99 L7.915,6.99 L7.915,5.948 L10.957,5.938 L10.957,5.051 L7.026,5.051 L7.026,6.048 L6.029,6.048 L6.029,9.958 L7.041,9.958 L7.041,10.975 L11.047,10.975 L11.047,12.014 L6.961,12.014 L6.961,11.063 L5.958,11.063 L5.958,10.032 L4.953,10.032 L4.953,5.991 L5.973,5.991 L5.973,4.973 L6.938,4.973 L6.938,3.938 L11.032,3.938 L11.032,4.959 L12.011,4.959 L12.011,5.949 L13.052,5.949 L13.052,9.053 L13.051,9.053 Z"></path>
                  <rect x="8" y="7" width="2" height="2"></rect>
                </svg>
                <ChatBubbleLeftRightIcon className="w-16 h-16 text-[var(--secondary)]" />
              </div>
              <h3 className="text-xl font-lora text-[var(--primary)] mb-2">Welcome to Chat</h3>
              <p className="text-[var(--text)] font-open-sans mb-4">
                Connect with fellow book lovers and start meaningful conversations
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (!currentUser) {
                      toast.error('Please log in to search for users');
                      return;
                    }
                    setShowUserSearch(true);
                  }}
                  className="block px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl font-open-sans font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  disabled={!currentUser}
                >
                  Find People to Chat
                </button>
                <p className="text-[var(--text)] font-open-sans text-sm">
                  Or select a society from the Groups tab to join group conversations
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showMediaModal && (
          <MediaUploadModal
            isOpen={showMediaModal}
            onClose={() => setShowMediaModal(false)}
            onUpload={handleMediaUpload}
          />
        )}

        {showVoiceRecorder && (
          <VoiceRecorder
            isOpen={showVoiceRecorder}
            onClose={() => setShowVoiceRecorder(false)}
            onSend={(audioBlob) => handleMediaUpload(audioBlob, 'VOICE_NOTE')}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;