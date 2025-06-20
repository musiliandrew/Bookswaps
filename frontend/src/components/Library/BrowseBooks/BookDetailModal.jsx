import React from 'react';
import Modal from '../../Common/Modal';
import { BookmarkIcon, HeartIcon } from '@heroicons/react/24/outline';

const BookDetailModal = ({ isOpen, onClose, book, onBookmark, onFavorite, isBookmarked = false, isFavorited = false }) => {
  if (!book) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={book.title}>
      <div className="space-y-4">
        {book.book_image_url && (
          <img
            src={book.book_image_url}
            alt={book.title}
            className="w-full h-64 object-cover rounded-md"
          />
        )}
        <p><strong>Author:</strong> {book.author}</p>
        <p><strong>Genre:</strong> {book.genre || 'N/A'}</p>
        <p><strong>Synopsis:</strong> {book.synopsis || 'No synopsis available'}</p>
        <p><strong>ISBN:</strong> {book.isbn || 'N/A'}</p>
        <p><strong>Condition:</strong> {book.condition}</p>
        <p><strong>Availability:</strong>
          {book.available_for_exchange && ' Exchange'}
          {book.available_for_borrow && ' Borrow'}
          {!book.available_for_exchange && !book.available_for_borrow && ' Not Available'}
        </p>
        <p><strong>Owner:</strong> {book.user?.username || 'N/A'}</p>
        <p><strong>Original Owner:</strong> {book.original_owner?.username || 'N/A'}</p>
        <p><strong>Copy Count:</strong> {book.copy_count}</p>
        
        {book.history && book.history.length > 0 && (
          <div>
            <h3 className="text-lg font-lora font-semibold text-primary">Recent History</h3>
            <ul className="list-disc pl-5">
              {book.history.map((historyItem) => (
                <li key={historyItem.history_id} className="text-sm">
                  {historyItem.status} by {historyItem.user?.username || 'Anonymous'} on{' '}
                  {new Date(historyItem.start_date).toLocaleDateString()}
                  {historyItem.notes && `: ${historyItem.notes}`}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex space-x-4">
          <button
            onClick={() => onBookmark(book.book_id, isBookmarked)}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              isBookmarked 
                ? 'bg-gray-500 text-white hover:bg-gray-600' 
                : 'bg-primary text-white hover:bg-blue-700'
            }`}
          >
            <BookmarkIcon className="w-5 h-5 mr-2" />
            {isBookmarked ? 'Cancel Bookmark' : 'Bookmark'}
          </button>
          <button
            onClick={() => onFavorite(book.book_id, isFavorited)}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              isFavorited 
                ? 'bg-gray-500 text-white hover:bg-gray-600' 
                : 'bg-error text-white hover:bg-red-600'
            }`}
          >
            <HeartIcon className="w-5 h-5 mr-2" />
            {isFavorited ? 'Cancel Favorite' : 'Favorite'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BookDetailModal;