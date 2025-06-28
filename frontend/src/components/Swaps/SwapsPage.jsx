import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwaps } from '../../hooks/useSwaps';
import { useAuth } from '../../contexts/AuthContext';
import SwapList from './SwapList';
import SwapHistory from './SwapHistory';
import SwapCreationForm from './SwapCreationForm';
import SwapFilters from './SwapFilters';
import { 
  PlusIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const SwapsPage = () => {
  const {
    swaps,
    swapHistory,
    getSwaps,
    getSwapHistory,
    initiateSwap,
    acceptSwap,
    confirmSwap,
    cancelSwap,
    isLoading,
    error,
    pagination
  } = useSwaps();

  const { profile } = useAuth();
  const [activeView, setActiveView] = useState('active'); // 'active', 'history', 'create'
  const [filters, setFilters] = useState({
    status: '',
    type: 'all' // 'sent', 'received', 'all'
  });
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    getSwaps(filters, 1);
  }, [getSwaps, filters]);

  useEffect(() => {
    if (activeView === 'history') {
      getSwapHistory(1);
    }
  }, [activeView, getSwapHistory]);

  const handleCreateSwap = async (swapData) => {
    const result = await initiateSwap(swapData);
    if (result) {
      setShowCreateForm(false);
      toast.success('Swap request sent successfully!');
      getSwaps(filters, 1); // Refresh the list
    }
  };

  const handleAcceptSwap = async (swapId, acceptData = {}) => {
    const result = await acceptSwap(swapId, acceptData);
    if (result) {
      toast.success('Swap accepted!');
      getSwaps(filters, pagination.swaps.page);
    }
  };

  const handleConfirmSwap = async (swapId, qrData) => {
    const result = await confirmSwap(swapId, qrData);
    if (result) {
      toast.success('Swap confirmed!');
      getSwaps(filters, pagination.swaps.page);
    }
  };

  const handleCancelSwap = async (swapId) => {
    if (window.confirm('Are you sure you want to cancel this swap?')) {
      const result = await cancelSwap(swapId);
      if (result) {
        toast.success('Swap cancelled');
        getSwaps(filters, pagination.swaps.page);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Requested':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'Accepted':
        return <CheckCircleIcon className="w-5 h-5 text-blue-500" />;
      case 'Confirmed':
        return <QrCodeIcon className="w-5 h-5 text-green-500" />;
      case 'Completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'Cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ArrowPathIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Requested':
        return 'bg-yellow-100 text-yellow-800';
      case 'Accepted':
        return 'bg-blue-100 text-blue-800';
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-green-200 text-green-900';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSwaps = swaps.filter(swap => {
    if (filters.type === 'sent') {
      return swap.initiator?.user_id === profile?.user?.id;
    } else if (filters.type === 'received') {
      return swap.receiver?.user_id === profile?.user?.id;
    }
    return true; // 'all'
  });

  if (error) {
    return (
      <motion.div
        className="text-center py-20"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="text-6xl mb-4">😔</div>
        <p className="text-xl font-semibold text-red-600 mb-4">{error}</p>
        <motion.button
          onClick={() => getSwaps(filters, 1)}
          className="bookish-button-enhanced px-6 py-3 text-white rounded-xl font-semibold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          Try Again
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Enhanced Header */}
      <motion.div
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 bookish-glass rounded-2xl border border-white/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl">
            <ArrowPathIcon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-lora font-bold text-primary">Book Swaps</h2>
            <p className="text-primary/70 mt-1 text-lg">
              Exchange books with other readers in your community
            </p>
          </div>
        </div>

        <motion.button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
            showCreateForm
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
              : 'bookish-button-enhanced text-white'
          }`}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <PlusIcon className={`w-5 h-5 transition-transform duration-300 ${showCreateForm ? 'rotate-45' : ''}`} />
          {showCreateForm ? 'Cancel' : 'Propose Swap'}
        </motion.button>
      </motion.div>

      {/* Enhanced View Toggle */}
      <motion.div
        className="flex gap-1 p-2 bookish-glass rounded-2xl border border-white/20 backdrop-blur-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {[
          { id: 'active', label: 'Active Swaps', icon: '🔄', description: 'Ongoing exchanges' },
          { id: 'history', label: 'History', icon: '📚', description: 'Past swaps' }
        ].map((view, index) => (
          <motion.button
            key={view.id}
            onClick={() => setActiveView(view.id)}
            className={`relative flex-1 flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 font-medium ${
              activeView === view.id
                ? 'text-white shadow-lg'
                : 'text-primary/70 hover:text-primary hover:bg-white/10'
            }`}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
          >
            {/* Active Background */}
            {activeView === view.id && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl"
                layoutId="activeSwapView"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}

            {/* Content */}
            <div className="relative z-10 flex items-center gap-3">
              <span className="text-xl">{view.icon}</span>
              <div className="text-left">
                <div className="text-sm font-semibold">{view.label}</div>
                <div className={`text-xs transition-all duration-300 ${
                  activeView === view.id ? 'text-white/80' : 'text-primary/50'
                }`}>
                  {view.description}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Enhanced Create Swap Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bookish-glass p-8 rounded-2xl border border-white/20"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl">
                <PlusIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-lora font-bold text-primary">
                  Propose a Book Swap
                </h3>
                <p className="text-sm text-primary/70">Connect with fellow readers and exchange books</p>
              </div>
            </div>
            <SwapCreationForm
              onSubmit={handleCreateSwap}
              onCancel={() => setShowCreateForm(false)}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      {activeView === 'active' && (
        <SwapFilters
          filters={filters}
          setFilters={setFilters}
          onRefresh={() => getSwaps(filters, 1)}
        />
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeView === 'active' ? (
            <SwapList
              swaps={filteredSwaps}
              isLoading={isLoading}
              pagination={pagination.swaps}
              onAccept={handleAcceptSwap}
              onConfirm={handleConfirmSwap}
              onCancel={handleCancelSwap}
              onLoadMore={(page) => getSwaps(filters, page)}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
              currentUserId={profile?.user?.id}
            />
          ) : (
            <SwapHistory
              swapHistory={swapHistory}
              isLoading={isLoading}
              pagination={pagination.history}
              onLoadMore={(page) => getSwapHistory(page)}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
              currentUserId={profile?.user?.id}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default SwapsPage;
