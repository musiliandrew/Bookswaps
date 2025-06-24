import React, { useState, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { useSocieties } from '../../hooks/useSocieties';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import NavigationTabs from '../Socials/Chat/NavigationTabs';
import DirectChatView from '../Socials/Chat/DirectChatView';
import SocietyChatView from '../Socials/Chat/SocietyChatView';
import ChatCreationForm from '../Socials/Chat/ChatCreationForm';
import ChatFilters from '../Socials/Chat/ChatFilters';
import ChatList from '../Socials/Chat/ChatList';
import SocietyCreationForm from '../Socials/Chat/SocietyCreationForm';
import SocietyList from '../Socials/Chat/SocietyList';

const ChatPage = () => {
  const { chatId, societyId } = useParams();
  const navigate = useNavigate();
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

  const [chatFilters, setChatFilters] = useState({ recipient_id: '', unread: false });
  const [newDirectMessage, setNewDirectMessage] = useState('');
  const [newSocietyMessage, setNewSocietyMessage] = useState('');
  const [newSociety, setNewSociety] = useState({
    name: '',
    description: '',
    visibility: 'public',
    focus_type: '',
    focus_id: '',
  });
  const [newChat, setNewChat] = useState({ recipient_id: '', book_id: '' });
  const [activeTab, setActiveTab] = useState('direct');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');

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

  return (
    <div className="min-h-screen font-open-sans text-text">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-lora font-bold text-gradient mb-4 relative">
            💬 Chats
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full opacity-20"
              animate={{ scale: [1, 1.2, 1], rotate: [0, -180, -360] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </h1>
          <motion.p
            className="font-open-sans text-primary/80 text-lg max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Connect directly with readers, join societies, and build meaningful relationships
          </motion.p>
        </motion.div>

        {/* Enhanced Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </motion.div>

        {/* Enhanced Error Display */}
        {(chatError || societiesError) && (
          <motion.div
            className="mb-8 p-6 bookish-glass rounded-2xl border border-red-300/20 bg-red-50/10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-3 text-red-600">
              <div className="text-2xl">⚠️</div>
              <div className="font-medium">{chatError || societiesError}</div>
            </div>
          </motion.div>
        )}
      {chatId && activeTab === 'direct' && (
        <DirectChatView
          chatId={chatId}
          messages={messages}
          isChatLoading={isChatLoading}
          newDirectMessage={newDirectMessage}
          setNewDirectMessage={setNewDirectMessage}
          handleSendDirectMessage={handleSendDirectMessage}
          handleEditMessage={handleEditMessage}
          handleDeleteMessage={handleDeleteMessage}
          handleAddReaction={handleAddReaction}
          editingMessageId={editingMessageId}
          setEditingMessageId={setEditingMessageId}
          editContent={editContent}
          setEditContent={setEditContent}
          markRead={markRead}
        />
      )}
      {societyId && activeTab === 'societies' && (
        <SocietyChatView
          societyId={societyId}
          societies={societies}
          societyMessages={societyMessages}
          isSocietiesLoading={isSocietiesLoading}
          newSocietyMessage={newSocietyMessage}
          setNewSocietyMessage={setNewSocietyMessage}
          sendSocietyMessage={sendSocietyMessage}
          handleEditMessage={handleEditMessage}
          handleDeleteMessage={handleDeleteMessage}
          handleAddReaction={handleAddReaction}
          handlePinMessage={handlePinMessage}
          editingMessageId={editingMessageId}
          setEditingMessageId={setEditingMessageId}
          editContent={editContent}
          setEditContent={setEditContent}
        />
      )}
        {/* Enhanced Direct Chats Section */}
        {activeTab === 'direct' && !chatId && !societyId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          >
            <div className="lg:col-span-3 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <ChatCreationForm newChat={newChat} setNewChat={setNewChat} handleStartChat={handleStartChat} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <ChatFilters chatFilters={chatFilters} setChatFilters={setChatFilters} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <ChatList
                  messages={messages}
                  isChatLoading={isChatLoading}
                  listMessages={listMessages}
                  chatFilters={chatFilters}
                  chatPagination={chatPagination}
                />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Society Chats Section */}
        {activeTab === 'societies' && !societyId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          >
            <div className="lg:col-span-3 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <SocietyCreationForm newSociety={newSociety} setNewSociety={setNewSociety} handleCreateSociety={handleCreateSociety} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <SocietyList
                  societies={societies}
                  isSocietiesLoading={isSocietiesLoading}
                  listSocieties={listSocieties}
                  societiesPagination={societiesPagination}
                  onSocietySelect={(society) => toast.info(`Selected society: ${society.name}. Chat functionality coming soon!`)}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
    </div>
  );
};

export default ChatPage;