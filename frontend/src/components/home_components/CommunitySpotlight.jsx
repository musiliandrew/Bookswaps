import { useState } from 'react';

// SocietyCard component to display individual society information
function SocietyCard({ society, isAuthenticated }) {
  const {  name, focus, memberCount, imageUrl, isJoined } = society;
  const [joined, setJoined] = useState(isJoined);
  
  const handleJoinToggle = () => {
    if (!isAuthenticated) {
      // Redirect to signup in a real application
      window.location.href = "/signup";
      return;
    }
    
    // In a real app, this would call an API to join/leave the society
    setJoined(!joined);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      {/* Society Image Banner */}
      <div 
        className="h-32 bg-gradient-to-r from-teal-600 to-teal-400 relative"
        style={imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {/* Member Count Overlay */}
        <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
          {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </div>
      </div>
      
      {/* Society Info */}
      <div className="p-4">
        <h3 className="font-bold text-brown-800 text-xl mb-1">
          {name}
        </h3>
        
        <p className="text-brown-600 text-sm mb-4">
          {focus}
        </p>
        
        {/* Join/Leave Button */}
        <button 
          onClick={handleJoinToggle}
          className={`w-full py-2 px-4 rounded font-medium transition-colors ${
            joined
              ? "bg-white border border-teal-600 text-teal-600 hover:bg-teal-50"
              : "bg-teal-600 text-white hover:bg-teal-700"
          }`}
        >
          {!isAuthenticated ? 'Sign Up to Join' : joined ? 'Joined' : 'Join Society'}
        </button>
      </div>
    </div>
  );
}

// Main CommunitySpotlight component
export default function CommunitySpotlight({ isAuthenticated }) {
  // Mock data for societies
  const [societies] = useState([
    {
      id: 1,
      name: "Classic Literature Guild",
      focus: "Discussing timeless novels and literary masterpieces from across centuries",
      memberCount: 342,
      imageUrl: "/api/placeholder/640/200",
      isJoined: false
    },
    {
      id: 2,
      name: "Sci-Fi Explorers",
      focus: "For lovers of science fiction from hard sci-fi to space opera",
      memberCount: 289,
      imageUrl: "/api/placeholder/640/200",
      isJoined: true
    },
    {
      id: 3,
      name: "Mystery & Thriller Readers",
      focus: "Unraveling plots and solving crimes together one book at a time",
      memberCount: 174,
      imageUrl: "/api/placeholder/640/200",
      isJoined: false
    }
  ]);

  return (
    <section className="py-12 bg-beige-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-brown-800">
            Community Spotlight
          </h2>
          <a 
            href="/societies" 
            className="flex items-center text-teal-600 hover:text-teal-800 font-medium"
          >
            Explore Societies
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
        
        {/* Mobile View - Scrollable Cards */}
        <div className="md:hidden overflow-x-auto pb-4">
          <div className="flex gap-4 w-max">
            {societies.map(society => (
              <div key={society.id} className="w-80 flex-shrink-0">
                <SocietyCard 
                  society={society} 
                  isAuthenticated={isAuthenticated} 
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Desktop Grid View */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {societies.map(society => (
            <SocietyCard 
              key={society.id}
              society={society} 
              isAuthenticated={isAuthenticated} 
            />
          ))}
        </div>
        
        {/* Community Benefits */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-brown-800 mb-4 text-center">
            Why Join BookSwap Societies?
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start">
              <div className="mr-3 text-teal-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-brown-800 mb-1">Connect with Readers</h4>
                <p className="text-brown-600 text-sm">Find like-minded book lovers who share your literary interests.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-3 text-teal-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-brown-800 mb-1">Monthly Book Clubs</h4>
                <p className="text-brown-600 text-sm">Participate in guided discussions about selected books each month.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-3 text-teal-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-brown-800 mb-1">Member Events</h4>
                <p className="text-brown-600 text-sm">Virtual meetups, author Q&As, and special book swapping opportunities.</p>
              </div>
            </div>
          </div>
          
          {!isAuthenticated && (
            <div className="mt-6 text-center">
              <a 
                href="/signup" 
                className="inline-block py-2 px-6 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
              >
                Join BookSwap Community
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}