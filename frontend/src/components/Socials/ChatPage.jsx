import { useState, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { useSocieties } from '../../hooks/useSocieties';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import ConversationList from './Chat/ConversationList';
import ConversationView from './Chat/ConversationView';
import MediaUploadModal from './Chat/MediaUploadModal';
import VoiceRecorder from './Chat/VoiceRecorder';
import SocietyList from './Chat/SocietyList';

const ChatPage = () => {
  console.log('ChatPage component is rendering');
  const { user: currentUser } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState('dm');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
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
    isLoading: isSocietiesLoading,
    pagination: societiesPagination,
  } = useSocieties();

  // Effects for responsive design
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load conversations on mount
  useEffect(() => {
    if (!currentUser) {
      console.log('No current user, skipping conversation load');
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

        if (result && result.results && result.results.length > 0) {
          // Group messages by conversation partner
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
          console.log('Conversations set:', conversationsList);
        } else {
          // No conversations found
          console.log('No conversations found');
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
    } else if (activeTab === 'groups') {
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
    <div className="min-h-[calc(100vh-12rem)] bg-gradient-to-br from-gray-50 to-white flex rounded-lg overflow-hidden shadow-lg">
      {/* Conversations Sidebar - Hidden on mobile when conversation is selected */}
      <div className={`${
        isMobile && selectedConversation ? 'hidden' : 'flex'
      } w-full lg:w-1/3 xl:w-1/4 border-r border-gray-200 bg-white flex-col min-h-full`}>

        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/90 text-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold font-lora">BookSwaps Chat</h1>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-50 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('dm')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
              activeTab === 'dm'
                ? 'text-[var(--primary)] border-b-2 border-[var(--primary)] bg-white'
                : 'text-gray-600 hover:text-[var(--primary)] hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              <span>Direct Messages</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('societies')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
              activeTab === 'societies'
                ? 'text-[var(--primary)] border-b-2 border-[var(--primary)] bg-white'
                : 'text-gray-600 hover:text-[var(--primary)] hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <UsersIcon className="w-4 h-4" />
              <span>Groups</span>
            </div>
          </button>
        </div>

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
              onSocietySelect={(society) => {
                // Navigate to society chat or handle society selection
                console.log('Selected society:', society);
                toast.info(`Society chat for "${society.name}" coming soon!`);
              }}
              listSocieties={listSocieties}
              societiesPagination={societiesPagination}
            />
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${
        isMobile && !selectedConversation ? 'hidden' : 'flex'
      } flex-1 flex-col`}>
        <ConversationView
          conversation={selectedConversation}
          messages={conversationMessages}
          onSendMessage={handleSendMessage}
          onBack={handleBack}
          isLoading={isChatLoading}
          currentUser={currentUser}
        />
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