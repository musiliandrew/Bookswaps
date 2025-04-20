import { useState, useEffect, useRef } from 'react';
import { BookOpen, MoreVertical, Send, Smile } from 'lucide-react';

// Main ChatMain component
export default function ChatMain({ selectedChatId }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [, setWebsocket] = useState(null); // websocket use
  const currentUserId = 1; // Mock current user ID - would come from auth context

  // Fetch conversation data when selectedChatId changes
  useEffect(() => {
    if (!selectedChatId) {
      setConversation(null);
      setMessages([]);
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate API call to fetch conversation details
    fetchConversation(selectedChatId)
      .then(data => {
        setConversation(data);
        return fetchMessages(selectedChatId);
      })
      .then(messageData => {
        setMessages(messageData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching chat data:", err);
        setError("Failed to load conversation. Please try again.");
        setLoading(false);
      });

    // Setup WebSocket connection
    const ws = setupWebSocket(selectedChatId);
    setWebsocket(ws);

    // Clean up WebSocket on unmount or when selectedChatId changes
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [selectedChatId]);

  // Handle sending a new message
  const handleSendMessage = (content) => {
    if (!content.trim() || !selectedChatId) return;

    // Create optimistic message
    const newMessage = {
      id: `temp-${Date.now()}`,
      content,
      senderId: currentUserId,
      senderName: "You", // Would come from auth context
      timestamp: new Date().toISOString(),
      status: "sending"
    };

    // Add message optimistically
    setMessages(prevMessages => [...prevMessages, newMessage]);

    // Simulate API call to send message
    sendMessage(selectedChatId, content)
      .then(response => {
        // Replace optimistic message with server response
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === newMessage.id ? { ...response, status: "sent" } : msg
          )
        );
      })
      .catch(err => {
        console.error("Error sending message:", err);
        // Mark message as failed
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === newMessage.id ? { ...msg, status: "failed" } : msg
          )
        );
      });
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!selectedChatId) {
    return <EmptyChatState />;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <>
          {conversation && <ChatHeader conversation={conversation} />}
          <MessageList 
            messages={messages} 
            currentUserId={currentUserId} 
          />
          <MessageInput onSend={handleSendMessage} />
        </>
      )}
    </div>
  );
}

// ChatHeader component
function ChatHeader({ conversation }) {
  const {  name, avatarUrl, type, memberCount, isOnline } = conversation;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
      <div className="relative mr-3">
        <img 
          src={avatarUrl} 
          alt={name} 
          className="w-10 h-10 rounded-full object-cover"
        />
        {isOnline && type === 'private' && (
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>
        )}
      </div>
      
      <div className="flex-1">
        <h2 className="font-medium text-gray-900">{name}</h2>
        {type === 'society' && (
          <p className="text-xs text-gray-500">{memberCount} members</p>
        )}
        {type === 'private' && isOnline && (
          <p className="text-xs text-gray-500">Online</p>
        )}
        {type === 'private' && !isOnline && (
          <p className="text-xs text-gray-500">Offline</p>
        )}
      </div>
      
      <button className="p-1 rounded-full hover:bg-gray-100">
        <MoreVertical size={20} className="text-gray-500" />
      </button>
    </div>
  );
}

