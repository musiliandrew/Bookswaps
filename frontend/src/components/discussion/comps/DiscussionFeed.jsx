import React, { useState, useEffect } from 'react';
import PostCard from './PostCard'; // Assuming you have this component

// Mock data for discussion posts
const MOCK_DISCUSSIONS = [
  {
    id: 1,
    title: "The symbolism in 'To Kill a Mockingbird'",
    content: "I recently re-read this classic and was struck by how the mockingbird symbolism extends beyond the obvious references...",
    createdAt: "2025-04-15T14:30:00Z",
    user: {
      id: 101,
      username: "bookworm42",
      avatar: "/api/placeholder/40/40"
    },
    book: {
      id: 1,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      coverImage: "/api/placeholder/120/180"
    },
    genres: ["Fiction", "Classic", "Coming-of-age"],
    commentCount: 24,
    likeCount: 56
  },
  {
    id: 2,
    title: "1984's relevance in today's digital surveillance age",
    content: "With the rise of mass digital surveillance, I can't help but draw parallels to Orwell's masterpiece...",
    createdAt: "2025-04-14T09:15:00Z",
    user: {
      id: 102,
      username: "literarylover",
      avatar: "/api/placeholder/40/40"
    },
    book: {
      id: 2,
      title: "1984",
      author: "George Orwell",
      coverImage: "/api/placeholder/120/180"
    },
    genres: ["Fiction", "Science Fiction", "Dystopian"],
    commentCount: 47,
    likeCount: 83
  },
  {
    id: 3,
    title: "The Great Gatsby's critique of the American Dream",
    content: "Fitzgerald's portrayal of wealth and status in the Jazz Age continues to resonate...",
    createdAt: "2025-04-12T16:45:00Z",
    user: {
      id: 103,
      username: "classicreader",
      avatar: "/api/placeholder/40/40"
    },
    book: {
      id: 4,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      coverImage: "/api/placeholder/120/180"
    },
    genres: ["Fiction", "Classic", "Literary Fiction"],
    commentCount: 18,
    likeCount: 42
  },
  {
    id: 4,
    title: "Character development in Pride and Prejudice",
    content: "The way Jane Austen develops Elizabeth Bennet's character throughout the novel shows her mastery of character arc...",
    createdAt: "2025-04-10T11:20:00Z",
    user: {
      id: 104,
      username: "austenite",
      avatar: "/api/placeholder/40/40"
    },
    book: {
      id: 3,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      coverImage: "/api/placeholder/120/180"
    },
    genres: ["Fiction", "Classic", "Romance"],
    commentCount: 32,
    likeCount: 68
  },
  {
    id: 5,
    title: "Brave New World vs. 1984: Different dystopian visions",
    content: "While both novels present dystopian futures, Huxley's vision of control through pleasure contrasts with Orwell's vision of control through pain...",
    createdAt: "2025-04-08T14:25:00Z",
    user: {
      id: 105,
      username: "dystopianfan",
      avatar: "/api/placeholder/40/40"
    },
    book: {
      id: 5,
      title: "Brave New World",
      author: "Aldous Huxley",
      coverImage: "/api/placeholder/120/180"
    },
    genres: ["Fiction", "Science Fiction", "Dystopian"],
    commentCount: 39,
    likeCount: 71
  },
  {
    id: 6,
    title: "Holden Caulfield: Relatable or irritating?",
    content: "I've always had mixed feelings about the protagonist of The Catcher in the Rye. On one hand, his alienation is relatable, but on the other...",
    createdAt: "2025-04-05T19:10:00Z",
    user: {
      id: 106,
      username: "literaturestudent",
      avatar: "/api/placeholder/40/40"
    },
    book: {
      id: 6,
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      coverImage: "/api/placeholder/120/180"
    },
    genres: ["Fiction", "Coming-of-age", "Literary Fiction"],
    commentCount: 53,
    likeCount: 38
  }
];

