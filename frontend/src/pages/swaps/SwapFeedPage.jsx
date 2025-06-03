import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { useSwaps } from '../../hooks/useSwaps';
import { useAuth } from '../../hooks/useAuth';
import { useUsers } from '../../hooks/useUsers';
import { useDiscussions } from '../../hooks/useDiscussions';
import { toast } from 'react-toastify';
import SwapCard from '../../components/swaps/SwapCard';
import ErrorMessage from '../../components/auth/ErrorMessage';
import Button from '../../components/common/Button'; 

function SwapFeedPage() {
  const navigate = useNavigate();
  const { getSwaps, swaps, error, isLoading } = useSwaps();
  const { user, isAuthenticated, profile } = useAuth();
  const { searchUsers } = useUsers();
  const { createPost } = useDiscussions();
  const [globalError, setGlobalError] = useState('');
  const [activeTab, setActiveTab] = useState('received');
  const [showShareCard, setShowShareCard] = useState(null); // Track swap ID for sharing
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      getSwaps().catch(() => setGlobalError('Failed to load swaps.'));
      // Fetch suggested users based on genres
      searchUsers({ genres: profile?.favorite_genres || [] })
        .then((res) => setSuggestedUsers(res?.users || []))
        .catch(() => toast.error('Failed to load suggested users'));
    }
  }, [isAuthenticated, navigate, getSwaps, searchUsers, profile]);

  useEffect(() => {
    if (swaps?.length >= 3 && profile?.swaps_count >= 3) {
      toast.success('🎉 Badge Earned: Swapper (3 Swaps)!');
    }
  }, [swaps, profile]);

  const filteredSwaps = swaps?.filter((swap) =>
    activeTab === 'received'
      ? swap.recipient?.id === user?.id
      : swap.initiator?.id === user?.id
  );

  const handleDiscuss = async (swap) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to discuss');
      navigate('/login');
      return;
    }
    try {
      await createPost({
        content: `Just swapped ${swap.book_title}! What did you think about it?`,
        book_id: swap.book_id,
      });
      toast.success('Discussion posted!');
      navigate('/discussions');
    } catch (err) {
      console.error('Discuss error:', err);
      toast.error('Failed to create discussion');
    }
  };

  const handleShare = (swapId) => {
    setShowShareCard(swapId);
  };

  return (
    <div className="min-h-screen bg-[#F5E8C7] py-12 px-4 sm:px-6 lg:px-8 bookish-gradient">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        <motion.h2
          className="text-center text-3xl font-['Playfair_Display'] text-[#FF6F61] mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Your Swaps
        </motion.h2>
        <motion.p
          className="text-center text-sm text-[#333] font-['Poppins'] mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Manage your book swap requests.
        </motion.p>

        {/* Tabs */}
        <motion.div
          className="flex justify-center space-x-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <button
            className={`px-4 py-2 font-['Poppins'] text-sm rounded-full ${
              activeTab === 'received' ? 'bg-[#FF6F61] text-white' : 'bg-[#F5E8C7] text-[#333]'
            }`}
            onClick={() => setActiveTab('received')}
          >
            Received
          </button>
          <button
            className={`px-4 py-2 font-['Poppins'] text-sm rounded-full ${
              activeTab === 'sent' ? 'bg-[#FF6F61] text-white' : 'bg-[#F5E8C7] text-[#333]'
            }`}
            onClick={() => setActiveTab('sent')}
          >
            Sent
          </button>
          <Link
            to="/swaps/history"
            className="px-4 py-2 font-['Poppins'] text-sm rounded-full bg-[#F5E8C7] text-[#333] hover:bg-[#FF6F61] hover:text-white"
          >
            History
          </Link>
        </motion.div>

        {/* Suggested Users */}
        {suggestedUsers.length > 0 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h3 className="text-xl font-['Playfair_Display'] text-[#FF6F61] mb-4">
              Suggested Swap Partners
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {suggestedUsers.slice(0, 4).map((user) => (
                <Link
                  key={user.user_id}
                  to={`/users/${user.username}`}
                  className="p-4 border rounded bookish-shadow hover:bg-gray-100"
                >
                  <p className="font-['Poppins']">{user.username}</p>
                  <p className="text-sm text-gray-600">
                    Likes: {user.favorite_genres?.join(', ') || 'N/A'}
                  </p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Global Error */}
        <AnimatePresence>
          {(error || globalError) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ErrorMessage message={globalError || error} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swap Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {isLoading ? (
            <div className="text-center">
              <div className="bookish-spinner mx-auto"></div>
              <p className="text-[#333] font-['Poppins'] mt-2">Loading...</p>
            </div>
          ) : filteredSwaps?.length ? (
            <ul className="space-y-6">
              <AnimatePresence>
                {filteredSwaps.map((swap, index) => (
                  <motion.li
                    key={swap.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <div className="flex justify-between items-center">
                      <SwapCard swap={swap} isReceived={activeTab === 'received'} />
                      <div className="flex gap-2">
                        <Link to={`/swaps/${swap.id}`}>
                          <Button
                            text="View Details"
                            className="bookish-button-enhanced bg-blue-600"
                          />
                        </Link>
                        <Button
                          text="Discuss"
                          onClick={() => handleDiscuss(swap)}
                          className="bookish-button-enhanced bg-orange-600"
                        />
                        <Button
                          text="Share"
                          onClick={() => handleShare(swap.id)}
                          className="bookish-button-enhanced bg-teal-600"
                        />
                      </div>
                    </div>
                    {showShareCard === swap.id && (
                      <motion.div
                        className="mt-4"
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
                              <meshStandardMaterial color="#FF6F61" />
                              <Text position={[0, 0.5, 0.1]} fontSize={0.2} color="white">
                                Swap: {swap.book_title}
                              </Text>
                              <Text position={[0, 0, 0.1]} fontSize={0.15} color="white">
                                With {swap.recipient?.username || 'User'}
                              </Text>
                            </mesh>
                          </Canvas>
                          <Button
                            text="Share on X"
                            onClick={() => console.log('Share to X')}
                            className="mt-2 bg-blue-600"
                          />
                        </div>
                      </motion.div>
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <p className="text-center text-[#333] font-['Poppins']">
              No {activeTab} swaps found.
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SwapFeedPage;