// MessageList component
function MessageList({ messages, currentUserId }) {
  const messagesEndRef = useRef(null);
  
  // Auto scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Group messages by sender (consecutive messages from same sender)
  const groupedMessages = messages.reduce((groups, message) => {
    const lastGroup = groups[groups.length - 1];
    
    if (lastGroup && lastGroup[0].senderId === message.senderId) {
      // Add to existing group
      lastGroup.push(message);
    } else {
      // Create new group
      groups.push([message]);
    }
    
    return groups;
  }, []);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-gray-500">
          <p>No messages yet</p>
          <p className="text-sm mt-1">Send a message to start the conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {groupedMessages.map((group, groupIndex) => {
        const isCurrentUser = group[0].senderId === currentUserId;
        
        return (
          <div 
            key={`group-${groupIndex}`}
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
              {!isCurrentUser && (
                <div className="ml-2 mb-1 text-sm font-medium text-gray-700">
                  {group[0].senderName}
                </div>
              )}
              
              <div className="space-y-1">
                {group.map((message) => (
                  <MessageBubble 
                    key={message.id} 
                    message={message} 
                    isCurrentUser={isCurrentUser} 
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

// MessageBubble component
function MessageBubble({ message, isCurrentUser }) {
  const [showTimestamp, setShowTimestamp] = useState(false);
  const { content, timestamp, status } = message;
  
  // Format timestamp
  const formattedTime = new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowTimestamp(true)}
      onMouseLeave={() => setShowTimestamp(false)}
      onFocus={() => setShowTimestamp(true)}
      onBlur={() => setShowTimestamp(false)}
    >
      <div 
        className={`py-2 px-3 rounded-lg relative ${
          isCurrentUser 
          ? 'bg-teal-600 text-white' 
          : 'bg-white text-gray-800 border border-gray-200'
        }`}
      >
        {content}
        
        {/* Small timestamp shown on hover/focus */}
        {showTimestamp && (
          <div 
            className={`absolute -bottom-5 text-xs text-gray-500 whitespace-nowrap ${
              isCurrentUser ? 'right-1' : 'left-1'
            }`}
          >
            {formattedTime}
          </div>
        )}
      </div>
      
      {/* Message status indicator (for current user's messages) */}
      {isCurrentUser && (
        <div className="text-right mt-1 mr-1">
          {status === 'sending' && (
            <span className="text-xs text-gray-400">Sending...</span>
          )}
          {status === 'failed' && (
            <span className="text-xs text-red-500">Failed to send</span>
          )}
        </div>
      )}
    </div>
  );
}

// MessageInput component
function MessageInput({ onSend }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);
  
  // Auto-resize textarea based on content
  const handleTextareaChange = (e) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to auto to get accurate scrollHeight
    textarea.style.height = 'auto';
    
    // Set height based on content (limit to max 150px)
    const newHeight = Math.min(textarea.scrollHeight, 150);
    textarea.style.height = `${newHeight}px`;
    
    setMessage(e.target.value);
  };
  
  const handleSend = () => {
    if (message.trim() && message.length <= 1000) {
      onSend(message);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  const handleKeyDown = (e) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full resize-none p-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-teal-500 min-h-[42px] max-h-[150px] overflow-y-auto"
            maxLength={1000}
            rows={1}
          />
          <button
            className="absolute right-3 bottom-3 text-gray-400 hover:text-teal-600"
            onClick={() => {}}
          >
            <Smile size={20} />
          </button>
          
          {/* Character limit indicator (only shows when approaching limit) */}
          {message.length > 900 && (
            <div className={`absolute text-xs ${message.length > 990 ? 'text-red-500' : 'text-gray-500'} right-2 -bottom-5`}>
              {message.length}/1000
            </div>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={!message.trim() || message.length > 1000}
          className={`p-3 rounded-full ${message.trim() && message.length <= 1000
            ? 'bg-teal-600 hover:bg-teal-700 text-white'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}

// EmptyChatState component
function EmptyChatState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="mb-4 p-4 bg-amber-100 rounded-full">
        <BookOpen size={32} className="text-amber-600" />
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">Welcome to BookSwap Chat</h3>
      <p className="text-gray-600 max-w-md mb-8">
        Select an existing conversation from the sidebar or start a new chat to connect with fellow book lovers.
      </p>
      <div className="text-center text-gray-500 text-sm italic">
        "A reader lives a thousand lives before he dies. The man who never reads lives only one."
        <div className="mt-1">― George R.R. Martin</div>
      </div>
    </div>
  );
}

// Mock API functions (replace with actual API calls when available)
async function fetchConversation(id) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock conversation data
  if (id === 1) {
    return {
      id: 1,
      name: "Sarah Johnson",
      avatarUrl: "/api/placeholder/32/32",
      type: "private",
      isOnline: true
    };
  } else if (id === 2) {
    return {
      id: 2,
      name: "Book Club: Mystery Lovers",
      avatarUrl: "/api/placeholder/32/32",
      type: "society",
      memberCount: 12
    };
  }
  
  throw new Error("Conversation not found");
}

async function fetchMessages(conversationId) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock message data
  if (conversationId === 1) {
    return [
      {
        id: 101,
        content: "Hi there! I saw you're interested in trading 'The Silent Patient'?",
        senderId: 2,
        senderName: "Sarah Johnson",
        timestamp: "2025-04-20T09:15:00Z"
      },
      {
        id: 102,
        content: "Yes! I finished it last week and really enjoyed it. Do you want to borrow it?",
        senderId: 1,
        senderName: "You",
        timestamp: "2025-04-20T09:20:00Z"
      },
      {
        id: 103,
        content: "That would be great! I've been wanting to read it for ages. I could trade you 'Verity' by Colleen Hoover if you haven't read that one yet?",
        senderId: 2,
        senderName: "Sarah Johnson",
        timestamp: "2025-04-20T09:22:00Z"
      },
      {
        id: 104,
        content: "Perfect! I've heard good things about 'Verity'. When would you be free to meet up for the swap?",
        senderId: 1,
        senderName: "You",
        timestamp: "2025-04-20T09:25:00Z"
      },
      {
        id: 105,
        content: "How about this weekend? Saturday afternoon at the downtown library?",
        senderId: 2,
        senderName: "Sarah Johnson",
        timestamp: "2025-04-20T09:30:00Z"
      },
      {
        id: 106,
        content: "Saturday works for me! Around 2pm?",
        senderId: 1,
        senderName: "You",
        timestamp: "2025-04-20T09:35:00Z"
      },
      {
        id: 107,
        content: "Perfect! I'll see you then. I'm really excited to finally read 'The Silent Patient'!",
        senderId: 2,
        senderName: "Sarah Johnson",
        timestamp: "2025-04-20T09:40:00Z"
      },
      {
        id: 108,
        content: "You're going to love it! The twist at the end is really unexpected.",
        senderId: 1,
        senderName: "You",
        timestamp: "2025-04-20T09:45:00Z"
      },
      {
        id: 109,
        content: "No spoilers please! 😄 But now I'm even more excited!",
        senderId: 2,
        senderName: "Sarah Johnson",
        timestamp: "2025-04-20T09:47:00Z"
      }
    ];
  } else if (conversationId === 2) {
    return [
      {
        id: 201,
        content: "Has anyone read the new Lisa Jewell thriller?",
        senderId: 3,
        senderName: "Tom Wilson",
        timestamp: "2025-04-19T14:00:00Z"
      },
      {
        id: 202,
        content: "I'm halfway through it! It's so good, I had to force myself to put it down last night.",
        senderId: 4,
        senderName: "Emma Clark",
        timestamp: "2025-04-19T14:05:00Z"
      },
      {
        id: 203,
        content: "No spoilers! I'm still on the waiting list at the library.",
        senderId: 5,
        senderName: "David Kim",
        timestamp: "2025-04-19T14:10:00Z"
      },
      {
        id: 204,
        content: "I have an extra copy if anyone wants to borrow it after I'm done.",
        senderId: 1,
        senderName: "You",
        timestamp: "2025-04-19T14:15:00Z"
      },
      {
        id: 205,
        content: "I would love to borrow it! I can trade you the new Tana French novel.",
        senderId: 3,
        senderName: "Tom Wilson",
        timestamp: "2025-04-19T14:20:00Z"
      },
      {
        id: 206,
        content: "That sounds perfect! I'll message you when I'm finished.",
        senderId: 1,
        senderName: "You",
        timestamp: "2025-04-19T14:25:00Z"
      },
      {
        id: 207,
        content: "Does anyone have suggestions for our next book club pick? I was thinking maybe something by Gillian Flynn?",
        senderId: 6,
        senderName: "Sophia Rodriguez",
        timestamp: "2025-04-19T15:00:00Z"
      },
      {
        id: 208,
        content: "I think the author was trying to mislead us intentionally with all those red herrings in the middle chapters.",
        senderId: 3,
        senderName: "Tom Wilson",
        timestamp: "2025-04-19T16:30:00Z"
      }
    ];
  }
  
  return [];
}

async function sendMessage(conversationId, content) {
  // Simulate API delay and success
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Mock response from server
  return {
    id: Date.now(),
    content,
    senderId: 1, // Current user
    senderName: "You",
    timestamp: new Date().toISOString()
  };
}

function setupWebSocket(conversationId) {
  // In a real app, this would create an actual WebSocket connection
  console.log(`Setting up WebSocket connection for conversation ${conversationId}`);
  
  // Mock WebSocket for demonstration
  const mockWs = {
    close: () => {
      console.log(`Closing WebSocket connection for conversation ${conversationId}`);
    }
  };
  
  return mockWs;
}