const DiscussionFeed = ({ filters = {} }) => {
  // State management
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    sort: 'recent',
    genre: '',
    search: '',
    ...filters
  });

  // Fetch discussions (mock implementation)
  const fetchDiscussions = async (isLoadMore = false) => {
    if (isLoadMore && !hasMore) return;
    
    const newPage = isLoadMore ? page + 1 : 1;
    
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter and sort logic with mock data
      let filteredData = [...MOCK_DISCUSSIONS];
      
      // Apply search filter
      if (activeFilters.search) {
        const searchTerm = activeFilters.search.toLowerCase();
        filteredData = filteredData.filter(post => 
          post.title.toLowerCase().includes(searchTerm) || 
          post.content.toLowerCase().includes(searchTerm) ||
          post.book.title.toLowerCase().includes(searchTerm) ||
          post.book.author.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply genre filter
      if (activeFilters.genre) {
        filteredData = filteredData.filter(post => 
          post.genres.some(genre => 
            genre.toLowerCase() === activeFilters.genre.toLowerCase()
          )
        );
      }
      
      // Apply sorting
      switch (activeFilters.sort) {
        case 'recent':
          filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'popular':
          filteredData.sort((a, b) => b.likeCount - a.likeCount);
          break;
        case 'comments':
          filteredData.sort((a, b) => b.commentCount - a.commentCount);
          break;
        default:
          filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      // Pagination (mock implementation)
      const ITEMS_PER_PAGE = 3;
      const startIndex = isLoadMore ? (newPage - 1) * ITEMS_PER_PAGE : 0;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      // Update state based on whether this is an initial load or "load more"
      if (isLoadMore) {
        setDiscussions(prev => [...prev, ...paginatedData]);
      } else {
        setDiscussions(paginatedData);
      }
      
      setPage(newPage);
      setHasMore(endIndex < filteredData.length);
      setError(null);
      
    } catch (err) {
      console.error("Error fetching discussions:", err);
      setError("Failed to load discussions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and filter changes
  useEffect(() => {
    setActiveFilters(prevFilters => ({
      ...prevFilters,
      ...filters
    }));
    
    fetchDiscussions(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.sort, filters.genre, filters.search]);

  // Handler for the load more button
  const handleLoadMore = () => {
    fetchDiscussions(true);
  };

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
      </svg>
      <h3 className="mt-2 text-lg font-medium text-gray-900">No discussions found</h3>
      <p className="mt-1 text-sm text-gray-500">
        {activeFilters.search || activeFilters.genre 
          ? "Try adjusting your filters to see more results." 
          : "Be the first to start a discussion!"}
      </p>
      {(activeFilters.search || activeFilters.genre) && (
        <button 
          onClick={() => {
            const resetFilters = { sort: 'recent', genre: '', search: '' };
            setActiveFilters(resetFilters);
            // In a real implementation, you would emit this change to the parent component
          }}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          Clear filters
        </button>
      )}
    </div>
  );

  // Display active filters
  const FilterBadges = () => {
    const hasActiveFilters = activeFilters.genre || activeFilters.search || activeFilters.sort !== 'recent';
    
    if (!hasActiveFilters) return null;
    
    return (
      <div className="mb-4 flex flex-wrap gap-2">
        {activeFilters.sort !== 'recent' && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
            {activeFilters.sort === 'popular' ? 'Most popular' : 'Most commented'}
            <button 
              onClick={() => {
                const newFilters = { ...activeFilters, sort: 'recent' };
                setActiveFilters(newFilters);
                // In a real implementation, you would emit this change to the parent component
              }}
              className="ml-2 text-teal-600 hover:text-teal-800 focus:outline-none"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </span>
        )}
        
        {activeFilters.genre && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
            Genre: {activeFilters.genre}
            <button 
              onClick={() => {
                const newFilters = { ...activeFilters, genre: '' };
                setActiveFilters(newFilters);
                // In a real implementation, you would emit this change to the parent component
              }}
              className="ml-2 text-indigo-600 hover:text-indigo-800 focus:outline-none"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </span>
        )}
        
        {activeFilters.search && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
            Search: "{activeFilters.search}"
            <button 
              onClick={() => {
                const newFilters = { ...activeFilters, search: '' };
                setActiveFilters(newFilters);
                // In a real implementation, you would emit this change to the parent component
              }}
              className="ml-2 text-amber-600 hover:text-amber-800 focus:outline-none"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </span>
        )}
      </div>
    );
  };

  // In a real implementation, this would be a separate component
  const PostCardPlaceholder = () => (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 animate-pulse">
      <div className="flex items-start">
        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
        <div className="ml-3 flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="flex items-center justify-between mt-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      <h1 className="text-3xl font-bold text-brown-800 mb-6">
        <span className="text-teal-600">Book</span>Swap Discussions
      </h1>
      
      {/* Filter badges */}
      <FilterBadges />
      
      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <div className="flex">
            <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* Loading state (initial) */}
      {loading && discussions.length === 0 && (
        <>
          <PostCardPlaceholder />
          <PostCardPlaceholder />
          <PostCardPlaceholder />
        </>
      )}
      
      {/* Empty state */}
      {!loading && discussions.length === 0 && <EmptyState />}
      
      {/* Discussion list */}
      {discussions.length > 0 && (
        <div className="space-y-4">
          {discussions.map(discussion => (
            <PostCard 
              key={discussion.id}
              post={discussion}
            />
          ))}
        </div>
      )}
      
      {/* Load more button */}
      {hasMore && discussions.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className={`px-6 py-2 rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-teal-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading more...
              </div>
            ) : "Load more discussions"}
          </button>
        </div>
      )}
    </div>
  );
};

export default DiscussionFeed;