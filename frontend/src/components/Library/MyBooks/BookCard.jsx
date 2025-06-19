import React from 'react';
import { BookmarkIcon, HeartIcon, TrashIcon } from '@heroicons/react/24/outline';

const BookCard = ({ book, onUpdateAvailability, onRemove, onBookmark, onFavorite, isBookmarked, isFavorited }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col space-y-4">
      {book.book_image_url && (
        <img src={book.book_image_url} alt={book.title} className="w-full h-48 object-cover rounded-md" />
      )}
      <div>
        <h3 className="text-lg font-lora font-semibold text-primary">{book.title}</h3>
        <p className="text-sm text-gray-600">by {book.author}</p>
      </div>
      <div className="flex items-center space-x-2">
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={book.available_for_exchange}
            onChange={(e) =>
              onUpdateAvailability &&
              onUpdateAvailability(book.book_id, { available_for_exchange: e.target.checked })
            }
            className="mr-1"
            disabled={book.locked_until && new Date(book.locked_until) > new Date()}
          />
          Exchange
        </label>
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={book.available_for_borrow}
            onChange={(e) =>
              onUpdateAvailability &&
              onUpdateAvailability(book.book_id, { available_for_borrow: e.target.checked })
            }
            className="mr-1"
            disabled={book.locked_until && new Date(book.locked_until) > new Date()}
          />
          Borrow
        </label>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => onBookmark(book.book_id, isBookmarked)}
            className={`p-2 rounded-full ${isBookmarked ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            <BookmarkIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onFavorite(book.book_id, isFavorited)}
            className={`p-2 rounded-full ${isFavorited ? 'bg-error text-white' : 'bg-gray-200'}`}
          >
            <HeartIcon className="w-5 h-5" />
          </button>
        </div>
        {onRemove && (
          <button
            onClick={() => onRemove(book.book_id)}
            className="p-2 rounded-full bg-error text-white hover:bg-red-600"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default BookCard;