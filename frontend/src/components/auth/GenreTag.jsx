import { motion } from 'framer-motion';

const GenreTag = ({ genre, onRemove }) => (
  <motion.span
    className="genre-tag text-white px-3 py-2 rounded-full text-sm flex items-center font-['Open_Sans'] transition-all duration-300"
    initial={{ scale: 0, rotate: -10 }}
    animate={{ scale: 1, rotate: 0 }}
    exit={{ scale: 0, rotate: 10 }}
    transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
    whileHover={{ scale: 1.05, y: -2 }}
  >
    {genre}
    <motion.button
      type="button"
      onClick={() => onRemove(genre)}
      className="ml-2 w-5 h-5 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-all duration-200"
      whileHover={{ scale: 1.2, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      aria-label={`Remove ${genre}`}
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </motion.button>
  </motion.span>
);

export default GenreTag;