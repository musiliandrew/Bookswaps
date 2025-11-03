import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpenIcon, UserIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useBooks } from '../../hooks/useBooks';
import UserMentionLink from './UserMentionLink';
import BookReferenceLink from './BookReferenceLink';

const BookPreviewTooltip = ({ book, position, onClose }) => {
  if (!book) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="fixed z-50 bg-[var(--bg-card)] border border-gray-200 rounded-lg shadow-xl p-4 max-w-sm"
        style={{
          top: position.y - 10,
          left: Math.min(position.x, window.innerWidth - 300),
        }}
        onMouseLeave={onClose}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {book.cover_image ? (
              <img 
                src={book.cover_image} 
                alt={book.title}
                className="w-12 h-16 object-cover rounded"
              />
            ) : (
              <div className="w-12 h-16 bg-gray-100 rounded flex items-center justify-center">
                <BookOpenIcon className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm truncate">
              {book.title}
            </h4>
            <p className="text-xs text-gray-600 mb-1">
              by {book.author}
            </p>
            {book.genre && (
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {book.genre}
              </span>
            )}
            {book.owner && (
              <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                <UserIcon className="w-3 h-3" />
                <span>Owned by {book.owner}</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 text-xs text-blue-600 font-medium">
          Click to view in library →
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const SmartTextRenderer = ({
  text,
  className = "",
  enableBookLinks = true,
  enableUserMentions = true,
  enableAutoDetection = true,
  renderAsHtml = true // New prop to control HTML rendering
}) => {
  const [hoveredBook, setHoveredBook] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const { getBook } = useBooks();

  // Helper function to check if text contains HTML tags
  const containsHtml = (str) => {
    return /<[^>]*>/g.test(str);
  };

  // Helper function to safely render HTML content
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };

  // Helper function to extract text content from HTML for smart processing
  const extractTextFromHtml = (htmlContent) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // Helper function to process HTML content while preserving smart features
  const processHtmlWithSmartFeatures = (htmlContent) => {
    // For now, we'll use a simple approach: render HTML as-is
    // In the future, we could implement more sophisticated HTML parsing
    // that preserves book references and user mentions within HTML tags
    return htmlContent;
  };

  // Parse user mentions in format @username
  const parseUserMentions = (text) => {
    if (!enableUserMentions) return [{ type: 'text', content: text }];

    const userMentionRegex = /@([a-zA-Z0-9_]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = userMentionRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        if (beforeText) {
          parts.push({ type: 'text', content: beforeText });
        }
      }

      // Add the user mention
      parts.push({
        type: 'user_mention',
        content: match[0], // "@username"
        username: match[1], // "username"
        fullMatch: match[0]
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText) {
        parts.push({ type: 'text', content: remainingText });
      }
    }

    return parts.length > 0 ? parts : [{ type: 'text', content: text }];
  };

  // Parse book references in markdown format [📚 | Title](book:book_id) or [📚 Title by Author](book:book_id)
  const parseBookReferences = (text) => {
    if (!enableBookLinks) return [{ type: 'text', content: text }];

    // Support both new format [📚 | Title] and old format [📚 Title by Author]
    const bookReferenceRegex = /\[📚\s*(?:\|\s*)?([^\]]+)\]\(book:([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = bookReferenceRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        if (beforeText) {
          parts.push({ type: 'text', content: beforeText });
        }
      }

      // Add the book reference
      parts.push({
        type: 'book_reference',
        content: match[1], // "Title" or "Title by Author"
        bookId: match[2],
        fullMatch: match[0]
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) });
    }

    return parts;
  };

  // Auto-detect book titles and authors (basic implementation)
  const autoDetectBooks = (textPart) => {
    if (!enableAutoDetection) return [{ type: 'text', content: textPart }];

    // This is a simplified version - you'd want a more sophisticated algorithm
    // that matches against your actual book database
    const bookPatterns = [
      // Pattern for "Title by Author" format
      /\b([A-Z][a-zA-Z\s]{2,30})\s+by\s+([A-Z][a-zA-Z\s]{2,20})\b/g,
      // Pattern for quoted titles
      /"([^"]{3,30})"/g
    ];

    // For now, just return the text as-is
    // In a real implementation, you'd search your book database
    return [{ type: 'text', content: textPart }];
  };

  const handleBookHover = async (bookId, event) => {
    try {
      const book = await getBook(bookId);
      setHoveredBook(book);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    } catch (error) {
      console.error('Error fetching book details:', error);
      // Fallback: show sample book data
      const sampleBook = {
        book_id: bookId,
        title: 'Sample Book',
        author: 'Sample Author',
        genre: 'Fiction',
        cover_image: null
      };
      setHoveredBook(sampleBook);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleBookClick = (bookId) => {
    navigate(`/library/books/${bookId}`);
  };

  const renderPart = (part, index) => {
    if (part.type === 'user_mention') {
      return (
        <UserMentionLink
          key={index}
          username={part.username}
          className="mx-0.5"
        />
      );
    }

    if (part.type === 'book_reference') {
      return (
        <BookReferenceLink
          key={index}
          bookId={part.bookId}
          displayText={part.content}
          className="mx-0.5"
        />
      );
    }

    // For regular text, apply user mention parsing first, then auto-detection
    const userMentionParts = parseUserMentions(part.content);
    return userMentionParts.map((subPart, subIndex) => {
      if (subPart.type === 'user_mention') {
        return (
          <UserMentionLink
            key={`${index}-${subIndex}`}
            username={subPart.username}
            className="mx-0.5"
          />
        );
      }

      // For text parts, apply auto-detection
      const autoDetectedParts = autoDetectBooks(subPart.content);
      return autoDetectedParts.map((autoSubPart, autoIndex) => (
        <span key={`${index}-${subIndex}-${autoIndex}`}>{autoSubPart.content}</span>
      ));
    });
  };

  // Parse both book references and user mentions
  const bookParts = parseBookReferences(text || '');
  const allParts = [];

  // Process each book part for user mentions
  bookParts.forEach(part => {
    if (part.type === 'text') {
      const userParts = parseUserMentions(part.content);
      allParts.push(...userParts);
    } else {
      allParts.push(part);
    }
  });

  // If the text contains HTML and we should render it as HTML, use dangerouslySetInnerHTML
  if (renderAsHtml && containsHtml(text || '')) {
    const processedHtml = processHtmlWithSmartFeatures(text || '');
    return (
      <div className={`relative ${className}`}>
        <div
          className="whitespace-pre-wrap prose prose-sm max-w-none"
          dangerouslySetInnerHTML={createMarkup(processedHtml)}
        />

        {/* Book preview tooltip */}
        {hoveredBook && (
          <BookPreviewTooltip
            book={hoveredBook}
            position={tooltipPosition}
            onClose={() => setHoveredBook(null)}
          />
        )}
      </div>
    );
  }

  // Otherwise, use the smart text parsing for plain text
  return (
    <div className={`relative ${className}`}>
      <div className="whitespace-pre-wrap">
        {allParts.map((part, index) => renderPart(part, index))}
      </div>

      {/* Book preview tooltip */}
      {hoveredBook && (
        <BookPreviewTooltip
          book={hoveredBook}
          position={tooltipPosition}
          onClose={() => setHoveredBook(null)}
        />
      )}
    </div>
  );
};

export default SmartTextRenderer;
