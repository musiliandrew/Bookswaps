import { useState } from 'react';
import BookCard from './BookCard';

export default function BookShowcase({ isAuthenticated, userGenres, filters = {}, onFilterChange }) {
  // Mock data for books
  const [books] = useState([
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      coverImage: "/api/placeholder/240/360",
      genres: ["Fiction", "Classics"],
      availableForSwap: true,
      availableForBorrow: false,
      owner: { username: "bookworm42", city: "Seattle" }
    },
    {
      id: 2,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      coverImage: "/api/placeholder/240/360",
      genres: ["Fiction", "Classics"],
      availableForSwap: true,
      availableForBorrow: true,
      owner: { username: "readingrainbow", city: "Portland" }
    },
    {
      id: 3,
      title: "1984",
      author: "George Orwell",
      coverImage: "/api/placeholder/240/360",
      genres: ["Fiction", "Dystopian"],
      availableForSwap: false,
      availableForBorrow: true,
      owner: { username: "literati99", city: "Boston" }
    },
    {
      id: 4,
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      coverImage: "/api/placeholder/240/360",
      genres: ["Fantasy", "Adventure"],
      availableForSwap: true,
      availableForBorrow: false,
      owner: { username: "middleearth", city: "Chicago" }
    },
    {
      id: 5,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      coverImage: "/api/placeholder/240/360",
      genres: ["Fiction", "Romance", "Classics"],
      availableForSwap: true,
      availableForBorrow: true,
      owner: { username: "janeite", city: "New York" }
    },
    {
      id: 6,
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      coverImage: "/api/placeholder/240/360",
      genres: ["Fiction", "Coming of Age"],
      availableForSwap: false,
      availableForBorrow: true,
      owner: { username: "phonyphobe", city: "Seattle" }
    },
    {
      id: 7,
      title: "The Alchemist",
      author: "Paulo Coelho",
      coverImage: "/api/placeholder/240/360",
      genres: ["Fiction", "Fantasy", "Philosophy"],
      availableForSwap: true,
      availableForBorrow: false,
      owner: { username: "dreamchaser", city: "Portland" }
    },
    {
      id: 8,
      title: "Harry Potter and the Sorcerer's Stone",
      author: "J.K. Rowling",
      coverImage: "/api/placeholder/240/360",
      genres: ["Fantasy", "Young Adult"],
      availableForSwap: true,
      availableForBorrow: true,
      owner: { username: "wizardry101", city: "Boston" }
    }
  ]);

  // Mock available filters
  const availableGenres = ["Fiction", "Fantasy", "Classics", "Romance", "Dystopian", "Adventure", "Young Adult", "Philosophy", "Coming of Age"];
  const availableCities = ["Seattle", "Portland", "Boston", "Chicago", "New York"];

  // State for local filters
  const [localFilters, setLocalFilters] = useState({
    genre: filters.genre || "",
    availability: filters.availability || "all",
    city: filters.city || "",
    page: 1,
    ...filters
  });

  // Filter change handler
  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value, page: 1 };
    setLocalFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  // Filter books based on current filters
  const filteredBooks = books.filter(book => {
    // Genre filter
    if (localFilters.genre && !book.genres.includes(localFilters.genre)) {
      return false;
    }
    
    // Availability filter
    if (localFilters.availability === "swap" && !book.availableForSwap) {
      return false;
    }
    if (localFilters.availability === "borrow" && !book.availableForBorrow) {
      return false;
    }
    
    // City filter
    if (localFilters.city && book.owner.city !== localFilters.city) {
      return false;
    }
    
    return true;
  });

  // Pagination functionality
  const booksPerPage = 4;
  const startIndex = (localFilters.page - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    handleFilterChange("page", newPage);
  };

  return (
    <section id="book-library" className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-brown-800 mb-8">
          {isAuthenticated && userGenres?.length ? "Books You Might Like" : "Discover Books"}
        </h2>
        
        {/* Filters Section */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow flex flex-wrap gap-4">
          {/* Genre Filter */}
          <div className="flex-1 min-w-fit">
            <label className="block text-sm font-medium text-brown-600 mb-1">Genre</label>
            <select
              value={localFilters.genre}
              onChange={(e) => handleFilterChange("genre", e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3"
            >
              <option value="">All Genres</option>
              {availableGenres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
          
          {/* Availability Filter */}
          <div className="flex-1 min-w-fit">
            <label className="block text-sm font-medium text-brown-600 mb-1">Availability</label>
            <select
              value={localFilters.availability}
              onChange={(e) => handleFilterChange("availability", e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3"
            >
              <option value="all">All Books</option>
              <option value="swap">Available for Swap</option>
              <option value="borrow">Available for Borrow</option>
            </select>
          </div>
          
          {/* City Filter */}
          <div className="flex-1 min-w-fit">
            <label className="block text-sm font-medium text-brown-600 mb-1">City</label>
            <select
              value={localFilters.city}
              onChange={(e) => handleFilterChange("city", e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3"
            >
              <option value="">All Cities</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          
          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={() => {
                const resetFilters = {
                  genre: "",
                  availability: "all",
                  city: "",
                  page: 1
                };
                setLocalFilters(resetFilters);
                if (onFilterChange) {
                  onFilterChange(resetFilters);
                }
              }}
              className="bg-gray-200 hover:bg-gray-300 text-brown-800 py-2 px-4 rounded"
            >
              Clear Filters
            </button>
          </div>
        </div>
        
        {/* Books Grid */}
        {paginatedBooks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedBooks.map((book) => (
                <BookCard
                  key={book.id}
                  bookData={book}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>
            
            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(localFilters.page - 1)}
                  disabled={localFilters.page === 1}
                  className="bg-white border border-gray-300 text-brown-800 px-3 py-1 rounded disabled:opacity-50"
                >
                  &laquo; Prev
                </button>
                
                <span className="text-brown-800">
                  Page {localFilters.page} of {totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(localFilters.page + 1)}
                  disabled={localFilters.page === totalPages}
                  className="bg-white border border-gray-300 text-brown-800 px-3 py-1 rounded disabled:opacity-50"
                >
                  Next &raquo;
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-brown-800 mb-2">No Books Found</h3>
            <p className="text-brown-600">
              No books match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}