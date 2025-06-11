import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import BookmarkButton from './BookmarkButton';
import FavoriteButton from './FavoriteButton';
import GenreTag from '../Common/GenreTag';
import Button from '../Common/Button';
import { BookIcon } from '@heroicons/react/24/outline';

const BookCard = ({ book, className = '' }) => {
  return (
    <motion.div
      className={`bookish-glass p-4 rounded-xl max-w-xs mx-auto ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex items-center space-x-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="w-16 h-24 rounded-md overflow-hidden border-2 border-[var(--accent)]">
          {book.cover_image ? (
            <img src={book.cover_image} alt={`${book.title} cover`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[var(--secondary)] flex items-center justify-center">
              <BookIcon className="w-8 h-8 text-[var(--text)]" />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-['Lora'] text-[var(--primary)] truncate">{book.title}</h3>
          <p className="text-sm text-[var(--text)] font-['Open_Sans']">{book.author || 'Unknown Author'}</p>
        </div>
      </motion.div>
      <motion.div
        className="mt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label className="block text-sm font-['Lora'] text-[var(--primary)]">Genres</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {book.genres?.length ? (
            book.genres.map((genre) => <GenreTag key={genre} genre={genre} />)
          ) : (
            <p className="text-sm text-[var(--text)] font-['Open_Sans']">No genres</p>
          )}
        </div>
      </motion.div>
      <motion.div
        className="mt-4 flex space-x-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <BookmarkButton bookId={book.id} isBookmarked={book.is_bookmarked} />
        <FavoriteButton bookId={book.id} isFavorited={book.is_favorited} />
        <Link to={`/swap/${book.id}`}>
          <Button text="Swap" className="bookish-button-enhanced bg-[var(--accent)] text-white" />
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default BookCard;