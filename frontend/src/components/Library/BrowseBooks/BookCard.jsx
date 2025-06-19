import React from 'react';
import { BookmarkIcon, HeartIcon } from '@heroicons/react/24/outline';

const BookCard = ({ book, onClick, onBookmark, onFavorite, isBookmarked, isFavorited }) => {
  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 flex flex-col space-y-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      {book.book_image_url && (
        <img src={book.book_image_url} alt={book.title} className="w-full h-48 object-cover rounded-md" />
      )}
      <div>
        <h3 className="text-lg font-lora font-semibold text-primary">{book.title}</h3>
        <p className="text-sm text-gray-600">by {book.author}</p>
        <p className="text-sm text-gray-500">{book.genre || 'N/A'}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {book.available_for_exchange && (
          <span className="px-2 py-1 bg-success text-white text-xs rounded">Exchange</span>
        )}
        {book.available_for_borrow && (
          <span className="px-2 py-1 bg-accent text-white text-xs rounded">Borrow</span>
        )}
        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">{book.condition}</span>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmark(book.book_id, isBookmarked);
            }}
            className={`p-2 rounded-full ${isBookmarked ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            <BookmarkIcon className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(book.book_id, isFavorited);
            }}
            className={`p-2 rounded-full ${isFavorited ? 'bg-error text-white' : 'bg-gray-200'}`}
          >
            <HeartIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600">Owner: {book.user?.username || 'N/A'}</p>
      </div>
    </div>
  );
};

export default BookCard;