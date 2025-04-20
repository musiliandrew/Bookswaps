import { useState, useEffect, useRef } from 'react';
import { Pencil, X, Camera, MessageSquare, Plus, Trash } from 'lucide-react';

// Mock current user ID for authentication checks
const CURRENT_USER_ID = "456e7890-abcd-1234-5678-1234567890ab";

export default function ProfilePage({ userId }) {
  const [profile, setProfile] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [, setIsEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch profile data on component mount or userId change
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Determine if we're viewing our own profile
    const viewingOwnProfile = !userId || userId === CURRENT_USER_ID;
    setIsCurrentUser(viewingOwnProfile);

    // Fetch profile data
    fetchProfileData(viewingOwnProfile ? null : userId)
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again.");
        setLoading(false);
      });
  }, [userId]);

  // Handle edit form submission
  const handleUpdateProfile = async (updatedData) => {
    if (!isCurrentUser) return;
    
    try {
      // In a real app, this would be an API call
      const updatedProfile = await updateProfile(updatedData);
      setProfile(updatedProfile);
      setIsEditing(false);
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-24 w-24 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-700 mb-2">Profile not found</p>
          <a
            href="/"
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <ProfileHeader 
            profile={profile} 
            isCurrentUser={isCurrentUser} 
            onEditClick={() => setShowEditModal(true)}
          />
          
          <BooksSection 
            books={profile.books_owned} 
            isCurrentUser={isCurrentUser} 
          />
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && isCurrentUser && (
        <EditProfileModal 
          profile={profile} 
          onClose={() => setShowEditModal(false)} 
          onSave={handleUpdateProfile} 
        />
      )}
    </div>
  );
}

