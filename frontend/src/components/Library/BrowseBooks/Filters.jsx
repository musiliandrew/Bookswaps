import React from 'react';

const Filters = ({ filters, onFilterChange }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <select
        name="genre"
        value={filters.genre}
        onChange={(e) => onFilterChange(e.target.name, e.target.value)}
        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">All Genres</option>
        <option value="fiction">Fiction</option>
        <option value="non-fiction">Non-Fiction</option>
        <option value="mystery">Mystery</option>
        <option value="sci-fi">Sci-Fi</option>
        <option value="fantasy">Fantasy</option>
      </select>
      <select
        name="available"
        value={filters.available}
        onChange={(e) => onFilterChange(e.target.name, e.target.value)}
        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">All Availability</option>
        <option value="exchange">Available for Exchange</option>
        <option value="borrow">Available for Borrow</option>
        <option value="both">Both</option>
      </select>
      <select
        name="sort"
        value={filters.sort}
        onChange={(e) => onFilterChange(e.target.name, e.target.value)}
        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="title">Sort by Title</option>
        <option value="author">Sort by Author</option>
        <option value="created_at">Sort by Added Date</option>
      </select>
    </div>
  );
};

export default Filters;