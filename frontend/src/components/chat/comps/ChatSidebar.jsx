import { useState, useEffect } from 'react';
import { Search, PlusCircle, Users, MessageSquare, X } from 'lucide-react';

// Mock data for conversations and societies
const MOCK_CONVERSATIONS = [
  { id: 1, name: 'Sarah Johnson', avatarUrl: '/api/placeholder/32/32', unreadCount: 3, lastMessage: 'Are you still interested in "The Silent Patient"?', lastMessageTime: '10:23 AM', isOnline: true },
  { id: 2, name: 'Book Club: Mystery Lovers', avatarUrl: '/api/placeholder/32/32', unreadCount: 0, lastMessage: 'Tom: I think the author was trying to mislead us intentionally', lastMessageTime: 'Yesterday', isSociety: true },
  { id: 3, name: 'Michael Chen', avatarUrl: '/api/placeholder/32/32', unreadCount: 1, lastMessage: 'Thanks for the recommendation!', lastMessageTime: 'Yesterday', isOnline: false },
  { id: 4, name: 'Robin Williams', avatarUrl: '/api/placeholder/32/32', unreadCount: 0, lastMessage: 'Let me know when you finish reading it', lastMessageTime: 'Monday', isOnline: true },
  { id: 5, name: 'Fantasy Fiction Society', avatarUrl: '/api/placeholder/32/32', unreadCount: 12, lastMessage: 'Emma: Has anyone read the latest Brandon Sanderson?', lastMessageTime: 'Apr 15', isSociety: true },
  { id: 6, name: 'Alex Morgan', avatarUrl: '/api/placeholder/32/32', unreadCount: 0, lastMessage: 'I can meet at the library on Saturday', lastMessageTime: 'Apr 12', isOnline: false },
  { id: 7, name: 'Local Book Exchange', avatarUrl: '/api/placeholder/32/32', unreadCount: 0, lastMessage: 'Admin: New books added to the exchange list!', lastMessageTime: 'Apr 10', isSociety: true },
  { id: 8, name: 'Jordan Peterson', avatarUrl: '/api/placeholder/32/32', unreadCount: 0, lastMessage: 'The swap went well, thank you!', lastMessageTime: 'Mar 28', isOnline: false },
];

export default function ChatSidebar({ selectedChatId, onSelectChat }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'private', 'societies'
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewSocietyModal, setShowNewSocietyModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);

  // Fetch conversations (simulated API call)
  useEffect(() => {
    // In a real app, this would be an API call
    // fetchConversations().then(data => setConversations(data));
    setConversations(MOCK_CONVERSATIONS);
  }, []);

  // Filter conversations based on search term and filter type
  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'private') return matchesSearch && !conversation.isSociety;
    if (filter === 'societies') return matchesSearch && conversation.isSociety;
    return false;
  });

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed bottom-4 left-4 z-20">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-teal-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
        >
          {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
        </button>
      </div>

      {/* Sidebar Container */}
      <div className={`bg-white border-r border-gray-200 h-full flex flex-col w-full md:w-72 lg:w-80 
        ${isOpen ? 'fixed inset-0 z-10' : 'hidden md:flex'}`}
      >
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-brown-800 mb-4">Messages</h2>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          {/* Filter Tabs (Mobile Only) */}
          <div className="flex border rounded-md overflow-hidden md:hidden mb-4">
            <button
              className={`flex-1 py-1.5 text-sm font-medium ${filter === 'all' ? 'bg-teal-600 text-white' : 'bg-gray-50 text-gray-700'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`flex-1 py-1.5 text-sm font-medium ${filter === 'private' ? 'bg-teal-600 text-white' : 'bg-gray-50 text-gray-700'}`}
              onClick={() => setFilter('private')}
            >
              Private
            </button>
            <button
              className={`flex-1 py-1.5 text-sm font-medium ${filter === 'societies' ? 'bg-teal-600 text-white' : 'bg-gray-50 text-gray-700'}`}
              onClick={() => setFilter('societies')}
            >
              Societies
            </button>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowNewChatModal(true)}
              className="flex items-center justify-center py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-md transition-colors"
            >
              <MessageSquare size={16} className="mr-1" />
              New Chat
            </button>
            <button
              onClick={() => setShowNewSocietyModal(true)}
              className="flex items-center justify-center py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-md transition-colors"
            >
              <Users size={16} className="mr-1" />
              New Society
            </button>
          </div>
        </div>
        
        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredConversations.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  isSelected={chat.id === selectedChatId}
                  onSelect={() => {
                    onSelectChat(chat.id);
                    setIsOpen(false); // Close sidebar on mobile when selecting a chat
                  }}
                />
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <p className="text-gray-500 mb-2">No conversations found</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showNewChatModal && (
        <NewChatModal onClose={() => setShowNewChatModal(false)} />
      )}
      
      {showNewSocietyModal && (
        <NewSocietyModal onClose={() => setShowNewSocietyModal(false)} />
      )}
    </>
  );
}

// ChatListItem Component
function ChatListItem({ chat, isSelected, onSelect }) {
  const { name, avatarUrl, lastMessage, lastMessageTime, unreadCount, isOnline, isSociety } = chat;
  
  return (
    <li 
      className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-teal-50' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-start p-3">
        <div className="relative mr-3">
          <img 
            src={avatarUrl} 
            alt={name} 
            className="w-10 h-10 rounded-full object-cover"
          />
          {isOnline && !isSociety && (
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>
          )}
          {isSociety && (
            <span className="absolute bottom-0 right-0 flex items-center justify-center h-4 w-4 rounded-full bg-amber-500 ring-1 ring-white">
              <Users size={10} className="text-white" />
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h3 className="text-sm font-medium text-gray-900 truncate">{name}</h3>
            <span className="text-xs text-gray-500">{lastMessageTime}</span>
          </div>
          <p className="text-xs text-gray-500 truncate mt-1">{lastMessage}</p>
        </div>
        {unreadCount > 0 && (
          <div className="ml-2 flex-shrink-0">
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-teal-600 text-xs font-medium text-white">
              {unreadCount}
            </span>
          </div>
        )}
      </div>
    </li>
  );
}

// NewChatModal Component (Mock)
function NewChatModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-full overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Start New Chat</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search for users
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type a name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Connections</h4>
            <ul className="space-y-2">
              {[
                { id: 1, name: 'Emma Watson', avatarUrl: '/api/placeholder/32/32' },
                { id: 2, name: 'David Kim', avatarUrl: '/api/placeholder/32/32' },
                { id: 3, name: 'Sophia Rodriguez', avatarUrl: '/api/placeholder/32/32' }
              ].map(user => (
                <li key={user.id} className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                  <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full mr-3" />
                  <span className="text-sm">{user.name}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={onClose}
              className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md disabled:bg-teal-300"
              disabled={true}
            >
              Start Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// NewSocietyModal Component (Mock)
function NewSocietyModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-full overflow-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Create Book Society</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Society Name
            </label>
            <input
              type="text"
              placeholder="e.g., Mystery Lovers Book Club"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              placeholder="What is this society about?"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Genre Tags (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., mystery, thriller, crime"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="mt-1 text-xs text-gray-500">Separate tags with commas</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Privacy Setting
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="public"
                  name="privacy"
                  defaultChecked
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="public" className="ml-2 text-sm text-gray-700">
                  Public (Anyone can join)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="private"
                  name="privacy"
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="private" className="ml-2 text-sm text-gray-700">
                  Private (Invitation only)
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={onClose}
              className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md"
            >
              Create Society
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}