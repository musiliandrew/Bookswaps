import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSocieties } from '../../hooks/useSocieties';
import { useAuth } from '../../hooks/useAuth';
import Button from '../Common/Button';
import Tilt from 'react-parallax-tilt';
import html2canvas from 'html2canvas';

const SocietyCard = ({ society, className = '' }) => {
  const { id, name, description, member_count, visibility, is_member, logo } = society;
  const { joinSociety, leaveSociety } = useSocieties();
  const { profile } = useAuth();
  const [isJoining, setIsJoining] = useState(false);
  const shareRef = useRef();

  const handleJoin = async () => {
    if (!profile?.user?.id) {
      toast.warning('Please sign in to join');
      return;
    }
    setIsJoining(true);
    try {
      await joinSociety(id);
      toast.success(`Joined ${name}!`);
    } catch {
      toast.error('Failed to join society');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!profile?.user?.id) {
      toast.warning('Please sign in to leave');
      return;
    }
    try {
      await leaveSociety(id);
      toast.success(`Left ${name}`);
    } catch {
      toast.error('Failed to leave society');
    }
  };

  const handleShare = async () => {
    try {
      await html2canvas(shareRef.current);
      // const imgData = canvas.toDataURL('image/png');
      // Placeholder for X share
      toast.info('Sharing to X (placeholder)');
    } catch {
      toast.error('Failed to share society');
    }
  };

  return (
    <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5}>
      <motion.div
        className={`bookish-glass p-4 rounded-xl ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        ref={shareRef}
      >
        <div className="flex items-start gap-4">
          {logo && (
            <img
              src={logo}
              alt={`${name} logo`}
              className="w-16 h-16 object-cover rounded"
            />
          )}
          <div className="flex-1">
            <Link
              to={`/societies/${id}`}
              className="text-xl font-['Lora'] text-gradient hover:underline"
            >
              {name}
            </Link>
            <p className="text-[var(--text)] font-['Open_Sans'] mt-2">
              {description || 'No description available'}
            </p>
            <div className="mt-2 text-sm text-gray-500 font-['Open_Sans']">
              <p>Members: {member_count}</p>
              <p>Visibility: {visibility === 'public' ? 'Public' : 'Private'}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {visibility === 'public' && !is_member && (
            <Button
              text="Join Society"
              onClick={handleJoin}
              className="bookish-button-enhanced bg-[var(--accent)] text-white"
              disabled={isJoining || is_member}
              isLoading={isJoining}
            />
          )}
          {is_member && (
            <Button
              text="Leave Society"
              onClick={handleLeave}
              className="bookish-button-enhanced bg-red-600 text-white"
            />
          )}
          <Button
            text="Share"
            onClick={handleShare}
            className="bookish-button-enhanced bg-teal-600 text-white"
          />
        </div>
      </motion.div>
    </Tilt>
  );
};

export default SocietyCard;
