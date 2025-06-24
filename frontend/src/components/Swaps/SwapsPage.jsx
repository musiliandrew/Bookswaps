import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwaps } from '../../hooks/useSwaps';
import { useAuth } from '../../hooks/useAuth';
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

  const handleAcceptSwap = async (swapId) => {
    const result = await acceptSwap(swapId);
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
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => getSwaps(filters, 1)}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Book Swaps</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Exchange books with other readers in your community
          </p>
        </div>
        
        <motion.button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PlusIcon className="w-4 h-4" />
          {showCreateForm ? 'Cancel' : 'Propose Swap'}
        </motion.button>
      </div>

      {/* View Toggle */}
      <div className="flex bg-[var(--secondary)] rounded-lg p-1">
        {[
          { id: 'active', label: 'Active Swaps' },
          { id: 'history', label: 'History' }
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id)}
            className={`flex-1 px-4 py-2 text-sm rounded-md transition-colors ${
              activeView === view.id 
                ? 'bg-[var(--accent)] text-white' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Create Swap Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--secondary)]"
          >
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Propose a Book Swap
            </h3>
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
