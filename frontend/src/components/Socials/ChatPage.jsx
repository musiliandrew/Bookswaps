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
    <div className="container mx-auto p-4">
      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      {(chatError || societiesError) && (
        <div className="text-red-500 mb-4">{chatError || societiesError}</div>
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
      {activeTab === 'direct' && !chatId && !societyId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="md:col-span-2">
            <ChatCreationForm newChat={newChat} setNewChat={setNewChat} handleStartChat={handleStartChat} />
            <ChatFilters chatFilters={chatFilters} setChatFilters={setChatFilters} />
            <ChatList
              messages={messages}
              isChatLoading={isChatLoading}
              listMessages={listMessages}
              chatFilters={chatFilters}
              chatPagination={chatPagination}
            />
          </div>
        </motion.div>
      )}
      {activeTab === 'societies' && !societyId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="md:col-span-2">
            <SocietyCreationForm newSociety={newSociety} setNewSociety={setNewSociety} handleCreateSociety={handleCreateSociety} />
            <SocietyList
              societies={societies}
              isSocietiesLoading={isSocietiesLoading}
              listSocieties={listSocieties}
              societiesPagination={societiesPagination}
              onSocietySelect={(society) => toast.info(`Selected society: ${society.name}. Chat functionality coming soon!`)}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ChatPage;