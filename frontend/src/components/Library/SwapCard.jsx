import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useSwaps } from '../../hooks/useSwaps';
import Button from '../Common/Button';
import ErrorMessage from '../Common/ErrorMessage';
import { Link } from 'react-router-dom';

const SwapCard = ({ swap, isReceived, className = '' }) => {
  const { profile } = useAuth();
  const { acceptSwap, rejectSwap, cancelSwap, rateSwap, isLoading } = useSwaps();
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [rating, setRating] = useState(swap.rating || 0);
  const [isRating, setIsRating] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await acceptSwap(swap.id);
    } catch {
      setError('Failed to accept swap.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await rejectSwap(swap.id);
    } catch {
      setError('Failed to reject swap.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    setIsProcessing(true);
    try {
      await cancelSwap(swap.id);
    } catch {
      setError('Failed to cancel swap.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRating = async (value) => {
    if (!profile) {
      setError('Please sign in to rate swaps.');
      return;
    }
    setIsRating(true);
    try {
      await rateSwap(swap.id, value);
      setRating(value);
    } catch {
      setError('Failed to submit rating.');
    } finally {
      setIsRating(false);
    }
  };

  const isOwnSwap = profile?.id === (isReceived ? swap.requester.id : swap.responder.id);

  return (
    <motion.div
      className={`bookish-glass p-6 rounded-xl ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between">
          <div>
            <p className="text-sm font-['Open_Sans'] text-[var(--text)]">
              <strong>{isReceived ? 'Requested' : 'Offered'} Book:</strong>{' '}
              <Link to={`/books/${swap.requested_book.id}`} className="text-[var(--primary)] hover:text-[var(--accent)]">
                {swap.requested_book.title}
              </Link>
            </p>
            <p className="text-sm font-['Open_Sans'] text-[var(--text)]">
              <strong>{isReceived ? 'Offered' : 'Requested'} Book:</strong>{' '}
              <Link to={`/books/${swap.offered_book.id}`} className="text-[var(--primary)] hover:text-[var(--accent)]">
                {swap.offered_book.title}
              </Link>
            </p>
          </div>
          <div>
            <p className="text-sm font-['Open_Sans'] text-[var(--text)]">
              <strong>{isReceived ? 'From' : 'To'}:</strong>{' '}
              <Link
                to={`/profile/${isReceived ? swap.requester.id : swap.responder.id}`}
                className="text-[var(--primary)] hover:text-[var(--accent)]"
              >
                {isReceived ? swap.requester.username : swap.responder.username}
              </Link>
            </p>
            <p className="text-sm font-['Open_Sans'] text-[var(--text)]">
              <strong>Status:</strong>{' '}
              <span className={`capitalize ${swap.status === 'pending' ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
                {swap.status}
              </span>
            </p>
          </div>
        </div>
        {swap.status === 'completed' && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm font-['Open_Sans'] text-[var(--text)]">
              <strong>Your Rating:</strong>
            </p>
            <div className="flex space-x-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => !isOwnSwap && !rating && handleRating(star)}
                  disabled={isRating || rating > 0 || isOwnSwap || isLoading}
                  className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'} ${
                    !isOwnSwap && !rating && !isLoading ? 'hover:text-yellow-500 cursor-pointer' : 'cursor-not-allowed'
                  }`}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
            {isOwnSwap && (
              <p className="text-xs text-[var(--text)] mt-1">You cannot rate your own swap.</p>
            )}
          </motion.div>
        )}
        {error && <ErrorMessage message={error} />}
        {swap.status === 'pending' && (
          <motion.div
            className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {isReceived ? (
              <>
                <Button
                  type="button"
                  text={isProcessing || isLoading ? 'Processing...' : 'Accept'}
                  onClick={handleAccept}
                  disabled={isProcessing || isLoading}
                  className="w-full sm:w-auto bookish-button-enhanced bg-green-600 text-white"
                />
                <Button
                  type="button"
                  text={isProcessing || isLoading ? 'Processing...' : 'Reject'}
                  onClick={handleReject}
                  disabled={isProcessing || isLoading}
                  className="w-full sm:w-auto bookish-button-enhanced bg-red-600 text-white"
                />
              </>
            ) : (
              <Button
                type="button"
                text={isProcessing || isLoading ? 'Processing...' : 'Cancel'}
                onClick={handleCancel}
                disabled={isProcessing || isLoading}
                className="w-full sm:w-auto bookish-button-enhanced bg-gray-600 text-white"
              />
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SwapCard;