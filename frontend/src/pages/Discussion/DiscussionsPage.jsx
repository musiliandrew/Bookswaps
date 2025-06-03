import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { toast } from 'react-toastify';
import { useDiscussions } from '../../hooks/useDiscussions';
import { useAuth } from '../../hooks/useAuth';
import DiscussionCard from '../../components/discussions/DiscussionCard'; 

const DiscussionsPage = () => {
  const { getPosts, posts, isLoading, error, getBooks, getSocieties } = useDiscussions();
  const { profile } = useAuth();
  const [bookFilter, setBookFilter] = useState('');
  const [societyFilter, setSocietyFilter] = useState('');
  const [bookOptions, setBookOptions] = useState([]);
  const [societyOptions, setSocietyOptions] = useState([]);
  const [showShareCard, setShowShareCard] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getPosts();
        const books = await getBooks();
        const societies = await getSocieties();
        setBookOptions(books || []);
        setSocietyOptions(societies || []);
        if (profile?.discussions_viewed >= 10) {
          toast.success('🎉 Badge Earned: Discussion Explorer (10 Discussions Viewed)!');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        toast.error('Failed to load discussions or filters');
      }
    };
    fetchData();
  }, [getPosts, getBooks, getSocieties, profile]);

  useEffect(() => {
    if (error) {
      toast.error(error || 'Error loading discussions');
    }
  }, [error]);

  const filteredPosts = posts.filter(
    (post) =>
      (!bookFilter || post.book_id === bookFilter) &&
      (!societyFilter || post.society_id === societyFilter)
  );

  const handleShare = () => {
    setShowShareCard(true);
  };

  if (isLoading) {
    return (
      <motion.div
        className="text-center p-4 font-['Poppins'] text-[var(--text)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Loading...
      </motion.div>
    );
  }

  return (
    <motion.div
      className="container mx-auto p-4 bookish-gradient min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      role="main"
      aria-labelledby="discussions-title"
    >
      <div className="flex justify-between items-center mb-4">
        <motion.h1
          id="discussions-title"
          className="text-3xl font-bold font-['Playfair_Display'] text-[var(--primary)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Discussions
        </motion.h1>
        <Link
          to="/discussions/new"
          className="bookish-button-enhanced px-4 py-2 rounded bg-[var(--primary)] hover:bg-[var(--accent)] font-['Poppins']"
          aria-label="Start a new discussion"
        >
          New Discussion
        </Link>
      </div>

      <motion.div
        className="flex gap-4 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex-1">
          <label htmlFor="book-filter" className="block text-sm font-medium text-[var(--primary)] font-['Lora']">
            Filter by Book
          </label>
          <select
            id="book-filter"
            value={bookFilter}
            onChange={(e) => setBookFilter(e.target.value)}
            className="bookish-input mt-1 block w-full px-4 py-3 rounded-xl font-['Open_Sans'] text-[var(--text)]"
            aria-label="Filter discussions by book"
          >
            <option value="">All Books</option>
            {bookOptions.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="society-filter" className="block text-sm font-medium text-[var(--primary)] font-['Lora']">
            Filter by Society
          </label>
          <select
            id="society-filter"
            value={societyFilter}
            onChange={(e) => setSocietyFilter(e.target.value)}
            className="bookish-input mt-1 block w-full px-4 py-3 rounded-xl font-['Open_Sans'] text-[var(--text)]"
            aria-label="Filter discussions by society"
          >
            <option value="">All Societies</option>
            {societyOptions.map((society) => (
              <option key={society.id} value={society.id}>
                {society.name}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {filteredPosts.length ? (
        <motion.div
          className="space-y-4"
          role="list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <AnimatePresence>
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                role="listitem"
              >
                <DiscussionCard post={post} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.p
          className="text-center font-['Poppins'] text-[var(--text)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          No discussions found.{' '}
          <Link to="/discussions/new" className="text-[var(--primary)] hover:underline" aria-label="Start a new discussion">
            Start one!
          </Link>
        </motion.p>
      )}

      <motion.button
        onClick={handleShare}
        className="bookish-button-enhanced mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded font-['Poppins']"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        aria-label="Share discussions page"
      >
        Share Discussions
      </motion.button>

      {showShareCard && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-64 w-full bookish-shadow">
            <Canvas>
              <ambientLight />
              <OrbitControls />
              <mesh>
                <boxGeometry args={[3, 2, 0.1]} />
                <meshStandardMaterial color="var(--primary)" />
                <Text position={[0, 0.5, 0.1]} fontSize={0.2} color="white">
                  BookSwaps.io Discussions
                </Text>
                <Text position={[0, 0, 0.1]} fontSize={0.15} color="white">
                  Join the conversation!
                </Text>
              </mesh>
            </Canvas>
            <motion.button
              onClick={() => console.log('Share to X')}
              className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-['Poppins']"
              aria-label="Share discussions page on X"
            >
              Share on X
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DiscussionsPage;