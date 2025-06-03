import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { useAuth } from '../../hooks/useAuth';
import { useLibrary } from '../../hooks/useLibrary';
import { useSwaps } from '../../hooks/useSwaps';
import { useUsers } from '../../hooks/useUsers';
import { useDiscussions } from '../../hooks/useDiscussions';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import UserSearchForm from '../../components/users/UserSearchForm'; 

const BookDetailsPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, bookmarkBook, profile } = useAuth();
  const { getBook, favoriteBook, book, isLoading: libraryLoading, error: libraryError } = useLibrary();
  const { initiateSwap, isLoading: swapLoading, error: swapError } = useSwaps();
  const { searchUsers, users } = useUsers();
  const { createPost } = useDiscussions();
  const [showSwapForm, setShowSwapForm] = useState(false);
  const [swapData, setSwapData] = useState({
    initiator_book_id: bookId,
    receiver_id: '',
    receiver_book_id: '',
  });
  const [bookIdError, setBookIdError] = useState('');
  const [showShareCard, setShowShareCard] = useState(false);

  useEffect(() => {
    if (bookId) {
      try {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(bookId)) {
          throw new Error('Invalid book ID format');
        }
        getBook(bookId);
      } catch {
        toast.error('Invalid book ID');
        navigate('/library');
      }
    }
  }, [bookId, getBook, navigate]);

  useEffect(() => {
    if (libraryError) toast.error(libraryError || 'Failed to load book details');
    if (swapError) toast.error(swapError?.response?.data?.detail || swapError || 'Failed to initiate swap');
  }, [libraryError, swapError]);

  const validateAuth = () => {
    if (!isAuthenticated || !localStorage.getItem('access_token')) {
      toast.error('Please sign in to perform this action');
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleBookmark = async () => {
    if (!validateAuth()) return;
    try {
      await bookmarkBook(bookId, !book?.is_bookmarked);
      toast.success(book?.is_bookmarked ? 'Bookmark removed' : 'Book bookmarked');
      if (!book?.is_bookmarked && profile?.bookmarks_count >= 5) {
        toast.success('🎉 Badge Earned: Bookworm (5 Bookmarks)!');
      }
    } catch (err) {
      console.error('Bookmark error:', err);
      toast.error('Failed to update bookmark');
    }
  };

  const handleFavorite = async () => {
    if (!validateAuth()) return;
    try {
      await favoriteBook(bookId, !book?.is_favorited);
      toast.success(book?.is_favorited ? 'Favorite removed' : 'Book favorited');
    } catch (err) {
      console.error('Favorite error:', err);
      toast.error('Failed to update favorite');
    }
  };

  const handleDiscuss = async () => {
    if (!validateAuth()) return;
    try {
      await createPost({
        content: `Just finished reading ${book.title}! What did you think about it?`,
        book_id: bookId,
      });
      toast.success('Discussion posted!');
      navigate('/discussions');
    } catch (err) {
      console.error('Discuss error:', err);
      toast.error('Failed to create discussion');
    }
  };

  const validateBookId = (value) => {
    if (!value) {
      setBookIdError('');
      return true;
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      setBookIdError('Invalid book ID format');
      return false;
    }
    setBookIdError('');
    return true;
  };

  const handleSwapSubmit = async (e) => {
    e.preventDefault();
    if (!validateAuth()) return;
    if (!swapData.receiver_id) {
      toast.error('Please select a user to swap with');
      return;
    }
    if (swapData.receiver_book_id && !validateBookId(swapData.receiver_book_id)) {
      return;
    }
    try {
      const response = await initiateSwap(swapData);
      if (response) {
        toast.success('Swap request sent!');
        setSwapData({ initiator_book_id: bookId, receiver_id: '', receiver_book_id: '' });
        setBookIdError('');
        setShowSwapForm(false);
        setTimeout(() => navigate('/swaps'), 1000);
      }
    } catch (err) {
      console.error('Swap error:', err);
    }
  };

  const handleUserSearch = async (formData) => {
    try {
      await searchUsers({ username: formData.username, genres: formData.genres });
    } catch (err) {
      console.error('Search error:', err);
      toast.error('Failed to search users');
    }
  };

  const handleUserSelect = (user) => {
    setSwapData((prev) => ({ ...prev, receiver_id: user.user_id }));
  };

  const handleBookIdChange = (e) => {
    const value = e.target.value;
    setSwapData((prev) => ({ ...prev, receiver_book_id: value }));
    validateBookId(value);
  };

  const handleShare = () => {
    setShowShareCard(true);
  };

  if (libraryLoading) return <div className="text-center p-4">Loading book details...</div>;
  if (!book) return <div className="text-center p-4 text-red-500">Book not found</div>;

  return (
    <motion.div
      className="container mx-auto p-4 max-w-3xl bookish-gradient"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-4 font-['Open_Sans']">{book.title}</h1>
      <motion.div
        className="flex flex-col md:flex-row gap-6"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={book.cover_image || '/assets/book.svg'}
          alt={book.title}
          className="w-48 h-64 object-cover rounded-lg shadow-md"
        />
        <div className="flex-1">
          <p className="mb-2"><strong>Author:</strong> {book.author || 'Unknown'}</p>
          <p className="mb-2"><strong>ISBN:</strong> {book.isbn || 'N/A'}</p>
          <p className="mb-2"><strong>Genre:</strong> {book.genres?.join(', ') || 'N/A'}</p>
          <p className="mb-4"><strong>Owner:</strong> {book.owner?.username || 'Unknown'}</p>
          <div className="flex flex-wrap gap-4">
            <Button
              text={book.is_bookmarked ? 'Remove Bookmark' : 'Bookmark'}
              onClick={handleBookmark}
              className="bg-blue-600 hover:bg-blue-700"
            />
            <Button
              text={book.is_favorited ? 'Remove Favorite' : 'Favorite'}
              onClick={handleFavorite}
              className="bg-green-600 hover:bg-green-700"
            />
            <Button
              text="Request Swap"
              onClick={() => setShowSwapForm(!showSwapForm)}
              className="bg-purple-600 hover:bg-purple-700"
            />
            <Button
              text="Discuss"
              onClick={handleDiscuss}
              className="bg-orange-600 hover:bg-orange-700"
            />
            <Button
              text="Share"
              onClick={handleShare}
              className="bg-teal-600"
            />
            <Button
              href="/swaps"
              onClick={handleShare}
              className="bg-teal-600 hover:bg-teal-700"
            />
          </div>
        </div>
      </motion.div>

      {showSwapForm && (
        <form
          onSubmit={handleSwapSubmit}
          className="mt-8 bg-white p-6 rounded-lg shadow bookish-shadow"
          aria-labelledby="swap-form-heading"
        >
          <h2 id="heading" className="text-xl font-semibold mb-4 font-['Open_Sans']">
            Request Swap
          </h2>
          <UserSearchForm onSubmit={handleUserSearch} />
          <div className="mt-4">
            {users?.length > 0 && (
              <ul className="space-y-2">
                {users.map((user) => (
                  <li
                    key={user.user_id}
                    onClick={() => handleUserSelect(user)}
                    className="p-2 border rounded cursor-pointer hover:bg-gray-100"
                  >
                    {user.username}
                  </li>
                ))}
              </ul>
            )}
          </div>
            <Input
              label="Your Book"
              name="receiver_book_id"
              type="text"
              value={swapData.receiver_book_id}
              onChange={handleBookIdChange}
              placeholder="Enter book ID"
              className="mb-4"
              error={bookIdError}
              aria-describedby="receiver_book_id-help"
            />
            <p id="receiver_book_id-help" className="text-sm text-gray-600 mb-4">
              Enter the ID of the book you’re offering, if applicable.
            </p>
            <button
              type="submit"
              text="Send Swap"
              disabled={!swapData.receiver_id || swapLoading || !!bookIdError}
              isLoading={swapLoading}
              className="bg-indigo-600"
            />
          </form>
        )}

      {showShareCard && (
        <motion.div
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-8"
        >
          <div className="h-64 w-full">
            <Canvas>
              <ambientLight />
              <OrbitControls />
              <mesh>
                <boxGeometry args={[3, 2, 0.1]} />
                <meshStandardMaterial color="#FF6F61" />
                <Text position={[0, 0.5, 0.1]} fontSize={0.2}>
                  {book.title}
                </Text>
                <Text position={[0, 0, 0.1]} fontSize={0.15} color="white">
                  By {book.author}
                </Text>
              </mesh>
            </Canvas>
            <button
              onClick={() => console.log('Share to X')}
              className="mt-2 px-4 py-2 bg-blue-600 rounded"
            >
              Share on X
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BookDetailsPage;