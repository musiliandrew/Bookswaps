import { useState, useEffect } from 'react';

// Mock data
const mockMyBooks = [
  { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", cover_url: "/api/placeholder/120/180", condition: "Good", available_for_exchange: true },
  { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", cover_url: "/api/placeholder/120/180", condition: "Excellent", available_for_exchange: true },
  { id: 3, title: "1984", author: "George Orwell", cover_url: "/api/placeholder/120/180", condition: "Fair", available_for_exchange: true },
  { id: 4, title: "Pride and Prejudice", author: "Jane Austen", cover_url: "/api/placeholder/120/180", condition: "Good", available_for_exchange: true }
];

const mockOtherBooks = [
  { id: 101, title: "The Hobbit", author: "J.R.R. Tolkien", cover_url: "/api/placeholder/120/180", condition: "Good", owner: "user123", owner_name: "John Doe" },
  { id: 102, title: "Dune", author: "Frank Herbert", cover_url: "/api/placeholder/120/180", condition: "Excellent", owner: "user456", owner_name: "Jane Smith" },
  { id: 103, title: "The Catcher in the Rye", author: "J.D. Salinger", cover_url: "/api/placeholder/120/180", condition: "Good", owner: "user789", owner_name: "Alice Johnson" },
  { id: 104, title: "Brave New World", author: "Aldous Huxley", cover_url: "/api/placeholder/120/180", condition: "Fair", owner: "user101", owner_name: "Bob Williams" }
];

const mockSuggestedLocations = [
  { id: 1, name: "Central Library", address: "123 Main St", distance: 0.8 },
  { id: 2, name: "Booklovers Café", address: "456 Oak Ave", distance: 1.2 },
  { id: 3, name: "Community Center", address: "789 Pine Rd", distance: 1.5 }
];

// YourBooksSelector Component
const YourBooksSelector = ({ selectedBooks, setSelectedBooks }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      setBooks(mockMyBooks);
      setLoading(false);
    }, 500);
  }, []);

  const toggleBookSelection = (book) => {
    if (selectedBooks.some(b => b.id === book.id)) {
      setSelectedBooks(selectedBooks.filter(b => b.id !== book.id));
    } else {
      setSelectedBooks([...selectedBooks, book]);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-teal-500 rounded-full border-t-transparent"></div></div>;
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4 text-brown-800">Select Your Books to Swap</h2>
      {books.length === 0 ? (
        <p className="text-brown-600">You don't have any books available for exchange.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {books.map(book => (
            <div 
              key={book.id} 
              className={`border rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow ${
                selectedBooks.some(b => b.id === book.id) ? 'border-teal-500 ring-2 ring-teal-500' : 'border-gray-200'
              }`}
            >
              <div className="p-4 flex flex-col items-center">
                <img 
                  src={book.cover_url} 
                  alt={book.title}
                  className="h-40 w-24 object-cover mb-3"
                />
                <h3 className="font-medium text-brown-800 text-center">{book.title}</h3>
                <p className="text-sm text-brown-600 text-center">{book.author}</p>
                <p className="text-xs text-brown-500 mt-1">Condition: {book.condition}</p>
                <button
                  onClick={() => toggleBookSelection(book)}
                  className={`mt-3 px-4 py-1 rounded text-sm ${
                    selectedBooks.some(b => b.id === book.id) 
                      ? 'bg-teal-500 text-white' 
                      : 'bg-white text-teal-600 border border-teal-500'
                  }`}
                >
                  {selectedBooks.some(b => b.id === book.id) ? 'Selected' : 'Select'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// OtherBooksSelector Component
const OtherBooksSelector = ({ selectedOtherBooks, setSelectedOtherBooks }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      setBooks(mockOtherBooks);
      setLoading(false);
    }, 700);
  }, []);

  const toggleBookSelection = (book) => {
    if (selectedOtherBooks.some(b => b.id === book.id)) {
      setSelectedOtherBooks(selectedOtherBooks.filter(b => b.id !== book.id));
    } else {
      setSelectedOtherBooks([...selectedOtherBooks, book]);
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-teal-500 rounded-full border-t-transparent"></div></div>;
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4 text-brown-800">Select Books to Receive</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by title, author, or owner"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      {filteredBooks.length === 0 ? (
        <p className="text-brown-600">No books match your search criteria.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBooks.map(book => (
            <div 
              key={book.id} 
              className={`border rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow ${
                selectedOtherBooks.some(b => b.id === book.id) ? 'border-teal-500 ring-2 ring-teal-500' : 'border-gray-200'
              }`}
            >
              <div className="p-4 flex flex-col items-center">
                <img 
                  src={book.cover_url} 
                  alt={book.title}
                  className="h-40 w-24 object-cover mb-3"
                />
                <h3 className="font-medium text-brown-800 text-center">{book.title}</h3>
                <p className="text-sm text-brown-600 text-center">{book.author}</p>
                <p className="text-xs text-brown-500 mt-1">Owner: {book.owner_name}</p>
                <p className="text-xs text-brown-500">Condition: {book.condition}</p>
                <button
                  onClick={() => toggleBookSelection(book)}
                  className={`mt-3 px-4 py-1 rounded text-sm ${
                    selectedOtherBooks.some(b => b.id === book.id) 
                      ? 'bg-teal-500 text-white' 
                      : 'bg-white text-teal-600 border border-teal-500'
                  }`}
                >
                  {selectedOtherBooks.some(b => b.id === book.id) ? 'Selected' : 'Select'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// MeetupDetailsForm Component
const MeetupDetailsForm = ({ meetupDetails, setMeetupDetails }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Load suggested locations
    setLocations(mockSuggestedLocations);
  }, []);

  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          setMeetupDetails({
            ...meetupDetails,
            userLocation: { lat: latitude, lon: longitude }
          });
          // In a real app, we would fetch midpoint locations here
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setMeetupDetails({ ...meetupDetails, date: e.target.value });
  };

  const handleTimeChange = (e) => {
    setMeetupDetails({ ...meetupDetails, time: e.target.value });
  };

  const handleLocationChange = (e) => {
    const locationId = parseInt(e.target.value);
    const selectedLocation = locations.find(loc => loc.id === locationId);
    setMeetupDetails({ ...meetupDetails, location: selectedLocation });
  };

  // Get minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4 text-brown-800">Meetup Details</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label className="block text-brown-700 mb-2">Date</label>
          <input
            type="date"
            min={minDate}
            value={meetupDetails.date || ''}
            onChange={handleDateChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-brown-700 mb-2">Time</label>
          <input
            type="time"
            value={meetupDetails.time || ''}
            onChange={handleTimeChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-brown-700 mb-2">Location</label>
          <div className="flex items-center mb-4">
            <button
              onClick={getCurrentLocation}
              className="bg-teal-600 text-white px-4 py-2 rounded flex items-center"
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></div>
              ) : null}
              {userLocation ? 'Update My Location' : 'Use My Location'}
            </button>
            {userLocation && (
              <span className="ml-3 text-green-600 text-sm">Location detected!</span>
            )}
          </div>

          <select
            value={meetupDetails.location?.id || ''}
            onChange={handleLocationChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          >
            <option value="">Select a meeting place</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name} - {location.address} ({location.distance} miles)
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

// SwapSummaryModal Component
const SwapSummaryModal = ({ isOpen, onClose, yourBooks, otherBooks, meetupDetails, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-90 overflow-y-auto p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-brown-800 mb-4">Confirm Book Swap</h2>
        
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2 text-brown-700">Books You're Giving</h3>
          {yourBooks.length === 0 ? (
            <p className="text-red-500">Please select at least one book to give.</p>
          ) : (
            <ul className="list-disc pl-5">
              {yourBooks.map(book => (
                <li key={book.id} className="text-brown-600">{book.title} by {book.author}</li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2 text-brown-700">Books You're Receiving</h3>
          {otherBooks.length === 0 ? (
            <p className="text-red-500">Please select at least one book to receive.</p>
          ) : (
            <ul className="list-disc pl-5">
              {otherBooks.map(book => (
                <li key={book.id} className="text-brown-600">{book.title} by {book.author} (from {book.owner_name})</li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2 text-brown-700">Meetup Details</h3>
          {!meetupDetails.date || !meetupDetails.time || !meetupDetails.location ? (
            <p className="text-red-500">Please complete all meetup details.</p>
          ) : (
            <div className="text-brown-600">
              <p><strong>Date & Time:</strong> {meetupDetails.date} at {meetupDetails.time}</p>
              <p><strong>Location:</strong> {meetupDetails.location.name}, {meetupDetails.location.address}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-brown-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={yourBooks.length === 0 || otherBooks.length === 0 || !meetupDetails.date || !meetupDetails.time || !meetupDetails.location}
            className={`px-4 py-2 rounded text-white ${
              yourBooks.length === 0 || otherBooks.length === 0 || !meetupDetails.date || !meetupDetails.time || !meetupDetails.location
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            Confirm Swap
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Swap Tab Component
const SwapTab = () => {
  const [step, setStep] = useState(1);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [selectedOtherBooks, setSelectedOtherBooks] = useState([]);
  const [meetupDetails, setMeetupDetails] = useState({
    date: '',
    time: '',
    location: null,
    userLocation: null
  });
  const [showSummary, setShowSummary] = useState(false);
  const [ setIsSubmitting] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);

  const handleConfirmSwap = () => {
    setIsSubmitting(true);
    
    // Mock API call
    setTimeout(() => {
      console.log("Swap details:", {
        myBooks: selectedBooks,
        otherBooks: selectedOtherBooks,
        meetupDetails
      });
      
      setIsSubmitting(false);
      setShowSummary(false);
      setSwapSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setSelectedBooks([]);
        setSelectedOtherBooks([]);
        setMeetupDetails({
          date: '',
          time: '',
          location: null,
          userLocation: null
        });
        setStep(1);
        setSwapSuccess(false);
      }, 3000);
    }, 1500);
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const reviewSwap = () => {
    setShowSummary(true);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {swapSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-brown-800 mb-2">Swap Request Sent!</h2>
            <p className="text-brown-600 mb-4">The other user will be notified of your swap request.</p>
            <p className="text-brown-600">You'll receive a notification when they respond.</p>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold text-brown-800 mb-6">Start a Book Swap</h1>
      
      <div className="mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-teal-500' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
            2
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-teal-500' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
            3
          </div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-brown-600">
          <span>Select Your Books</span>
          <span>Select Books to Receive</span>
          <span>Set Meetup Details</span>
        </div>
      </div>

      {step === 1 && (
        <>
          <YourBooksSelector selectedBooks={selectedBooks} setSelectedBooks={setSelectedBooks} />
          <div className="flex justify-end">
            <button
              onClick={nextStep}
              disabled={selectedBooks.length === 0}
              className={`px-6 py-2 rounded ${
                selectedBooks.length === 0 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-teal-600 text-white hover:bg-teal-700'
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <OtherBooksSelector selectedOtherBooks={selectedOtherBooks} setSelectedOtherBooks={setSelectedOtherBooks} />
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              className="px-6 py-2 border border-gray-300 rounded text-brown-700 hover:bg-gray-100"
            >
              Back
            </button>
            <button
              onClick={nextStep}
              disabled={selectedOtherBooks.length === 0}
              className={`px-6 py-2 rounded ${
                selectedOtherBooks.length === 0 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-teal-600 text-white hover:bg-teal-700'
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <MeetupDetailsForm meetupDetails={meetupDetails} setMeetupDetails={setMeetupDetails} />
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              className="px-6 py-2 border border-gray-300 rounded text-brown-700 hover:bg-gray-100"
            >
              Back
            </button>
            <button
              onClick={reviewSwap}
              disabled={!meetupDetails.date || !meetupDetails.time || !meetupDetails.location}
              className={`px-6 py-2 rounded ${
                !meetupDetails.date || !meetupDetails.time || !meetupDetails.location
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-teal-600 text-white hover:bg-teal-700'
              }`}
            >
              Review Swap
            </button>
          </div>
        </>
      )}

      <SwapSummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        yourBooks={selectedBooks}
        otherBooks={selectedOtherBooks}
        meetupDetails={meetupDetails}
        onConfirm={handleConfirmSwap}
      />
    </div>
  );
};

export default SwapTab;