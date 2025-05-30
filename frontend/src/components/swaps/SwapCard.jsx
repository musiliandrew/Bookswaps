import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import ErrorMessage from '../auth/ErrorMessage';
import { Link } from 'react-router-dom';

function SwapCard({ swap, isReceived }) {
  const { acceptSwap, rejectSwap, cancelSwap } = useAuth();
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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

  return (
    <motion.div
      className="bookish-glass bookish-shadow p-6 rounded-2xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
    >
      <div className="space-y-4">
        {/* Swap Details */}
        <div className="flex flex-col sm:flex-row justify-between">
          <div>
            <p className="text-sm font-['Poppins'] text-[#333]">
              <strong>{isReceived ? 'Requested' : 'Offered'} Book:</strong>{' '}
              <Link
                to={`/books/${swap.requested_book.id}`}
                className="text-[#333] hover:text-[#FFA726]"
              >
                {swap.requested_book.title}
              </Link>
            </p>
            <p className="text-sm font-['Poppins'] text-[#333]">
              <strong>{isReceived ? 'Offered' : 'Requested'} Book:</strong>{' '}
              <Link
                to={`/books/${swap.offered_book.id}`}
                className="text-[#333] hover:text-[#FFA726]"
              >
                {swap.offered_book.title}
              </Link>
            </p>
          </div>
          <div>
            <p className="text-sm font-['Poppins'] text-[#333]">
              <strong>{isReceived ? 'From' : 'To'}:</strong>{' '}
              <Link
                to={`/profile/${isReceived ? swap.requester.id : swap.responder.id}`}
                className="text-[#333] hover:text-[#FFA726]"
              >
                {isReceived ? swap.requester.username : swap.responder.username}
              </Link>
            </p>
            <p className="text-sm font-['Poppins'] text-[#333]">
              <strong>Status:</strong>{' '}
              <span className={`capitalize ${swap.status === 'pending' ? 'text-[#FF6F61]' : 'text-[#333]'}`}>
                {swap.status}
              </span>
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ErrorMessage message={error} />
          </motion.div>
        )}

        {/* Actions */}
        {swap.status === 'pending' && (
          <motion.div
            className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {isReceived ? (
              <>
                <Button
                  type="button"
                  text={isProcessing ? 'Processing...' : 'Accept'}
                  onClick={handleAccept}
                  disabled={isProcessing}
                  className="w-full sm:w-auto bookish-button-enhanced bg-[#FF6F61] text-white"
                  aria-label={`Accept swap request for ${swap.requested_book.title}`}
                />
                <Button
                  type="button"
                  text={isProcessing ? 'Processing...' : 'Reject'}
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="w-full sm:w-auto bookish-button-enhanced bg-[#D32F2F] text-white"
                  aria-label={`Reject swap request for ${swap.requested_book.title}`}
                />
              </>
            ) : (
              <Button
                type="button"
                text={isProcessing ? 'Processing...' : 'Cancel'}
                onClick={handleCancel}
                disabled={isProcessing}
                className="w-full sm:w-auto bookish-button-enhanced bg-[#B0B0B0] text-white"
                aria-label={`Cancel swap request for ${swap.offered_book.title}`}
              />
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default SwapCard;