import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SearchBar = ({ searchQuery, onSearch }) => {
  return (
    <div className="relative mb-6">
      <input
        type="text"
        placeholder="Search by title, author, or ISBN..."
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full px-4 py-3 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3.5 text-gray-500" />
    </div>
  );
};

export default SearchBar;