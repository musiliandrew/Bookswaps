import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useDiscussions } from '../../hooks/useDiscussions';
import Button from '../../components/common/Button'; 

const DiscussionCard = ({ post }) => {
  const { id, title, content, author, timestamp, reactions, image, book_id, society_id } = post;
  const { reactToPost, createPost } = useDiscussions();
  const { profile } = useAuth();
  const [showShareCard, setShowShareCard] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!profile?.user?.id) {
      toast.warning('Please sign in to like posts');
      return;
    }
    setIsLiking(true);
    try {
      await reactToPost(id, 'like');
      toast.success('Post liked!');
      if (profile?.posts_liked >= 5) {
        toast.success('🎉 Badge Earned: Engaged Reader (5 Likes)!');
      }
    } catch (err) {
      console.error('Like error:', err);
      toast.error('Failed to like post');
    } finally {
      setIsLiking(false);
    }
  };

  const handleReply = async () => {
    if (!profile?.user?.id) {
      toast.warning('Please sign in to reply');
      return;
    }
    try {
      await createPost({
        content: `Replying to "${title}" by ${author?.username || 'Anonymous'}: `,
        parent_id: id,
        book_id,
        society_id,
      });
      toast.success('Reply posted!');
    } catch (err) {
      console.error('Reply error:', err);
      toast.error('Failed to post reply');
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
      aria-labelledby={`post-${id}-title`}
    >
      <div className="flex items-start gap-4">
        {image && (
          <img
            src={image || '/assets/bookish.png'}
            alt={`${title} image`}
            className="w-16 h-16 object-cover rounded"
            aria-hidden="true"
          />
        )}
        <div className="flex-1">
          <Link
            to={`/discussions/${id}`}
            className="text-xl font-semibold text-gradient hover:underline font-['Playfair_Display']"
            id={`post-${id}-title`}
          >
            {title}
          </Link>
          <p className="text-gray-600 mt-2 font-['Poppins']">
            {content.length > 200 ? `${content.substring(0, 200)}...` : content}
          </p>
          <div className="mt-2 text-sm text-gray-500 font-['Poppins']">
            <p>
              By {author?.username || 'Anonymous'} • {new Date(timestamp).toLocaleString()}
            </p>
            <p>Likes: {reactions?.like_count || 0}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          text="Like"
          onClick={handleLike}
          className="bookish-button-enhanced bg-[#FF6F61] hover:bg-[#e65a50]"
          disabled={isLiking || !profile?.user?.id}
          isLoading={isLiking}
          aria-label={`Like post ${title}`}
        />
        <Button
          text="Reply"
          onClick={handleReply}
          className="bookish-button-enhanced bg-orange-600 hover:bg-orange-700"
          disabled={!profile?.user?.id}
          aria-label={`Reply to post ${title}`}
        />
        <Button
          text="Share"
          onClick={handleShare}
          className="bookish-button-enhanced bg-teal-600 hover:bg-teal-700"
          aria-label={`Share post ${title}`}
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
                  {title}
                </Text>
                <Text position={[0, 0, 0.1]} fontSize={0.15} color="white">
                  {author?.username || 'Anonymous'}
                </Text>
              </mesh>
            </Canvas>
            <Button
              text="Share on X"
              onClick={() => console.log('Share to X')}
              className="mt-2 bg-blue-600 hover:bg-blue-700"
              aria-label={`Share post ${title} on X`}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DiscussionCard;