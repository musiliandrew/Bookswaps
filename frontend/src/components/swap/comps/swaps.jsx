import { useState } from 'react';
import { HeaderNav } from './header'; // Assuming you've moved HeaderNav to its own file

export default function SwapsPage() {
  // Authentication state (similar to your BookswapHome component)
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to true for demo
  const [username, ] = useState('JaneReader');
  
  // Tabs state management
  const [activeTab, setActiveTab] = useState('pending');
  
  // Mock user data for design purposes
  const [userData, ] = useState({
    pendingSwaps: [
      { id: 1, book: "The Great Gatsby", user: "BookLover22", status: "pending", date: "April 15, 2025" },
      { id: 2, book: "Dune", user: "SciFiReader", status: "pending", date: "April 12, 2025" }
    ],
    activeSwaps: [
      { id: 3, book: "Pride and Prejudice", user: "ClassicsBuff", status: "in-progress", date: "April 5, 2025" }
    ],
    completedSwaps: [
      { id: 4, book: "The Hobbit", user: "FantasyFan", status: "completed", date: "March 20, 2025" },
      { id: 5, book: "1984", user: "DystopiaReader", status: "completed", date: "February 28, 2025" }
    ]
  });

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // In a real app, you would update the URL here
    // Example: window.history.pushState({}, '', `/swaps?tab=${tab}`);
  };
  
  // Toggle authentication for demo purposes
  const toggleAuth = () => {
    setIsAuthenticated(!isAuthenticated);
  };

  // Get content based on active tab
  const getTabContent = () => {
    switch (activeTab) {
      case 'pending':
        return <PendingSwapsTab swaps={userData.pendingSwaps} />;
      case 'active':
        return <ActiveSwapsTab swaps={userData.activeSwaps} />;
      case 'completed':
        return <CompletedSwapsTab swaps={userData.completedSwaps} />;
      case 'start':
        return <StartSwapTab />;
      default:
        return <PendingSwapsTab swaps={userData.pendingSwaps} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      <HeaderNav 
        isAuthenticated={isAuthenticated} 
        username={username} 
        onAuthToggle={toggleAuth}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-brown-800 mb-6">Book Swaps</h1>
        
        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'pending' 
              ? 'text-teal-600 border-b-2 border-teal-600' 
              : 'text-gray-600 hover:text-teal-500'}`}
            onClick={() => handleTabChange('pending')}
          >
            Pending
            {userData.pendingSwaps.length > 0 && (
              <span className="ml-2 bg-teal-600 text-white text-xs rounded-full px-2 py-1">
                {userData.pendingSwaps.length}
              </span>
            )}
          </button>
          
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'active' 
              ? 'text-teal-600 border-b-2 border-teal-600' 
              : 'text-gray-600 hover:text-teal-500'}`}
            onClick={() => handleTabChange('active')}
          >
            Active
            {userData.activeSwaps.length > 0 && (
              <span className="ml-2 bg-teal-600 text-white text-xs rounded-full px-2 py-1">
                {userData.activeSwaps.length}
              </span>
            )}
          </button>
          
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'completed' 
              ? 'text-teal-600 border-b-2 border-teal-600' 
              : 'text-gray-600 hover:text-teal-500'}`}
            onClick={() => handleTabChange('completed')}
          >
            Completed
          </button>
          
          <button
            className={`px-4 py-2 font-medium ml-auto ${activeTab === 'start' 
              ? 'text-teal-600 border-b-2 border-teal-600' 
              : 'text-white bg-teal-600 hover:bg-teal-700 rounded-t-md'}`}
            onClick={() => handleTabChange('start')}
          >
            Start a New Swap
          </button>
        </div>
        
        {/* Tab Content Area */}
        <div className="bg-white rounded-md shadow p-6">
          {getTabContent()}
        </div>
      </main>
      
      {/* Simple Footer */}
      <footer className="bg-white shadow-inner mt-8 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 BookSwap. Connect with readers worldwide.</p>
        </div>
      </footer>
    </div>
  );
}

// Tab Components
function PendingSwapsTab({ swaps }) {
  if (swaps.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">You don't have any pending swaps at the moment.</p>
        <button 
          className="mt-4 bg-teal-600 hover:bg-teal-700 text-white py-2 px-6 rounded-md"
        >
          Browse Books to Swap
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-brown-800 mb-4">Pending Swap Requests</h2>
      <div className="space-y-4">
        {swaps.map(swap => (
          <SwapCard 
            key={swap.id} 
            swap={swap} 
            actions={[
              { label: 'Accept', color: 'bg-green-600 hover:bg-green-700' },
              { label: 'Decline', color: 'bg-red-600 hover:bg-red-700' },
              { label: 'Message', color: 'bg-blue-600 hover:bg-blue-700' }
            ]} 
          />
        ))}
      </div>
    </div>
  );
}

function ActiveSwapsTab({ swaps }) {
  if (swaps.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">You don't have any active swaps right now.</p>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-brown-800 mb-4">Active Book Swaps</h2>
      <div className="space-y-4">
        {swaps.map(swap => (
          <SwapCard 
            key={swap.id} 
            swap={swap} 
            actions={[
              { label: 'Mark Sent', color: 'bg-purple-600 hover:bg-purple-700' },
              { label: 'Mark Received', color: 'bg-green-600 hover:bg-green-700' },
              { label: 'Message', color: 'bg-blue-600 hover:bg-blue-700' }
            ]} 
          />
        ))}
      </div>
    </div>
  );
}

function CompletedSwapsTab({ swaps }) {
  if (swaps.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">You haven't completed any swaps yet.</p>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-brown-800 mb-4">Completed Swaps</h2>
      <div className="space-y-4">
        {swaps.map(swap => (
          <SwapCard 
            key={swap.id} 
            swap={swap} 
            actions={[
              { label: 'Leave Review', color: 'bg-yellow-600 hover:bg-yellow-700' }
            ]} 
          />
        ))}
      </div>
    </div>
  );
}

function StartSwapTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  
  // Mock available books for swapping
  const availableBooks = [
    { id: 1, title: "To Kill a Mockingbird", author: "Harper Lee", owner: "ClassicsReader", condition: "Good" },
    { id: 2, title: "Harry Potter", author: "J.K. Rowling", owner: "WizardFan", condition: "Like New" },
    { id: 3, title: "The Alchemist", author: "Paulo Coelho", owner: "BookWorm42", condition: "Acceptable" }
  ];
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-brown-800 mb-4">Start a New Book Swap</h2>
      
      {/* Search for books */}
      <div className="mb-6">
        <label htmlFor="search" className="block text-gray-700 mb-2">Search for available books:</label>
        <div className="flex">
          <input
            type="text"
            id="search"
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Enter book title, author or genre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-r-md">
            Search
          </button>
        </div>
      </div>
      
      {/* Book results */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-brown-800 mb-3">Available Books</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableBooks.map(book => (
            <div 
              key={book.id} 
              className={`border rounded-md p-4 cursor-pointer ${
                selectedBook?.id === book.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300'
              }`}
              onClick={() => setSelectedBook(book)}
            >
              <div className="flex items-start">
                <div className="bg-gray-200 w-16 h-24 rounded mr-4 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-brown-800">{book.title}</h4>
                  <p className="text-gray-600 text-sm">by {book.author}</p>
                  <p className="text-gray-600 text-sm mt-1">Owner: {book.owner}</p>
                  <p className="text-gray-600 text-sm">Condition: {book.condition}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Your books to offer */}
      {selectedBook && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-medium text-brown-800 mb-3">Select a book to offer in return:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 hover:border-teal-300 rounded-md p-4 cursor-pointer">
              <div className="flex items-start">
                <div className="bg-gray-200 w-16 h-24 rounded mr-4 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-brown-800">The Great Gatsby</h4>
                  <p className="text-gray-600 text-sm">by F. Scott Fitzgerald</p>
                  <p className="text-gray-600 text-sm mt-1">Condition: Very Good</p>
                </div>
              </div>
            </div>
            <div className="border border-gray-200 hover:border-teal-300 rounded-md p-4 cursor-pointer">
              <div className="flex items-start">
                <div className="bg-gray-200 w-16 h-24 rounded mr-4 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-brown-800">Little Women</h4>
                  <p className="text-gray-600 text-sm">by Louisa May Alcott</p>
                  <p className="text-gray-600 text-sm mt-1">Condition: Good</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-6 rounded-md">
              Propose Swap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable SwapCard component
function SwapCard({ swap, actions }) {
  return (
    <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-start">
          <div className="bg-gray-200 w-16 h-24 rounded mr-4 flex-shrink-0"></div>
          <div>
            <h3 className="font-medium text-brown-800">{swap.book}</h3>
            <p className="text-gray-600">with {swap.user}</p>
            <p className="text-gray-500 text-sm">Requested: {swap.date}</p>
            <div className="mt-2">
              <span className={`inline-block px-2 py-1 text-xs rounded ${
                swap.status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : swap.status === 'in-progress' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
              }`}>
                {swap.status === 'pending' ? 'Pending' : swap.status === 'in-progress' ? 'In Progress' : 'Completed'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          {actions.map((action, index) => (
            <button 
              key={index}
              className={`${action.color} text-white px-3 py-1 rounded-md text-sm`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}