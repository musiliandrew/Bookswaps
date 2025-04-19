import React, { useState, useEffect } from 'react';

// Mock data for books and genres
const MOCK_BOOKS = [
  { id: 1, title: "To Kill a Mockingbird", author: "Harper Lee" },
  { id: 2, title: "1984", author: "George Orwell" },
  { id: 3, title: "Pride and Prejudice", author: "Jane Austen" },
  { id: 4, title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
  { id: 5, title: "Brave New World", author: "Aldous Huxley" },
  { id: 6, title: "The Catcher in the Rye", author: "J.D. Salinger" },
];

const MOCK_GENRES = [
  { id: 1, name: "Fiction" },
  { id: 2, name: "Science Fiction" },
  { id: 3, name: "Fantasy" },
  { id: 4, name: "Mystery" },
  { id: 5, name: "Romance" },
  { id: 6, name: "Non-fiction" },
  { id: 7, name: "Historical Fiction" },
  { id: 8, name: "Biography" },
];

const CreatePostForm = () => {
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Book search functionality
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [showBookResults, setShowBookResults] = useState(false);
  const [filteredBooks, setFilteredBooks] = useState([]);

  // Filter books based on search query
  useEffect(() => {
    if (bookSearchQuery) {
      const results = MOCK_BOOKS.filter(book => 
        book.title.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(bookSearchQuery.toLowerCase())
      );
      setFilteredBooks(results);
    } else {
      setFilteredBooks([]);
    }
  }, [bookSearchQuery]);

  // Handle genre selection
  const handleGenreToggle = (genreId) => {
    setSelectedGenres(prevGenres => {
      if (prevGenres.includes(genreId)) {
        return prevGenres.filter(id => id !== genreId);
      } else {
        return [...prevGenres, genreId];
      }
    });
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }
    
    if (!content.trim()) {
      newErrors.content = "Content is required";
    } else if (content.length < 20) {
      newErrors.content = "Content must be at least 20 characters";
    }
    
    if (!selectedBook) {
      newErrors.book = "Please select a book";
    }
    
    if (selectedGenres.length === 0) {
      newErrors.genres = "Please select at least one genre";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Mock API call with timeout to simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Construct post data
      const postData = {
        title,
        content,
        bookId: selectedBook.id,
        genreIds: selectedGenres,
      };
      
      console.log("Post data:", postData);
      // In a real implementation, you would send this data to your API
      // await fetch('/api/discussions/', { method: 'POST', body: JSON.stringify(postData), headers: {...} });
      
      // Show success message
      setSubmitted(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setTitle('');
        setContent('');
        setSelectedBook(null);
        setSelectedGenres([]);
        setBookSearchQuery('');
        setSubmitted(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error creating post:", error);
      setErrors({ submit: "Failed to create post. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 px-4">
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="border-b border-gray-200 bg-teal-50 rounded-t-lg">
          <h2 className="text-2xl font-semibold text-brown-800 p-6">Create New Discussion</h2>
        </div>
        
        {submitted ? (
          <div className="p-6 text-center">
            <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4">
              <svg className="mx-auto h-12 w-12 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-lg font-medium">Post Created Successfully!</h3>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-brown-800 mb-1">
                Post Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-2 rounded-md border ${errors.title ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                placeholder="Give your discussion a title..."
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>
            
            {/* Book Selection */}
            <div>
              <label htmlFor="book" className="block text-sm font-medium text-brown-800 mb-1">
                Book
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="book"
                  value={bookSearchQuery}
                  onChange={(e) => {
                    setBookSearchQuery(e.target.value);
                    setShowBookResults(true);
                  }}
                  onFocus={() => setShowBookResults(true)}
                  placeholder="Search for a book..."
                  className={`w-full px-4 py-2 rounded-md border ${errors.book ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                />
                
                {selectedBook && (
                  <div className="mt-2 p-2 bg-teal-50 rounded-md flex justify-between items-center">
                    <div>
                      <span className="font-medium">{selectedBook.title}</span>
                      <span className="text-sm text-gray-600 ml-1">by {selectedBook.author}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        setSelectedBook(null);
                        setBookSearchQuery('');
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                )}
                
                {showBookResults && bookSearchQuery && filteredBooks.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                    <ul>
                      {filteredBooks.map(book => (
                        <li key={book.id} className="p-3 hover:bg-teal-50 border-b border-gray-100 last:border-b-0 cursor-pointer" onClick={() => {
                          setSelectedBook(book);
                          setBookSearchQuery('');
                          setShowBookResults(false);
                        }}>
                          <div className="font-medium text-brown-800">{book.title}</div>
                          <div className="text-sm text-gray-600">by {book.author}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {showBookResults && bookSearchQuery && filteredBooks.length === 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 p-3 text-center text-gray-600">
                    No books found matching "{bookSearchQuery}"
                  </div>
                )}
              </div>
              {errors.book && (
                <p className="mt-1 text-sm text-red-600">{errors.book}</p>
              )}
            </div>
            
            {/* Genres Selection */}
            <div>
              <label className="block text-sm font-medium text-brown-800 mb-2">
                Genres
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {MOCK_GENRES.map(genre => (
                  <div key={genre.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`genre-${genre.id}`}
                      checked={selectedGenres.includes(genre.id)}
                      onChange={() => handleGenreToggle(genre.id)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`genre-${genre.id}`} className="ml-2 text-sm text-gray-700">
                      {genre.name}
                    </label>
                  </div>
                ))}
              </div>
              {errors.genres && (
                <p className="mt-1 text-sm text-red-600">{errors.genres}</p>
              )}
            </div>
            
            {/* Content Textarea */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-brown-800 mb-1">
                What's on your mind?
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="6"
                className={`w-full px-4 py-2 rounded-md border ${errors.content ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                placeholder="Share your thoughts about this book..."
              ></textarea>
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
            </div>
            
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-md text-white font-medium ${isSubmitting ? 'bg-teal-400' : 'bg-teal-600 hover:bg-teal-700'} transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
              >
                {isSubmitting ? (
                  <div className="flex justify-center items-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating post...
                  </div>
                ) : "Create Discussion"}
              </button>
            </div>
            
            {errors.submit && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md mt-2">
                {errors.submit}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default CreatePostForm;