// ProfileHeader Component
function ProfileHeader({ profile, isCurrentUser, onEditClick }) {
  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex flex-col items-center md:flex-row md:items-start">
        {/* Avatar Section */}
        <div className="relative mb-4 md:mb-0 md:mr-6">
          <ProfileAvatar 
            imageUrl={profile.profile_image_url}
            username={profile.username}
            isCurrentUser={isCurrentUser}
            onEditClick={onEditClick}
          />
        </div>
        
        {/* User Info Section */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {profile.username}
          </h1>
          
          {/* Genres */}
          <div className="mb-4">
            <h2 className="text-sm text-gray-500 mb-1">Favorite Genres</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {profile.genres && profile.genres.length > 0 ? (
                profile.genres.map((genre, index) => (
                  <span 
                    key={index} 
                    className="bg-teal-100 text-teal-800 rounded-full px-3 py-1 text-sm"
                  >
                    {genre}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm italic">
                  No genres specified
                </span>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-4">
            {isCurrentUser ? (
              <button
                onClick={onEditClick}
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
                aria-label="Edit profile"
              >
                <Pencil size={16} className="mr-2" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={() => window.location.href = `/chats?new=${profile.user_id}`}
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
                aria-label="Start a chat with this user"
              >
                <MessageSquare size={16} className="mr-2" />
                Start Chat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ProfileAvatar Component
function ProfileAvatar({ imageUrl, username, isCurrentUser, onEditClick }) {
  return (
    <>
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200">
        <img 
          src={imageUrl || "/api/placeholder/100/100"} 
          alt={`${username}'s profile`}
          className="w-full h-full object-cover"
        />
        
        {isCurrentUser && (
          <button 
            onClick={onEditClick}
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200"
            aria-label="Change profile picture"
          >
            <Camera size={24} className="text-white" />
          </button>
        )}
      </div>
    </>
  );
}

// BooksSection Component
function BooksSection({ books, isCurrentUser }) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {isCurrentUser ? "My Books" : "Books"}
        </h2>
        
        {isCurrentUser && (
          <a 
            href="/library/add" 
            className="text-teal-600 hover:text-teal-700 font-medium flex items-center"
          >
            <Plus size={16} className="mr-1" /> Add Book
          </a>
        )}
      </div>
      
      {books && books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {books.map((book, index) => (
            <BookCard key={index} book={book} isCurrentUser={isCurrentUser} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">
            {isCurrentUser 
              ? "You don't have any books in your library yet!" 
              : "This user doesn't have any books in their library yet."}
          </p>
          {isCurrentUser && (
            <a 
              href="/library/add" 
              className="inline-flex items-center bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md"
            >
              <Plus size={16} className="mr-2" /> Add Your First Book
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// BookCard Component
function BookCard({ book, isCurrentUser }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <a href={`/books/${book.book_id}`} className="block">
        <div className="aspect-w-2 aspect-h-3 relative">
          <img 
            src={book.thumbnail_url || "/api/placeholder/100/150"} 
            alt={`Cover of ${book.title}`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
            {book.title}
          </h3>
          
          {isCurrentUser && (
            <div className="mt-2 flex justify-end">
              <button 
                className="text-red-500 hover:text-red-700 p-1"
                aria-label="Remove book from library"
              >
                <Trash size={14} />
              </button>
            </div>
          )}
        </div>
      </a>
    </div>
  );
}

// EditProfileModal Component
function EditProfileModal({ profile, onClose, onSave }) {
  const [formData, setFormData] = useState({
    username: profile.username || '',
    genres: profile.genres || [],
    profile_image: null,
  });
  const [imagePreview, setImagePreview] = useState(profile.profile_image_url);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Available genres for selection
  const availableGenres = [
    "Fantasy", "Science Fiction", "Mystery", "Thriller", "Romance", 
    "Historical Fiction", "Non-Fiction", "Biography", "Self-Help", 
    "Horror", "Young Adult", "Children's", "Poetry", "Classics",
    "Graphic Novel", "Memoir", "Philosophy", "Science", "History"
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Handle genre toggle
  const handleGenreToggle = (genre) => {
    const updatedGenres = formData.genres.includes(genre)
      ? formData.genres.filter(g => g !== genre)
      : [...formData.genres, genre];
    
    setFormData({ ...formData, genres: updatedGenres });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setErrors({ ...errors, profile_image: 'Only JPG and PNG images are allowed' });
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors({ ...errors, profile_image: 'Image size must be less than 2MB' });
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    setFormData({ ...formData, profile_image: file });
    setErrors({ ...errors, profile_image: null });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, you'd upload the image and send the form data
      // For now, just simulate the API call
      await onSave({
        username: formData.username,
        genres: formData.genres,
        profile_image: formData.profile_image,
      });
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-full overflow-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {/* Profile Image */}
          <div className="mb-6 flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-2">
              <img 
                src={imagePreview || "/api/placeholder/100/100"} 
                alt="Profile preview" 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200"
                aria-label="Change profile picture"
              >
                <Camera size={24} className="text-white" />
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleImageChange}
              className="hidden"
              aria-label="Upload profile picture"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="text-sm text-teal-600 hover:text-teal-700"
            >
              Change Photo
            </button>
            
            {errors.profile_image && (
              <p className="text-red-500 text-xs mt-1">{errors.profile_image}</p>
            )}
          </div>
          
          {/* Username */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={30}
              required
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>
          
          {/* Genres */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favorite Genres (Select up to 5)
            </label>
            <div className="flex flex-wrap gap-2">
              {availableGenres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.genres.includes(genre)
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${formData.genres.length >= 5 && !formData.genres.includes(genre) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={formData.genres.length >= 5 && !formData.genres.includes(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.genres.length}/5 genres selected
            </p>
          </div>
          
          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-medium flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Mock API functions (replace with real API calls when available)
async function fetchProfileData(userId) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock profile data
  if (!userId || userId === CURRENT_USER_ID) {
    // Current user's profile
    return {
      user_id: CURRENT_USER_ID,
      username: "BookLover",
      email: "booklover@example.com",
      genres: ["Sci-Fi", "Fantasy", "Mystery"],
      profile_image_url: "/api/placeholder/100/100",
      books_owned: [
        {
          book_id: "234e5678-abcd-1234-5678-1234567890ab",
          title: "Dune",
          thumbnail_url: "/api/placeholder/100/150"
        },
        {
          book_id: "345e6789-abcd-1234-5678-1234567890ab",
          title: "The Hobbit",
          thumbnail_url: "/api/placeholder/100/150"
        },
        {
          book_id: "456e7890-abcd-1234-5678-1234567890ab",
          title: "Neuromancer",
          thumbnail_url: "/api/placeholder/100/150"
        },
        {
          book_id: "567e8901-abcd-1234-5678-1234567890ab",
          title: "The Left Hand of Darkness",
          thumbnail_url: "/api/placeholder/100/150"
        }
      ]
    };
  } else if (userId === "567e8901-abcd-1234-5678-1234567890ab") {
    // Another user's profile
    return {
      user_id: "567e8901-abcd-1234-5678-1234567890ab",
      username: "LiteraryExplorer",
      genres: ["Classics", "Historical Fiction", "Biography"],
      profile_image_url: "/api/placeholder/100/100",
      books_owned: [
        {
          book_id: "678e9012-abcd-1234-5678-1234567890ab",
          title: "Pride and Prejudice",
          thumbnail_url: "/api/placeholder/100/150"
        },
        {
          book_id: "789e0123-abcd-1234-5678-1234567890ab",
          title: "To Kill a Mockingbird",
          thumbnail_url: "/api/placeholder/100/150"
        },
        {
          book_id: "890e1234-abcd-1234-5678-1234567890ab",
          title: "1984",
          thumbnail_url: "/api/placeholder/100/150"
        }
      ]
    };
  }
  
  // If user ID doesn't match any known user
  throw new Error("User not found");
}

async function updateProfile(profileData) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real app, this would send data to the server
  console.log("Updating profile with:", profileData);
  
  // Return updated profile (mock)
  return {
    user_id: CURRENT_USER_ID,
    username: profileData.username,
    email: "booklover@example.com",
    genres: profileData.genres,
    profile_image_url: profileData.profile_image 
      ? URL.createObjectURL(profileData.profile_image)
      : "/api/placeholder/100/100",
    books_owned: [
      {
        book_id: "234e5678-abcd-1234-5678-1234567890ab",
        title: "Dune",
        thumbnail_url: "/api/placeholder/100/150"
      },
      {
        book_id: "345e6789-abcd-1234-5678-1234567890ab",
        title: "The Hobbit",
        thumbnail_url: "/api/placeholder/100/150"
      },
      {
        book_id: "456e7890-abcd-1234-5678-1234567890ab",
        title: "Neuromancer",
        thumbnail_url: "/api/placeholder/100/150"
      },
      {
        book_id: "567e8901-abcd-1234-5678-1234567890ab",
        title: "The Left Hand of Darkness",
        thumbnail_url: "/api/placeholder/100/150"
      }
    ]
  };
}