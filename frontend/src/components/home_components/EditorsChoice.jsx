import { useState } from 'react';
import DiscussionCard from './DiscussionCard';

export default function EditorsChoice({ isAuthenticated }) {
  // Mock top discussions data
  const [topDiscussions] = useState([
    {
      id: 1,
      title: "Has anyone read 'Project Hail Mary' by Andy Weir? It's a masterpiece of sci-fi storytelling!",
      content: "I just finished reading this book and I'm blown away by how Weir combines hard science with emotional character development. The friendship between Rocky and Ryland is one of the most touching relationships I've read in sci-fi. What did everyone else think about the linguistics challenges and the creative problem-solving throughout?",
      author: { 
        username: "spacereader", 
        avatar: null 
      },
      upvotes: 42,
      commentCount: 15,
      createdAt: "2025-04-10T09:23:00Z",
      postType: "review"
    },
    {
      id: 2,
      title: "Looking for fantasy books with unique magic systems - suggestions?",
      content: "I've read all of Brandon Sanderson's works and love how he creates detailed, rule-based magic systems. Can anyone recommend other authors who create similarly unique magic systems? I'm particularly interested in magic that has real costs or limitations rather than being all-powerful.",
      author: { 
        username: "magicseeker", 
        avatar: null 
      },
      upvotes: 37,
      commentCount: 28,
      createdAt: "2025-04-12T14:15:00Z",
      postType: "question"
    },
    {
      id: 3,
      title: "My journey through classic literature this year - the highs and lows",
      content: "This year I challenged myself to read 12 classics I've never touched before. From the emotional devastation of 'Anna Karenina' to the surprising humor in 'Don Quixote', it's been quite a journey. The biggest surprise was how much I loved 'Middlemarch' despite its length. My biggest disappointment was probably 'The Great Gatsby' which didn't live up to the hype for me.",
      author: { 
        username: "literarytraveler", 
        avatar: null 
      },
      upvotes: 53,
      commentCount: 21,
      createdAt: "2025-04-14T16:42:00Z",
      postType: "recommendation"
    }
  ]);

  // For mobile scrolling - track if user is at first or last card
//   carouselPosition, 
  const [setCarouselPosition] = useState({
    isAtStart: true,
    isAtEnd: false
  });

  // Ref for the carousel element
  const handleScroll = (e) => {
    const container = e.target;
    const isAtStart = container.scrollLeft < 20;
    const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 20;
    
    setCarouselPosition({ isAtStart, isAtEnd });
  };

  return (
    <section className="py-12 bg-beige-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-brown-800">
            Editor's Choice
          </h2>
          <a 
            href="/discussions" 
            className="flex items-center text-teal-600 hover:text-teal-800 font-medium"
          >
            See All Discussions
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
        
        {/* Mobile Carousel View */}
        <div className="relative md:hidden">
          <div 
            className="flex overflow-x-auto gap-4 pb-4 snap-x"
            style={{ scrollbarWidth: 'none' }}
            onScroll={handleScroll}
          >
            {topDiscussions.map(post => (
              <div key={post.id} className="snap-start flex-shrink-0 w-full">
                <DiscussionCard 
                  postData={post} 
                  isAuthenticated={isAuthenticated} 
                />
              </div>
            ))}
          </div>
          
          {/* Carousel Indicators */}
          <div className="flex justify-center mt-4 gap-2">
            {topDiscussions.map((_, index) => (
              <div 
                key={index} 
                className={`h-2 rounded-full transition-all ${
                  index === 0 ? 'w-4 bg-teal-600' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Desktop Grid View */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {topDiscussions.map(post => (
            <DiscussionCard 
              key={post.id}
              postData={post} 
              isAuthenticated={isAuthenticated} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}