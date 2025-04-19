import { useState, useEffect } from 'react';
import { Camera, Check, X, RefreshCw, Clock, AlertCircle, QrCode } from 'lucide-react';

const mockSwaps = {
    pending: [
      {
        id: 'p1',
        status: 'pending',
        direction: 'incoming', // Someone wants your book
        requestDate: '2025-04-12T14:30:00Z',
        book: {
          id: 'b101',
          title: 'The Midnight Library',
          author: 'Matt Haig',
          coverUrl: '/api/placeholder/80/120',
          condition: 'Like New'
        },
        otherUser: {
          id: 'u202',
          username: 'BookWorm42',
          avatarUrl: '/api/placeholder/40/40',
          rating: 4.8,
          swapsCompleted: 15
        },
        offeredBook: {
          id: 'b102',
          title: 'Project Hail Mary',
          author: 'Andy Weir',
          coverUrl: '/api/placeholder/80/120',
          condition: 'Good'
        }
      },
      {
        id: 'p2',
        status: 'pending',
        direction: 'outgoing', // You want someone's book
        requestDate: '2025-04-10T09:15:00Z',
        book: {
          id: 'b103',
          title: 'The Song of Achilles',
          author: 'Madeline Miller',
          coverUrl: '/api/placeholder/80/120',
          condition: 'Good'
        },
        otherUser: {
          id: 'u203',
          username: 'ClassicReader',
          avatarUrl: '/api/placeholder/40/40',
          rating: 4.5,
          swapsCompleted: 7
        },
        offeredBook: {
          id: 'b104',
          title: 'Dune',
          author: 'Frank Herbert',
          coverUrl: '/api/placeholder/80/120',
          condition: 'Acceptable'
        }
      }
    ],
    active: [
      {
        id: 'a1',
        status: 'active',
        direction: 'outgoing',
        requestDate: '2025-04-05T10:30:00Z',
        acceptedDate: '2025-04-06T14:20:00Z',
        exchangeStage: 'awaiting_handover', // or 'book_sent', 'book_received'
        meetupDetails: {
          method: 'in_person', // or 'mail'
          location: 'Local Library Café',
          scheduledDate: '2025-04-20T15:00:00Z'
        },
        book: {
          id: 'b105',
          title: 'Circe',
          author: 'Madeline Miller',
          coverUrl: '/api/placeholder/80/120',
          condition: 'Like New'
        },
        otherUser: {
          id: 'u204',
          username: 'MythologyFan',
          avatarUrl: '/api/placeholder/40/40',
          rating: 4.9,
          swapsCompleted: 23
        },
        offeredBook: {
          id: 'b106',
          title: 'The Priory of the Orange Tree',
          author: 'Samantha Shannon',
          coverUrl: '/api/placeholder/80/120',
          condition: 'Very Good'
        }
      }
    ],
    completed: [
      {
        id: 'c1',
        status: 'completed',
        direction: 'incoming',
        requestDate: '2025-03-15T08:45:00Z',
        acceptedDate: '2025-03-16T12:30:00Z',
        completedDate: '2025-03-22T16:40:00Z',
        reviewSubmitted: true,
        rating: 5,
        book: {
          id: 'b107',
          title: 'Klara and the Sun',
          author: 'Kazuo Ishiguro',
          coverUrl: '/api/placeholder/80/120',
          condition: 'Very Good'
        },
        otherUser: {
          id: 'u205',
          username: 'SciFiLover',
          avatarUrl: '/api/placeholder/40/40',
          rating: 4.7,
          swapsCompleted: 12
        },
        offeredBook: {
          id: 'b108',
          title: 'Never Let Me Go',
          author: 'Kazuo Ishiguro',
          coverUrl: '/api/placeholder/80/120',
          condition: 'Good'
        }
      },
      {
        id: 'c2',
        status: 'completed',
        direction: 'outgoing',
        requestDate: '2025-02-28T11:20:00Z',
        acceptedDate: '2025-03-01T09:10:00Z',
        completedDate: '2025-03-10T14:15:00Z',
        reviewSubmitted: false,
        book: {
          id: 'b109',
          title: 'The Thursday Murder Club',
          author: 'Richard Osman',
          coverUrl: '/api/placeholder/80/120',
          condition: 'Like New'
        },
        otherUser: {
          id: 'u206',
          username: 'MysteryReader',
          avatarUrl: '/api/placeholder/40/40',
          rating: 4.6,
          swapsCompleted: 19
        },
        offeredBook: {
          id: 'b110',
          title: 'The Appeal',
          author: 'Janice Hallett',
          coverUrl: '/api/placeholder/80/120',
          condition: 'Good'
        }
      }
    ]
  };

