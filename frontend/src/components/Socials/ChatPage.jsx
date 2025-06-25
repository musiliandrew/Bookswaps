import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import { useSocieties } from '../../hooks/useSocieties';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaperAirplaneIcon,
  PhotoIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  DocumentIcon,
  FaceSmileIcon,
  PlusIcon,
  ArrowLeftIcon,
  PhoneIcon,
  InformationCircleIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import MessageBubble from './Chat/MessageBubble';
import MediaUploadModal from './Chat/MediaUploadModal';
import VoiceRecorder from './Chat/VoiceRecorder';

const ChatPage = () => {
  const { chatId, societyId } = useParams();
  const navigate = useNavigate();

  // Chat hooks
  const {
    sendDirectMessage,
    editMessage,
    deleteMessage,
    markRead,
    addDirectReaction,
    listMessages,
    messages,
    isLoading: isChatLoading,
    error: chatError,
    pagination: chatPagination,
  } = useChat();

  const {
    createSociety,
    listSocieties,
    getSocietyMessages,
    sendSocietyMessage,
    editSocietyMessage,
    deleteSocietyMessage,
    pinSocietyMessage,
    addSocietyReaction,
    societies,
    societyMessages,
    isLoading: isSocietiesLoading,
    error: societiesError,
    pagination: societiesPagination,
  } = useSocieties();

  // State management
  const [activeTab, setActiveTab] = useState('dm');
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  // Refs
  const messageInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, societyMessages]);

  // Handle typing indicators
  const handleTyping = (text) => {
    setMessageText(text);
    if (text && !isTyping) {
      setIsTyping(true);
      // Send typing status to backend
      // TODO: Implement typing status API call
    } else if (!text && isTyping) {
      setIsTyping(false);
      // Send stop typing status to backend
    }
  };

  // Send message handler
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      if (activeTab === 'dm' && selectedChat) {
        await sendDirectMessage({
          content: messageText,
          receiver_id: selectedChat.user_id,
          message_type: 'TEXT'
        });
      } else if (activeTab === 'societies' && selectedSociety) {
        await sendSocietyMessage(selectedSociety.society_id, {
          content: messageText,
          message_type: 'TEXT'
        });
      }

      setMessageText('');
      setIsTyping(false);
      scrollToBottom();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  // Handle media upload
  const handleMediaUpload = async (file, messageType) => {
    try {
      const formData = new FormData();
      formData.append('media_file', file);
      formData.append('message_type', messageType);

      if (activeTab === 'dm' && selectedChat) {
        formData.append('receiver_id', selectedChat.user_id);
        // TODO: Implement media message API call
      } else if (activeTab === 'societies' && selectedSociety) {
        formData.append('society_id', selectedSociety.society_id);
        // TODO: Implement society media message API call
      }

      toast.success('Media sent successfully!');
      setShowMediaModal(false);
    } catch (error) {
      toast.error('Failed to send media');
    }
  };

  // Initialize data
  useEffect(() => {
    listMessages({}, 1);
    listSocieties({}, 1);
  }, []);

  useEffect(() => {
    if (activeTab === 'direct' && !chatId && !societyId) {
      listMessages(chatFilters, chatPagination.messages.page);
    } else if (activeTab === 'societies' && !societyId) {
      listSocieties({}, societiesPagination.societies.page);
    } else if (societyId) {
      getSocietyMessages(societyId, societiesPagination.messages.page);
    } else if (chatId) {
      listMessages({ recipient_id: chatId }, chatPagination.messages.page);
    }
  }, [
    activeTab,
    chatId,
    societyId,
    chatFilters,
    chatPagination.messages.page,
    societiesPagination.societies.page,
    societiesPagination.messages.page,
    listMessages,
    listSocieties,
    getSocietyMessages,
  ]);

  const handleSendDirectMessage = async (e) => {
    e.preventDefault();
    if (!newDirectMessage.trim()) return;
    const data = { content: newDirectMessage, receiver_id: chatId };
    const response = await sendDirectMessage(data);
    if (response) setNewDirectMessage('');
  };

  const handleEditMessage = async (messageId, isSociety = false) => {
    const data = { content: editContent };
    let response;
    if (isSociety) {
      response = await editSocietyMessage(societyId, messageId, data);
    } else {
      response = await editMessage(messageId, data);
    }
    if (response) {
      setEditingMessageId(null);
      setEditContent('');
    }
  };

  const handleDeleteMessage = async (messageId, isSociety = false) => {
    let response;
    if (isSociety) {
      response = await deleteSocietyMessage(societyId, messageId);
    } else {
      response = await deleteMessage(messageId);
    }
    if (response) toast.success('Message deleted!');
  };

  const handleAddReaction = async (messageId, emoji, isSociety = false) => {
    const data = { emoji };
    let response;
    if (isSociety) {
      response = await addSocietyReaction(societyId, messageId, data);
    } else {
      response = await addDirectReaction(messageId, data);
    }
    if (response) toast.success('Reaction added!');
  };

  const handlePinMessage = async (messageId) => {
    const response = await pinSocietyMessage(societyId, messageId);
    if (response) toast.success('Message pinned!');
  };

  const handleCreateSociety = async (e) => {
    e.preventDefault();
    const response = await createSociety(newSociety);
    if (response) {
      setNewSociety({ name: '', description: '', visibility: 'public', focus_type: '', focus_id: '' });
      // Instead of navigating, just refresh the societies list and show success
      toast.success('Society created successfully!');
      listSocieties({}, 1); // Refresh the societies list
    }
  };

  const handleStartChat = async (e) => {
    e.preventDefault();
    const data = { content: 'Hello!', receiver_id: newChat.recipient_id, book_id: newChat.book_id || null };
    const response = await sendDirectMessage(data);
    if (response) {
      setNewChat({ recipient_id: '', book_id: '' });
      // Instead of navigating, just show success and refresh messages
      toast.success('Message sent successfully!');
      listMessages(chatFilters, 1); // Refresh the messages list
    }
  };

  const handleSocietySelect = (society) => {
    // Navigate to the society chat
    navigate(`/chat/society/${society.id}`);
  };

  return (
    <div className="flex h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-[var(--primary)] text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold font-lora">BookSwaps Chat</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('dm')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'dm'
                    ? 'bg-[var(--accent)] text-[var(--secondary)]'
                    : 'bg-transparent hover:bg-white/10'
                }`}
              >
                DMs
              </button>
              <button
                onClick={() => setActiveTab('societies')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'societies'
                    ? 'bg-[var(--accent)] text-[var(--secondary)]'
                    : 'bg-transparent hover:bg-white/10'
                }`}
              >
                Groups
              </button>
            </div>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'dm' ? (
            <div className="p-2">
              {isChatLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
                </div>
              ) : (
                messages.map((message) => (
                  <motion.div
                    key={message.chat_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg mb-2 cursor-pointer transition-all hover:bg-gray-50 ${
                      selectedChat?.chat_id === message.chat_id ? 'bg-[var(--accent)]/10 border-l-4 border-[var(--accent)]' : ''
                    }`}
                    onClick={() => setSelectedChat(message)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center text-white font-bold">
                        {(message.sender?.username || message.receiver?.username || 'U')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-[var(--text)] truncate">
                            {message.sender?.username || message.receiver?.username || 'Unknown User'}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {message.sent_at_formatted || new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {message.message_type === 'TEXT' ? message.content : `[${message.message_type}]`}
                        </p>
                        {message.status === 'UNREAD' && (
                          <div className="w-2 h-2 bg-[var(--accent)] rounded-full mt-1"></div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            <div className="p-2">
              {isSocietiesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
                </div>
              ) : (
                societies.map((society) => (
                  <motion.div
                    key={society.society_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg mb-2 cursor-pointer transition-all hover:bg-gray-50 ${
                      selectedSociety?.society_id === society.society_id ? 'bg-[var(--accent)]/10 border-l-4 border-[var(--accent)]' : ''
                    }`}
                    onClick={() => setSelectedSociety(society)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[var(--secondary)] rounded-full flex items-center justify-center text-white font-bold">
                        {society.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-[var(--text)] truncate">
                            {society.name}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {society.member_count} members
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {society.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedChat || selectedSociety ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center text-white font-bold">
                  {activeTab === 'dm'
                    ? (selectedChat?.sender?.username || selectedChat?.receiver?.username || 'U')[0].toUpperCase()
                    : selectedSociety?.name[0].toUpperCase()
                  }
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--text)]">
                    {activeTab === 'dm'
                      ? (selectedChat?.sender?.username || selectedChat?.receiver?.username || 'Unknown User')
                      : selectedSociety?.name
                    }
                  </h2>
                  <p className="text-sm text-gray-500">
                    {activeTab === 'dm' ? 'Online' : `${selectedSociety?.member_count || 0} members`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <PhoneIcon className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <VideoCameraIcon className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <InformationCircleIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-4">
                {activeTab === 'dm' ? (
                  messages
                    .filter(msg =>
                      (msg.sender?.user_id === selectedChat?.sender?.user_id ||
                       msg.receiver?.user_id === selectedChat?.receiver?.user_id)
                    )
                    .map((message) => (
                      <MessageBubble
                        key={message.chat_id}
                        message={message}
                        isOwn={message.sender?.user_id === selectedChat?.sender?.user_id}
                      />
                    ))
                ) : (
                  societyMessages.map((message) => (
                    <MessageBubble
                      key={message.message_id}
                      message={message}
                      isOwn={false}
                      isGroup={true}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowMediaModal(true)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <PlusIcon className="w-5 h-5 text-gray-600" />
                </button>

                <div className="flex-1 relative">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={messageText}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="w-full p-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <FaceSmileIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <button
                  onClick={() => setShowVoiceRecorder(true)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MicrophoneIcon className="w-5 h-5 text-gray-600" />
                </button>

                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-[var(--primary)] hover:bg-[var(--primary)]/90 rounded-full transition-colors"
                >
                  <PaperAirplaneIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a chat to start messaging</h3>
              <p className="text-gray-500">Choose from your existing conversations or start a new one</p>
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