import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { useDiscussions } from '../../hooks/useDiscussions';
import Button from '../../components/common/Button';

const NotificationCard = ({ notification, onRead }) => {
  const { id, message, is_read, timestamp, info = {} } = notification;
  const { profile } = useAuth();
  const { createPost } = useDiscussions();
  const [showShareCard, setShowShareCard] = useState(false);
  const [isReadLoading, setReadLoading] = useState(false);

  const handleRead = async () => {
    setReadLoading(true);
    try {
      await onRead(id);
      toast.success('Marked as read');
      if (profile?.notifications_read >= 10) {
        toast.success('🎉 Badge Earned: Engaged (10 Notifications)!');
      }
    } catch (err) {
      console.error('Read error:', err);
      toast.error('Failed to mark as read');
    } finally {
      setReadLoading(false);
    }
  };

  const handleDiscuss = async () => {
    if (!profile?.user?.id) {
      toast.warning('Please sign in to discuss');
      return;
    }
    try {
      await createPost({
        content: `Received a notification about ${info?.book_title || 'a book'}: "${message}". Thoughts?`,
        book_id: info.book_id,
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

  const getLink = () => {
    if (info.type === 'swap') {
      return `/swaps/${info.related_id}`;
    } if (info.type === 'discussion') {
      return `/discussions/${info.related_id}`;
    }
    return null;
  };

  return (
    <motion.div
      className="bookish-shadow p-4 mb-4 shadow-lg bg-white rounded-lg"
      initial={{ opacity: 0.2, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="button"
    >
      <div className="flex items-center gap-4">
        {info.image?.book_image && (
          <img
            src={info.book_image || '/assets/bookish_image.svg'}
            alt={info.book_title || 'Book'}
            className="w-16 h-24 object-cover rounded"
            role="img"
          />
        )}
        <div className="flex-1">
          <p className="text-sm text-gray-600" role="content">{new Date(timestamp || Date.now()).toLocaleString()}</p>
          <p className={is_read ? 'text-gray-500' : 'text-gray-700'} role="content">{message}</p>
          {getLink() && (
            <Link
              to={getLink()}
              className="text-[#FF6F61] text-sm font-['Poppins'] hover:underline"
              role="link"
            >
              View Details
            </Link>
          )}
        </div>
        <div className="flex gap-2">
          {!is_read && (
            <Button
              text="Mark as Read"
              onClick={handleRead}
              className="bookish-button-enhanced bg-blue-600 hover:bg-blue-700"
              isLoading={isReadLoading}
              disabled={isReadLoading}
              aria-label={`Mark notification ${id} as read`}
            />
          )}
          {info.book_id && (
            <Button
              text="Discuss"
              onClick={handleDiscuss}
              className="bookish-button-enhanced bg-orange-600 hover:bg-orange-700"
              aria-label={`Discuss book related to notification ${id}`}
            />
          )}
          <Button
            text="Share"
            onClick={handleShare}
            className="bookish-button-enhanced bg-teal-600 hover:bg-teal-700"
            aria-label={`Share notification ${id}`}
          />
        </div>
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
                  {info.book_title || 'Notification'}
                </Text>
                <Text position={[0, 0, 0.1]} fontSize={0.15} color="white">
                  {message.slice(0, 20)}...
                </Text>
              </mesh>
            </Canvas>
            <Button
              text="Share on X"
              onClick={() => console.log('Share to X')}
              className="mt-2 bg-blue-600 hover:bg-blue-700"
              aria-label={`Share notification ${id} on X`}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default NotificationCard;