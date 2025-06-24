/**
 * Enhanced utility function to parse genres - handles multiple levels of encoding
 * This handles the complex genre data that comes from the backend which can be:
 * - Simple array: ["Sci-fi", "Fiction"]
 * - Double-encoded JSON string: "[\"Sci-fi\", \"Fiction\"]"
 * - Array with encoded strings: ["[\"Sci-fi\", \"Fiction\"]"]
 * - Comma-separated string: "Sci-fi, Fiction"
 */
export const parseGenres = (genres) => {
  if (!genres) return [];

  // Helper function to clean a single genre string
  const cleanGenre = (genre) => {
    if (typeof genre !== 'string') return genre;
    
    // Remove various quote and bracket combinations
    let cleaned = genre
      .replace(/^[[\\]"']+|[[\\]"']+$/g, '') // Remove leading/trailing brackets and quotes
      .replace(/\\"/g, '"') // Unescape quotes
      .replace(/\\'/g, "'") // Unescape single quotes
      .trim();
    
    return cleaned;
  };

  // If it's already an array, process each item
  if (Array.isArray(genres)) {
    return genres
      .map(genre => {
        if (typeof genre === 'string') {
          // Check if this string contains a JSON array
          if (genre.includes('[') && genre.includes(']')) {
            try {
              // Try to parse as JSON
              const parsed = JSON.parse(genre);
              if (Array.isArray(parsed)) {
                return parsed.map(cleanGenre);
              }
            } catch {
              // If JSON parsing fails, manually extract genres
              const match = genre.match(/\[(.*)\]/);
              if (match) {
                return match[1]
                  .split(',')
                  .map(g => cleanGenre(g))
                  .filter(g => g && g.length > 0);
              }
            }
          }
          
          // Handle comma-separated genres in a single string
          if (genre.includes(',')) {
            return genre.split(',').map(cleanGenre);
          }
          
          return cleanGenre(genre);
        }
        return genre;
      })
      .flat() // Flatten nested arrays
      .filter(genre => genre && typeof genre === 'string' && genre.length > 0)
      .map(genre => genre.charAt(0).toUpperCase() + genre.slice(1)); // Capitalize
  }

  // If it's a string, try multiple parsing approaches
  if (typeof genres === 'string') {
    // First, try direct JSON parsing
    try {
      const parsed = JSON.parse(genres);
      return parseGenres(parsed); // Recursively parse
    } catch {
      // If that fails, try to extract from the string manually
      
      // Handle cases like: ["[\"Sci-fi\", \"Fiction\"]"]
      if (genres.includes('[') && genres.includes(']')) {
        // Extract everything between the outermost brackets
        const match = genres.match(/\[(.*)\]/);
        if (match) {
          const innerContent = match[1];
          
          // Try to parse the inner content as JSON
          try {
            const innerParsed = JSON.parse(`[${innerContent}]`);
            return parseGenres(innerParsed);
          } catch {
            // Manual parsing - split by comma and clean
            return innerContent
              .split(',')
              .map(cleanGenre)
              .filter(genre => genre && genre.length > 0)
              .map(genre => genre.charAt(0).toUpperCase() + genre.slice(1));
          }
        }
      }
      
      // Fallback: treat as comma-separated string
      return genres
        .split(',')
        .map(cleanGenre)
        .filter(genre => genre && genre.length > 0)
        .map(genre => genre.charAt(0).toUpperCase() + genre.slice(1));
    }
  }

  return [];
};

/**
 * Format genres for display with a maximum count
 * @param {*} genres - Raw genres data
 * @param {number} maxCount - Maximum number of genres to display
 * @returns {string[]} - Array of formatted genre strings
 */
export const formatGenresForDisplay = (genres, maxCount = 3) => {
  const parsed = parseGenres(genres);
  return parsed.slice(0, maxCount);
};

/**
 * Get all genres as a comma-separated string
 * @param {*} genres - Raw genres data
 * @returns {string} - Comma-separated genre string
 */
export const genresToString = (genres) => {
  const parsed = parseGenres(genres);
  return parsed.join(', ');
};
