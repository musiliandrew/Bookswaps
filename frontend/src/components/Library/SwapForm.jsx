import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSwaps } from '../../hooks/useSwaps';
import { useLibrary } from '../../hooks/useLibrary';
import Input from '../Common/Input';
import Button from '../Common/Button';
import ErrorMessage from '../Common/ErrorMessage';
import { toast } from 'react-toastify';

const SwapForm = ({ bookId, className = '' }) => {
  const { initiateSwap, isLoading, error } = useSwaps();
  const { userLibrary } = useLibrary();
  const [formData, setFormData] = useState({
    requestedBookId: bookId || '',
    offeredBookId: '',
    responderId: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState(error);

  useEffect(() => {
    setServerError(error);
  }, [error]);

  const validateForm = () => {
    const errors = {};
    if (!formData.requestedBookId) errors.requestedBookId = 'Please select a book to request';
    if (!formData.offeredBookId) errors.offeredBookId = 'Please select a book to offer';
    if (!formData.responderId) errors.responderId = 'Please enter the user ID to swap with';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await initiateSwap({
        requested_book: formData.requestedBookId,
        offered_book: formData.offeredBookId,
        responder: formData.responderId,
      });
      toast.success('Swap request sent!');
      setFormData({ requestedBookId: bookId || '', offeredBookId: '', responderId: '' });
    } catch {
      setServerError('Failed to initiate swap. Please try again.');
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`bookish-glass p-6 rounded-xl space-y-6 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
    >
      <motion.h2
        className="text-2xl font-['Lora'] text-gradient"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Initiate Book Swap
      </motion.h2>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Input
          label="Requested Book ID"
          name="requestedBookId"
          type="text"
          value={formData.requestedBookId}
          onChange={handleChange}
          placeholder="Enter book ID to request"
          error={formErrors.requestedBookId}
          disabled={!!bookId}
        />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <label className="block text-sm font-['Lora'] text-[var(--primary)] mb-2">Offered Book</label>
        <select
          name="offeredBookId"
          value={formData.offeredBookId}
          onChange={handleChange}
          className="bookish-input w-full px-4 py-3 rounded-xl font-['Open_Sans'] text-[var(--text)]"
          aria-label="Select book to offer"
        >
          <option value="">Select a book</option>
          {userLibrary.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title}
            </option>
          ))}
        </select>
        {formErrors.offeredBookId && <ErrorMessage message={formErrors.offeredBookId} />}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Input
          label="Responder User ID"
          name="responderId"
          type="text"
          value={formData.responderId}
          onChange={handleChange}
          placeholder="Enter user ID to swap with"
          error={formErrors.responderId}
        />
      </motion.div>
      {serverError && <ErrorMessage message={serverError} />}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Button
          type="submit"
          text={isLoading ? 'Sending...' : 'Send Swap Request'}
          disabled={isLoading || !formData.requestedBookId || !formData.offeredBookId || !formData.responderId}
          className="w-full bookish-button-enhanced"
        />
      </motion.div>
    </motion.form>
  );
};

export default SwapForm;