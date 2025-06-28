import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckCircleIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const AcceptSwapModal = ({ 
  isOpen, 
  onClose, 
  onAccept, 
  swap, 
  isLoading = false 
}) => {
  const [acceptData, setAcceptData] = useState({
    meetup_location_id: '',
    meetup_time: ''
  });
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty values
    const data = {};
    if (acceptData.meetup_location_id) {
      data.meetup_location_id = acceptData.meetup_location_id;
    }
    if (acceptData.meetup_time) {
      data.meetup_time = acceptData.meetup_time;
    }
    
    onAccept(swap.swap_id, data);
  };

  const handleQuickAccept = () => {
    // Accept without optional details
    onAccept(swap.swap_id, {});
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format for datetime-local input
  };

  const validateMeetupTime = (timeString) => {
    if (!timeString) return true;
    const selectedTime = new Date(timeString);
    const now = new Date();
    return selectedTime > now;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bookish-glass bookish-shadow rounded-2xl p-6 w-full max-w-md"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-['Lora'] text-[var(--primary)]">
                  Accept Swap
                </h3>
                <p className="text-sm text-[var(--text)] font-['Open_Sans']">
                  Confirm this book exchange
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--text)] hover:text-[var(--primary)] transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Swap Details */}
          <div className="mb-6 p-4 bg-[var(--primary)]/5 rounded-lg">
            <h4 className="font-medium text-[var(--primary)] mb-2 font-['Lora']">
              Swap Details
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-[var(--text)] font-['Open_Sans']">From: </span>
                <span className="font-medium text-[var(--primary)]">
                  {swap?.initiator?.username}
                </span>
              </div>
              <div>
                <span className="text-[var(--text)] font-['Open_Sans']">Book: </span>
                <span className="font-medium text-[var(--primary)]">
                  {swap?.initiator_book?.title}
                </span>
              </div>
              {swap?.receiver_book && (
                <div>
                  <span className="text-[var(--text)] font-['Open_Sans']">For: </span>
                  <span className="font-medium text-[var(--primary)]">
                    {swap?.receiver_book?.title}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Accept */}
          <div className="mb-4">
            <button
              onClick={handleQuickAccept}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium font-['Open_Sans'] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Accepting...' : 'Accept Swap'}
            </button>
          </div>

          {/* Optional Details Toggle */}
          <div className="text-center mb-4">
            <button
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="text-[var(--accent)] hover:text-[var(--primary)] text-sm font-['Open_Sans'] underline"
            >
              {showOptionalFields ? 'Hide' : 'Add'} meetup details (optional)
            </button>
          </div>

          {/* Optional Meetup Details */}
          <AnimatePresence>
            {showOptionalFields && (
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[var(--primary)] mb-2 font-['Open_Sans']">
                    <MapPinIcon className="w-4 h-4" />
                    Meetup Location
                  </label>
                  <select
                    value={acceptData.meetup_location_id}
                    onChange={(e) => setAcceptData(prev => ({ ...prev, meetup_location_id: e.target.value }))}
                    className="w-full p-3 border border-[var(--primary)]/20 rounded-lg focus:border-[var(--accent)] transition-colors font-['Open_Sans']"
                  >
                    <option value="">Select a location (optional)</option>
                    {/* TODO: Load actual locations from API */}
                    <option value="library">Local Library</option>
                    <option value="cafe">Coffee Shop</option>
                    <option value="park">Public Park</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[var(--primary)] mb-2 font-['Open_Sans']">
                    <ClockIcon className="w-4 h-4" />
                    Meetup Time
                  </label>
                  <input
                    type="datetime-local"
                    value={acceptData.meetup_time}
                    onChange={(e) => setAcceptData(prev => ({ ...prev, meetup_time: e.target.value }))}
                    min={formatDateTime(new Date())}
                    className="w-full p-3 border border-[var(--primary)]/20 rounded-lg focus:border-[var(--accent)] transition-colors font-['Open_Sans']"
                  />
                  {acceptData.meetup_time && !validateMeetupTime(acceptData.meetup_time) && (
                    <p className="text-red-500 text-xs mt-1 font-['Open_Sans']">
                      Meetup time must be in the future
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOptionalFields(false)}
                    className="flex-1 bg-gray-200 text-[var(--primary)] px-4 py-2 rounded-lg font-medium font-['Open_Sans'] hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || (acceptData.meetup_time && !validateMeetupTime(acceptData.meetup_time))}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium font-['Open_Sans'] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Accepting...' : 'Accept with Details'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 font-['Open_Sans']">
              💡 You can accept now and arrange meetup details later through chat or notifications.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AcceptSwapModal;
