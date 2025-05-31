import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwaps } from '../../hooks/useSwaps';
import { useAuth } from '../../hooks/useAuth';
import SwapCard from '../../components/swaps/SwapCard';
import ErrorMessage from '../../components/auth/ErrorMessage';
import { Button } from '../../components/common';

function SwapFeedPage() {
  const navigate = useNavigate();
  const { getSwaps, swaps, error, isLoading } = useSwaps();
  const { user, isAuthenticated } = useAuth();
  const [globalError, setGlobalError] = useState('');
  const [activeTab, setActiveTab] = useState('received');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      getSwaps().catch(() => setGlobalError('Failed to load swaps.'));
    }
  }, [isAuthenticated, navigate, getSwaps]);

  const filteredSwaps = swaps?.filter((swap) =>
    activeTab === 'received'
      ? swap.recipient?.id === user?.id
      : swap.initiator?.id === user?.id
  );

  return (
    <div className="min-h-screen bg-[#F5E8C7] py-12 px-4 sm:px-6 lg:px-8">
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
                      <Link to={`/swaps/${swap.id}`}>
                        <Button className="bookish-button-enhanced">View Details</Button>
                      </Link>
                    </div>
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