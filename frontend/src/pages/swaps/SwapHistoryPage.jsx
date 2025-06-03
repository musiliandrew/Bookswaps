import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { toast } from 'react-toastify';
import { useSwaps } from '../../hooks/useSwaps';
import { useAuth } from '../../hooks/useAuth';
import { useDiscussions } from '../../hooks/useDiscussions';
import ErrorMessage from '../../components/auth/ErrorMessage';
import Button from '../../components/common/Button'; 

function SwapHistoryPage() {
  const navigate = useNavigate();
  const { getSwaps, getAnalytics, swaps, analytics, isLoading, error } = useSwaps();
  const { isAuthenticated, user } = useAuth();
  const { createPost } = useDiscussions();
  const [showShareCard, setShowShareCard] = useState(null); 

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      getSwaps('completed').catch(() => toast.error('Failed to load swaps'));
      getAnalytics().catch(() => toast.error('Failed to load analytics'));
    }
  }, [isAuthenticated, navigate, getSwaps, getAnalytics]);

  useEffect(() => {
    if (error) {
      toast.error(error || 'Error loading swap history');
    }
    if (analytics?.total_swaps >= 5) {
      toast.success('🎉 Badge Earned: Swapper (5 Swaps)!');
    }
  }, [error, analytics]);

  const handleDiscuss = async (swap) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to discuss');
      navigate('/login');
      return;
    }
    try {
      await createPost({
        content: `Reflecting on swapping ${swap.book_title}! What did you think about it?`,
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
          Swap History
        </motion.h2>
        <motion.p
          className="text-center text-sm text-[#333] font-['Poppins'] mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          View your completed book swaps and analytics.
        </motion.p>

        {/* Swap Analytics */}
        <motion.div
          className="bookish-shadow p-4 bg-white rounded-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h3 className="text-xl font-['Playfair_Display'] text-[#FF6F61] mb-4">
            Swap Analytics
          </h3>
          {isLoading ? (
            <div className="text-center">
              <div className="bookish-spinner mx-auto"></div>
              <p className="text-[#333] font-['Poppins'] mt-2">Loading...</p>
            </div>
          ) : analytics ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-2 bg-[#F5E8C7] rounded bookish-shadow">
                  <p className="text-sm text-[#333] font-['Poppins']">Total Swaps</p>
                  <p className="text-lg font-semibold text-[#FF6F61]">{analytics.total_swaps || 0}</p>
                </div>
                <div className="p-2 bg-[#F5E8C7] rounded bookish-shadow">
                  <p className="text-sm text-[#333] font-['Poppins']">Completed Swaps</p>
                  <p className="text-lg font-semibold text-[#FF6F61]">{analytics.completed_swaps || 0}</p>
                </div>
                <div className="p-2 bg-[#F5E8C7] rounded bookish-shadow">
                  <p className="text-sm text-[#333] font-['Poppins']">Success Rate</p>
                  <p className="text-lg font-semibold text-[#FF6F61]">{(analytics.success_rate || 0).toFixed(1)}%</p>
                </div>
              </div>
              {analytics.swaps_by_month?.length ? (
                <div className="mt-4">
                  {/* TODO: Replace with a chart component such as react-chartjs-2 */}
                  <div className="text-center text-[#333] font-['Poppins']">
                    [Chart displaying swaps per month will appear here.]
                  </div>
                </div>
              ) : (
                <p className="text-[#333] font-['Poppins'] text-center">
                  No monthly swap data available.
                </p>
              )}
            </div>
          ) : (
            <p className="text-[#333] font-['Poppins'] text-center">
              No analytics data available.
            </p>
          )}
        </motion.div>

        {/* Back to Active Swaps */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link
            to="/swaps"
            className="px-4 py-2 font-['Poppins'] text-sm rounded-full bg-[#FF6F61] text-white hover:bg-[#e65a50]"
            aria-label="Back to active swaps"
          >
            Back to Active Swaps
          </Link>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ErrorMessage message={error} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swap List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {isLoading ? (
            <div className="text-center">
              <div className="bookish-spinner mx-auto"></div>
              <p className="text-[#333] font-['Poppins'] mt-2">Loading...</p>
            </div>
          ) : swaps?.length ? (
            <ul className="space-y-6">
              <AnimatePresence>
                {swaps.map((swap, index) => (
                  <motion.li
                    key={swap.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <div className="flex items-center bookish-shadow p-4 bg-white rounded-lg">
                      <img
                        src={swap.book_image || '/assets/book.svg'}
                        alt={swap.book_title}
                        className="w-16 h-24 object-cover rounded mr-4"
                      />
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-[#333] font-['Poppins']">
                          Swap #{swap.id} - {swap.book_title}
                        </p>
                        <p className="text-sm text-gray-600">
                          With: {swap.initiator?.id === user?.id ? swap.recipient?.username : swap.initiator?.username}
                        </p>
                        <p className="text-sm text-gray-600">Status: Completed</p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/swaps/${swap.id}`}>
                          <Button
                            text="View Details"
                            className="bookish-button-enhanced bg-blue-600 hover:bg-blue-700"
                            aria-label={`View details for swap ${swap.id}`}
                          />
                        </Link>
                        <Button
                          text="Discuss"
                          onClick={() => handleDiscuss(swap)}
                          className="bookish-button-enhanced bg-orange-600 hover:bg-orange-700"
                          aria-label={`Discuss book ${swap.book_title}`}
                        />
                        <Button
                          text="Share"
                          onClick={() => handleShare(swap.id)}
                          className="bookish-button-enhanced bg-teal-600 hover:bg-teal-700"
                          aria-label={`Share swap ${swap.id}`}
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
                                With {swap.initiator?.id === user?.id ? swap.recipient?.username : swap.initiator?.username}
                              </Text>
                            </mesh>
                          </Canvas>
                          <Button
                            text="Share on X"
                            onClick={() => console.log('Share to X')}
                            className="mt-2 bg-blue-600 hover:bg-blue-700"
                            aria-label={`Share swap ${swap.id} on X`}
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
              No completed swaps found.
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SwapHistoryPage;