// Main component for the "Your Swaps" tab section
export default function YourSwapsTab() {
  // Tab state
  const [activeTab, setActiveTab] = useState('pending');
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Mock data for different swap statuses
  
  
  // Mock API call to fetch swaps
  useEffect(() => {
    setLoading(true);
    
    // Simulate API delay
    const timer = setTimeout(() => {
      try {
        // In a real app, this would be fetching from an API endpoint
        // like: fetch(`/api/swaps/?status=${activeTab}`)
        setSwaps(mockSwaps[activeTab] || []);
        setLoading(false);
      } catch {
        setError("Couldn't load your swaps. Please try again.");
        setLoading(false);
      }
    }, 800); // Simulate network delay
    
    return () => clearTimeout(timer);
  }, [activeTab]);
  
  // Handle tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Handle swap actions
  const handleSwapAction = (swapId, action) => {
    console.log(`Performing ${action} on swap ${swapId}`);
    
    // In a real app, these would make API calls
    switch (action) {
      case 'accept':
        alert(`Accept swap ${swapId} - This would call PATCH /api/swaps/${swapId} with {status: 'accepted'}`);
        break;
      case 'reject':
        alert(`Reject swap ${swapId} - This would call PATCH /api/swaps/${swapId} with {status: 'rejected'}`);
        break;
      case 'cancel':
        alert(`Cancel swap ${swapId} - This would call DELETE /api/swaps/${swapId}`);
        break;
      case 'complete':
        alert(`Complete swap ${swapId} - This would call PATCH /api/swaps/${swapId} with {status: 'completed'}`);
        break;
      case 'showQR':
        alert(`Show QR code for swap ${swapId} - This would call GET /api/swaps/${swapId}/qr/`);
        break;
      case 'scanQR':
        alert(`Scan QR code for swap ${swapId} - This would open the device camera`);
        break;
      case 'review':
        alert(`Review swap ${swapId} - This would navigate to a review form`);
        break;
      default:
        break;
    }
  };
  
  return (
    <div className="space-y-6">
      <SwapsTabs activeTab={activeTab} onTabChange={handleTabChange} counts={{
        pending: mockSwaps.pending.length,
        active: mockSwaps.active.length,
        completed: mockSwaps.completed.length
      }} />
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center text-red-700">
          <AlertCircle className="h-6 w-6 mx-auto mb-2" />
          <p>{error}</p>
          <button 
            className="mt-3 text-sm text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md"
            onClick={() => {
              setError(null);
              setLoading(true);
              setTimeout(() => {
                setSwaps(mockSwaps[activeTab] || []);
                setLoading(false);
              }, 800);
            }}
          >
            Try Again
          </button>
        </div>
      ) : swaps.length === 0 ? (
        <EmptyState type={activeTab} />
      ) : (
        <div className="space-y-4">
          {swaps.map(swap => (
            <SwapCard 
              key={swap.id} 
              swap={swap} 
              onAction={(action) => handleSwapAction(swap.id, action)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Tabs Component
function SwapsTabs({ activeTab, onTabChange, counts }) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px space-x-8">
        <TabButton 
          active={activeTab === 'pending'} 
          onClick={() => onTabChange('pending')}
          count={counts.pending}
          label="Pending"
          icon={<Clock className="w-4 h-4 mr-1" />}
        />
        <TabButton 
          active={activeTab === 'active'} 
          onClick={() => onTabChange('active')}
          count={counts.active}
          label="Active"
          icon={<RefreshCw className="w-4 h-4 mr-1" />}
        />
        <TabButton 
          active={activeTab === 'completed'} 
          onClick={() => onTabChange('completed')}
          count={counts.completed}
          label="Completed"
          icon={<Check className="w-4 h-4 mr-1" />}
        />
      </nav>
    </div>
  );
}

// Tab Button Component
function TabButton({ active, onClick, label, count, icon }) {
  return (
    <button
      className={`group inline-flex items-center pb-4 px-1 border-b-2 font-medium text-sm ${
        active
          ? 'border-teal-600 text-teal-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      {icon}
      {label}
      {count > 0 && (
        <span 
          className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
            active 
              ? 'bg-teal-100 text-teal-900' 
              : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// Swap Card Component
function SwapCard({ swap, onAction }) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Determine status badge properties
  const getStatusBadge = (status, direction) => {
    switch (status) {
      case 'pending':
        return direction === 'incoming' 
          ? { color: 'bg-yellow-100 text-yellow-800', text: 'Request Received' }
          : { color: 'bg-blue-100 text-blue-800', text: 'Request Sent' };
      case 'active':
        return { color: 'bg-green-100 text-green-800', text: 'In Progress' };
      case 'completed':
        return { color: 'bg-purple-100 text-purple-800', text: 'Completed' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status };
    }
  };
  
  // Determine available actions based on swap state
  const getAvailableActions = (swap) => {
    const { status, direction, reviewSubmitted } = swap;
    
    if (status === 'pending') {
      if (direction === 'incoming') {
        return [
          { key: 'accept', label: 'Accept', color: 'bg-green-600 hover:bg-green-700' },
          { key: 'reject', label: 'Decline', color: 'bg-red-600 hover:bg-red-700' }
        ];
      } else {
        return [
          { key: 'cancel', label: 'Cancel Request', color: 'bg-gray-600 hover:bg-gray-700' }
        ];
      }
    } else if (status === 'active') {
      const exchangeStage = swap.exchangeStage || 'awaiting_handover';
      
      if (exchangeStage === 'awaiting_handover') {
        return [
          { key: 'showQR', label: 'Show QR Code', color: 'bg-teal-600 hover:bg-teal-700', icon: <QrCode className="w-4 h-4 mr-1" /> },
          { key: 'scanQR', label: 'Scan QR', color: 'bg-blue-600 hover:bg-blue-700', icon: <Camera className="w-4 h-4 mr-1" /> }
        ];
      } else {
        return [
          { key: 'complete', label: 'Mark Complete', color: 'bg-green-600 hover:bg-green-700', icon: <Check className="w-4 h-4 mr-1" /> }
        ];
      }
    } else if (status === 'completed' && !reviewSubmitted) {
      return [
        { key: 'review', label: 'Leave Review', color: 'bg-yellow-600 hover:bg-yellow-700' }
      ];
    }
    
    return [];
  };
  
  const statusBadge = getStatusBadge(swap.status, swap.direction);
  const availableActions = getAvailableActions(swap);
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Main Card Content */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap md:flex-nowrap items-start gap-4">
          {/* Book Exchange Visual */}
          <div className="flex items-center space-x-2 flex-grow">
            {/* Your Book */}
            <div className="text-center">
              <div className="relative">
                <img 
                  src={swap.direction === 'outgoing' ? swap.offeredBook.coverUrl : swap.book.coverUrl} 
                  alt={swap.direction === 'outgoing' ? swap.offeredBook.title : swap.book.title}
                  className="w-20 h-28 object-cover rounded-md shadow" 
                />
                <div className="absolute -bottom-2 -right-2 h-6 w-6 bg-amber-100 rounded-full flex items-center justify-center shadow">
                  <span className="text-amber-800 text-xs font-bold">You</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 max-w-[80px] truncate">
                {swap.direction === 'outgoing' ? swap.offeredBook.title : swap.book.title}
              </p>
            </div>
            
            {/* Exchange Arrow */}
            <div className="text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            
            {/* Other User's Book */}
            <div className="text-center">
              <div className="relative">
                <img 
                  src={swap.direction === 'outgoing' ? swap.book.coverUrl : swap.offeredBook.coverUrl} 
                  alt={swap.direction === 'outgoing' ? swap.book.title : swap.offeredBook.title}
                  className="w-20 h-28 object-cover rounded-md shadow" 
                />
                <div className="absolute -bottom-2 -right-2 h-6 w-6 bg-teal-100 rounded-full flex items-center justify-center shadow">
                  <img 
                    src={swap.otherUser.avatarUrl} 
                    alt={swap.otherUser.username} 
                    className="h-5 w-5 rounded-full" 
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 max-w-[80px] truncate">
                {swap.direction === 'outgoing' ? swap.book.title : swap.offeredBook.title}
              </p>
            </div>
          </div>
          
          {/* Swap Details */}
          <div className="flex-grow">
            <div className="flex items-start justify-between">
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                  {statusBadge.text}
                </span>
                <h3 className="mt-2 text-lg font-medium text-brown-800">
                  Swap with {swap.otherUser.username}
                </h3>
                <p className="text-sm text-gray-500">
                  {swap.direction === 'incoming' ? 'They want your' : 'You requested their'} "{swap.direction === 'outgoing' ? swap.book.title : swap.book.title}"
                </p>
                <p className="text-sm text-gray-500">
                  {swap.status === 'pending' 
                    ? `Requested on ${formatDate(swap.requestDate)}` 
                    : swap.status === 'completed'
                      ? `Completed on ${formatDate(swap.completedDate)}`
                      : `Swap accepted on ${formatDate(swap.acceptedDate)}`
                  }
                </p>
              </div>
              
              {/* User Rating */}
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end">
                  <span className="text-amber-500 mr-1">★</span>
                  <span className="font-medium">{swap.otherUser.rating}</span>
                </div>
                <p className="text-xs text-gray-500">{swap.otherUser.swapsCompleted} swaps</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            {availableActions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {availableActions.map(action => (
                  <button
                    key={action.key}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white ${action.color}`}
                    onClick={() => onAction(action.key)}
                  >
                    {action.icon && action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Toggle Details Button */}
        <div className="mt-4 text-center">
          <button 
            className="text-sm text-teal-600 hover:text-teal-700"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>
      
      {/* Expanded Details Section */}
      {showDetails && (
        <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Your Book</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <span className="font-medium">{swap.direction === 'outgoing' ? swap.offeredBook.title : swap.book.title}</span> by {swap.direction === 'outgoing' ? swap.offeredBook.author : swap.book.author}
              </dd>
              <dd className="mt-1 text-sm text-gray-500">Condition: {swap.direction === 'outgoing' ? swap.offeredBook.condition : swap.book.condition}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Their Book</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <span className="font-medium">{swap.direction === 'outgoing' ? swap.book.title : swap.offeredBook.title}</span> by {swap.direction === 'outgoing' ? swap.book.author : swap.offeredBook.author}
              </dd>
              <dd className="mt-1 text-sm text-gray-500">Condition: {swap.direction === 'outgoing' ? swap.book.condition : swap.offeredBook.condition}</dd>
            </div>
            
            {swap.status === 'active' && swap.meetupDetails && (
              <>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Exchange Details</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    Method: {swap.meetupDetails.method === 'in_person' ? 'In-person meetup' : 'Mail exchange'}
                  </dd>
                  {swap.meetupDetails.method === 'in_person' && (
                    <>
                      <dd className="mt-1 text-sm text-gray-900">Location: {swap.meetupDetails.location}</dd>
                      <dd className="mt-1 text-sm text-gray-900">
                        Date: {new Date(swap.meetupDetails.scheduledDate).toLocaleString()}
                      </dd>
                    </>
                  )}
                </div>
              </>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}

// Empty State Component
function EmptyState({ type }) {
  let message, actionText, icon;
  
  switch (type) {
    case 'pending':
      message = "You don't have any pending swap requests.";
      actionText = "Browse Books to Swap";
      icon = <Clock className="h-12 w-12 text-gray-400" />;
      break;
    case 'active':
      message = "You don't have any active swaps right now.";
      actionText = "Find Books to Swap";
      icon = <RefreshCw className="h-12 w-12 text-gray-400" />;
      break;
    case 'completed':
      message = "You haven't completed any swaps yet.";
      actionText = "Start Your First Swap";
      icon = <Check className="h-12 w-12 text-gray-400" />;
      break;
    default:
      message = "No swaps found.";
      actionText = "Browse Books";
      icon = <AlertCircle className="h-12 w-12 text-gray-400" />;
  }
  
  return (
    <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-medium text-brown-800">{message}</h3>
      <p className="mt-2 text-sm text-gray-500">
        Swap books with other readers and build your collection.
      </p>
      <div className="mt-6">
        <button 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          {actionText}
        </button>
      </div>
    </div>
  );
}