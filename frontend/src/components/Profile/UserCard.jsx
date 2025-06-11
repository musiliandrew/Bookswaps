import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FollowButton from './FollowButton';
import { UserIcon } from '@heroicons/react/24/outline';

const UserCard = ({ user, className = '' }) => {
  const navigate = useNavigate();

  const handleStartChat = () => {
    navigate(`/chats/${user.id}`);
  };

  return (
    <motion.div
      className={`bookish-glass p-4 rounded-xl max-w-xs mx-auto ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex items-center space-x-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--accent)]">
          {user.avatar ? (
            <img src={user.avatar} alt={`${user.username}'s avatar`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[var(--secondary)] flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-[var(--text)]" />
            </div>
          )}
        </div>
        <h3 className="text-lg font-['Lora'] text-[var(--primary)]">{user.username}</h3>
      </motion.div>
      <motion.div
        className="mt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-sm text-[var(--text)] font-['Open_Sans']">City: {user.city || 'Not set'}</p>
        <p className="text-sm text-[var(--text)] font-['Open_Sans']">Followers: {user.followers_count || 0}</p>
      </motion.div>
      <motion.div
        className="mt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <label className="block text-sm font-['Lora'] text-[var(--primary)]">Favorite Genres</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {user.genres?.length ? (
            user.genres.map((genre) => (
              <motion.span
                key={genre}
                className="genre-tag px-2 py-1 rounded-full text-xs text-white font-['Caveat']"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                {genre}
              </motion.span>
            ))
          ) : (
            <p className="text-sm text-[var(--text)] font-['Open_Sans']">No genres selected</p>
          )}
        </div>
      </motion.div>
      <motion.div
        className="mt-4 flex space-x-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Link
          to={`/profile/${user.id}`}
          className="flex-grow text-center bookish-button-enhanced font-['Open_Sans'] py-2 px-3 rounded-xl text-white bg-[var(--primary)] hover:bg-[var(--accent)]"
        >
          View Profile
        </Link>
        <button
          onClick={handleStartChat}
          className="flex-grow text-center bookish-button-enhanced font-['Open_Sans'] py-2 px-3 rounded-xl text-white bg-blue-600 hover:bg-blue-700"
        >
          Send Message
        </button>
        <FollowButton userId={user.id} className="flex-grow" />
      </motion.div>
    </motion.div>
  );
};

export default UserCard;