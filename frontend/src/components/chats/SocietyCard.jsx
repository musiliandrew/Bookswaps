import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { useDiscussions } from '../../hooks/useDiscussions';
import Button from '../../components/common/Button';

const SocietyCard = ({ society, onJoin }) => {
  const { id, name, description, member_count, visibility, is_member, logo, book_id } = society;
  const { profile } = useAuth();
  const { createPost } = useDiscussions();
  const [showShareCard, setShowShareCard] = useState(false);
  const [isJoining, setJoining] = useState(false);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await onJoin(id);
      toast.success(`Joined ${name}!`);
      if (profile?.societies_joined >= 3) {
        toast.success('🎉 Badge Earned: Socialite (3 Societies)!');
      }
    } catch (err) {
      console.error('Join error:', err);
      toast.error('Failed to join society');
    } finally {
      setJoining(false);
    }
  };

  const handleDiscuss = async () => {
    if (!profile?.user?.id) {
      toast.warning('Please sign in to discuss');
      return;
    }
    if (!book_id) {
      toast.info('No book associated with this society');
      return;
    }
    try {
      await createPost({
        content: `Just joined ${name}! Let’s discuss the society’s book. What are your thoughts?`,
        book_id,
        society_id: id,
      });
      toast.success('Discussion posted!');
    } catch (err) {
      console.error('Discuss error:', err);
      toast.error('Failed to post discussion');
    }
  };

  const handleShare = () => {
    setShowShareCard(true);
  };

  return (
    <motion.div
      className="bookish-shadow p-4 bg-white rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="article"
      aria-labelledby={`society-${id}-title`}
    >
      <div className="flex items-start gap-4">
        {logo && (
          <img
            src={logo || '/assets/bookish.png'}
            alt={`${name} logo`}
            className="w-16 h-16 object-cover rounded"
            aria-hidden="true"
          />
        )}
        <div className="flex-1">
          <Link
            to={`/societies/${id}`}
            className="text-xl font-semibold text-gradient hover:underline font-['Playfair_Display']"
            id={`society-${id}-title`}
          >
            {name}
          </Link>
          <p className="text-gray-600 mt-2 font-['Poppins']">{description || 'No description available'}</p>
          <div className="mt-2 text-sm text-gray-500 font-['Poppins']">
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
            className="bookish-button-enhanced bg-[#FF6F61] hover:bg-[#e65a50]"
            disabled={isJoining || is_member}
            isLoading={isJoining}
            aria-label={`Join ${name} society`}
          />
        )}
        {is_member && (
          <p className="text-success font-['Poppins']">You are a member</p>
        )}
        {book_id && (
          <Button
            text="Discuss Book"
            onClick={handleDiscuss}
            className="bookish-button-enhanced bg-orange-600 hover:bg-orange-700"
            aria-label={`Discuss book for ${name} society`}
          />
        )}
        <Button
          text="Share"
          onClick={handleShare}
          className="bookish-button-enhanced bg-teal-600 hover:bg-teal-700"
          aria-label={`Share ${name} society`}
        />
      </div>

      {showShareCard && (
        <motion.div
          className="mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-64 w-full bookish-shadow">
            <Canvas>
              <ambientLight />
              <OrbitControls />
              <mesh>
                <boxGeometry args={[3, 2, 0.1]} />
                <meshStandardMaterial color="#FF6F61" />
                <Text position={[0, 0.5, 0.1]} fontSize={0.2} color="white">
                  {name}
                </Text>
                <Text position={[0, 0, 0.1]} fontSize={0.15} color="white">
                  {member_count} Members
                </Text>
              </mesh>
            </Canvas>
            <Button
              text="Share on X"
              onClick={() => console.log('Share to X')}
              className="mt-2 bg-blue-600 hover:bg-blue-700"
              aria-label={`Share ${name} society on X`}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SocietyCard;