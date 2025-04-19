export default function DiscussionCard({ postData, isAuthenticated }) {
    const { 
      id, 
      title, 
      content, 
      author, 
      upvotes, 
      commentCount, 
      createdAt, 
      postType 
    } = postData;
  
    // Truncate content to create a snippet (100 chars)
    const contentSnippet = content.length > 100 
      ? `${content.substring(0, 100)}...` 
      : content;
      
    // Format date
    const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    // Post type badge color
    const getTypeColor = (type) => {
      switch(type) {
        case 'review': return 'bg-purple-100 text-purple-800';
        case 'question': return 'bg-blue-100 text-blue-800';
        case 'recommendation': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };
    
    const typeColorClass = getTypeColor(postType);
  
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-5">
          {/* Post Type Badge and Date */}
          <div className="flex justify-between items-center mb-3">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeColorClass}`}>
              {postType.charAt(0).toUpperCase() + postType.slice(1)}
            </span>
            <span className="text-xs text-gray-500">{formattedDate}</span>
          </div>
          
          {/* Title */}
          <h3 className="font-bold text-brown-800 text-xl mb-2 line-clamp-2">
            {title}
          </h3>
          
          {/* Content Snippet */}
          <p className="text-brown-600 mb-4 line-clamp-3">
            {contentSnippet}
          </p>
          
          {/* Author & Stats */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-medium mr-2">
                {author.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-brown-800">
                {author.username}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Upvotes */}
              <div className="flex items-center text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">{upvotes}</span>
              </div>
              
              {/* Comments */}
              <div className="flex items-center text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">{commentCount}</span>
              </div>
            </div>
          </div>
          
          {/* CTA Button */}
          <a 
            href={`/discussions/${id}`} 
            className="w-full block text-center py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded transition-colors"
          >
            {isAuthenticated ? 'Read More' : 'Join to Discuss'}
          </a>
        </div>
      </div>
    );
  }