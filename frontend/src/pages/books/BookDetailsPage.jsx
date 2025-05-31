import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { useLibrary } from '../hooks/useLibrary';
import { useSwaps } from '../hooks/useSwaps';
import { Button, Input } from '../components/common';
import { UserSearchForm } from '../components/users';

const BookDetailsPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, bookmarkBook } = useAuth();
  const { getBook, favoriteBook, book, isLoading, error } = useLibrary();
  const { initiateSwap } = useSwaps();
  const [showSwapForm, setShowSwapForm] = useState(false);
  const [swapData, setSwapData] = useState({
    initiator_book_id: bookId,
    receiver_id: '',
    receiver_book_id: '',
  });

  useEffect(() => {
    if (bookId) {
      getBook(bookId);
    }
  }, [bookId, getBook]);

  const handleBookmark = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to bookmark');
      navigate('/login');
      return;
    }
    bookmarkBook(bookId, !book?.is_bookmarked);
  };

  const handleFavorite = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to favorite');
      navigate('/login');
      return;
    }
    favoriteBook(bookId, !book?.is_favorited);
  };

  const handleSwapSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to request a swap');
      navigate('/login');
      return;
    }
    const response = await initiateSwap(swapData);
    if (response) {
      setShowSwapForm(false);
      navigate('/swaps');
    }
  };

  const handleUserSelect = (user) => {
    setSwapData((prev) => ({ ...prev, receiver_id: user.user_id }));
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!book) return <div>Book not found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
      <img src={book.cover_image || '/book.svg'} alt={book.title} className="w-48 h-64 object-cover mb-4" />
      <p><strong>Author:</strong> {book.author}</p>
      <p><strong>ISBN:</strong> {book.isbn || 'N/A'}</p>
      <p><strong>Genre:</strong> {book.genres?.join(', ') || 'N/A'}</p>
      <p><strong>Owner:</strong> {book.owner?.username}</p>
      <div className="flex space-x-4 mt-4">
        <Button onClick={handleBookmark}>
          {book.is_bookmarked ? 'Remove Bookmark' : 'Bookmark'}
        </Button>
        <Button onClick={handleFavorite}>
          {book.is_favorited ? 'Remove Favorite' : 'Favorite'}
        </Button>
        <Button onClick={() => setShowSwapForm(!showSwapForm)}>
          Request Swap
        </Button>
      </div>

      {showSwapForm && (
        <form onSubmit={handleSwapSubmit} className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Request Swap</h2>
          <UserSearchForm onSelect={handleUserSelect} />
          <Input
            label="Your Book ID (optional)"
            value={swapData.receiver_book_id}
            onChange={(e) => setSwapData(prev => ({ ...prev, receiver_book_id: e.target.value }))}
            placeholder="Enter book ID"
          />
          <Button type="submit" disabled={!swapData.receiver_id}>
            Send Swap Request
          </Button>
        </form>
      )}
    </div>
  );
};

export default BookDetailsPage;