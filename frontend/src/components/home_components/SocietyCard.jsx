import { useState } from 'react';

export default function SocietyCard({ societyData, isAuthenticated }) {
  const { 
    id, 
    name, 
    description, 
    memberCount, 
    imageUrl, 
    category,
    isJoined = false,
    upcomingEvents = 0,
    activityLevel
  } = societyData;
  
  
  const [joined, setJoined] = useState(isJoined);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get activity level indicator color
  const getActivityColor = () => {
    switch(activityLevel) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };
  
  // Handle join/leave society button click
  const handleJoinToggle = async () => {
    // For non-authenticated users, redirect to signup
    if (!isAuthenticated) {
      window.location.href = "/signup";
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real application, this would be an API call:
      // joined ? 
      //   await axios.post(`/api/chat/societies/${id}/leave/`) :
      //   await axios.post(`/api/chat/societies/${id}/join/`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Toggle joined state
      setJoined(!joined);
    } catch (error) {
      console.error("Error joining/leaving society:", error);
      // Would handle errors here in a real app
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all">
      {/* Society Banner Image */}
      <div 
        className="h-36 bg-gradient-to-r from-teal-600 to-teal-400 relative"
        style={imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
          {category}
        </div>
        
        {/* Activity Level Indicator */}
        <div className="absolute top-3 right-3 flex items-center bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
          <div className={`w-2 h-2 rounded-full mr-1 ${getActivityColor()}`}></div>
          {activityLevel === 'high' ? 'Active now' : 'Last active 2h ago'}
        </div>
      </div>
      
      {/* Society Content */}
      <div className="p-4">
        {/* Society Name and Member Count */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-brown-800 text-xl">{name}</h3>
          <span className="text-gray-500 text-sm">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
        </div>
        
        {/* Society Description */}
        <p className="text-brown-600 text-sm mb-4 line-clamp-2">
          {description}
        </p>
        
        {/* Upcoming Events Badge (if any) */}
        {upcomingEvents > 0 && (
          <div className="mb-4 text-xs inline-block bg-amber-100 text-amber-800 px-2 py-1 rounded">
            {upcomingEvents} upcoming {upcomingEvents === 1 ? 'event' : 'events'}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Join/Leave Button */}
          <button 
            onClick={handleJoinToggle}
            disabled={isLoading}
            className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${
              isLoading 
                ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                : joined
                  ? "bg-white border border-teal-600 text-teal-600 hover:bg-teal-50"
                  : "bg-teal-600 text-white hover:bg-teal-700"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : !isAuthenticated ? (
              'Sign Up to Join'
            ) : joined ? (
              'Joined'
            ) : (
              'Join'
            )}
          </button>
          
          {/* View Details Button */}
          <a 
            href={`/societies/${id}`}
            className="py-2 px-4 bg-white border border-brown-800 text-brown-800 hover:bg-brown-800 hover:text-white rounded font-medium transition-colors"
          >
            View Details
          </a>
        </div>
      </div>
    </div>
  );
}