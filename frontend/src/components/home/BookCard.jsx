import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HeartIcon } from '@heroicons/react/24/outline';

function BookCard({ book }) {
  const { bookmarkBook, isAuthenticated } = useAuth();
  const isBookmarked = book.notes?.some(note => note.content === 'bookmark');

  const handleBookmark = () => {
    if (!isAuthenticated) {
      return;
    }
    bookmarkBook(book.discussion_id, !isBookmarked);
  };

  return (
    <div className="bg-[var(--secondary)] p-4 rounded-md shadow bookish-border hover:scale-105 transition-transform">
      <img
        src={book.cover_image || 'https://via.placeholder.com/150'}
        alt={book.title}
        className="w-full h-48 object-cover rounded-md"
      />
      <h3 className="mt-2 text-lg font-semibold text-[var(--primary)]">
        {book.title}
      </h3>
      <p className="text-sm text-gray-600">by {book.author}</p>
      <p className="text-sm text-gray-600">
        Owner: <Link to={`/users/${book.owner_username}`} className="text-[var(--primary)] hover:underline">
          {book.owner_username}
        </Link>
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {book.genres?.length ? (
          book.genres.map((genre) => (
            <span
              key={genre}
              className="bg-[var(--primary)] text-[var(--secondary)] px-2 py-1 rounded-full text-xs"
            >
              {genre}
            </span>
          ))
        ) : (
          <p className="text-sm text-gray-600">No genres</p>
        )}
      </div>
      <button
        onClick={handleBookmark}
        disabled={!isAuthenticated}
        className={`mt-4 flex items-center space-x-1 ${isBookmarked ? 'text-red-500' : 'text-gray-500'} hover:text-red-600 focus:outline-none`}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark book'}
      >
        <HeartIcon className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
        <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
      </button>
    </div>
  );
}

export default BookCard;