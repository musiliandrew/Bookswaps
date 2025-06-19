import React from 'react';
import Modal from '../../Common/Modal';

const AddBookModal = ({ isOpen, onClose, newBook, setNewBook, onAddBook }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Book">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={newBook.title}
          onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="Author"
          value={newBook.author}
          onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="Genre"
          value={newBook.genre}
          onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="ISBN"
          value={newBook.isbn}
          onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={newBook.condition}
          onChange={(e) => setNewBook({ ...newBook, condition: e.target.value })}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="new">New</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
        <textarea
          placeholder="Synopsis"
          value={newBook.synopsis}
          onChange={(e) => setNewBook({ ...newBook, synopsis: e.target.value })}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="number"
          placeholder="Year"
          value={newBook.year}
          onChange={(e) => setNewBook({ ...newBook, year: e.target.value })}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="url"
          placeholder="Cover Image URL"
          value={newBook.cover_image_url}
          onChange={(e) => setNewBook({ ...newBook, cover_image_url: e.target.value })}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={newBook.available_for_exchange}
              onChange={(e) => setNewBook({ ...newBook, available_for_exchange: e.target.checked })}
              className="mr-2"
            />
            Available for Exchange
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={newBook.available_for_borrow}
              onChange={(e) => setNewBook({ ...newBook, available_for_borrow: e.target.checked })}
              className="mr-2"
            />
            Available for Borrow
          </label>
        </div>
        <button
          onClick={onAddBook}
          className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700"
        >
          Add Book
        </button>
      </div>
    </Modal>
  );
};

export default AddBookModal;