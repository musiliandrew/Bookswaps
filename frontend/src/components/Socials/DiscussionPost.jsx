import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDiscussions } from '../../hooks/useDiscussions';
import { useAuth } from '../../hooks/useAuth';
import Button from '../Common/Button';
import Tilt from 'react-parallax-tilt';
import html2canvas from 'html2canvas';

const DiscussionPost = ({ post, className = '' }) => {
  const { id, title, content, author, timestamp, upvotes, image, book_id, society_id } = post;
  const { upvoteDiscussionPost, createDiscussion } = useDiscussions();
  const { profile } = useAuth();
  const [isUpvoting, setIsUpvoting] = useState(false);
  const shareRef = useRef();

  const handleUpvote = async () => {
    if (!profile?.user?.id) {
      toast.warning('Please sign in to upvote');
      return;
    }
    setIsUpvoting(true);
    try {
      await upvoteDiscussionPost(id);
      toast.success('Post upvoted!');
    } catch {
      toast.error('Failed to upvote post');
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleReply = async () => {
    if (!profile?.user?.id) {
      toast.warning('Please sign in to reply');
      return;
    }
    try {
      await createDiscussion({
        content: `Replying to "${title}" by ${author?.username || 'Anonymous'}: `,
        parent_id: id,
        book_id,
        society_id,
      });
      toast.success('Reply posted!');
    } catch {
      toast.error('Failed to post reply');
    }
  };

  const handleShare = async () => {
    try {
      await html2canvas(shareRef.current);
      // Placeholder for X share
      toast.info('Sharing to X (placeholder)');
    } catch {
      toast.error('Failed to share post');
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
          {image && (
            <img
              src={image}
              alt={`${title} image`}
              className="w-16 h-16 object-cover rounded"
            />
          )}
          <div className="flex-1">
            <Link
              to={`/discussions/${id}`}
              className="text-xl font-['Lora'] text-gradient hover:underline"
            >
              {title}
            </Link>
            <p className="text-[var(--text)] font-['Open_Sans'] mt-2">
              {content.length > 200 ? `${content.substring(0, 200)}...` : content}
            </p>
            <div className="mt-2 text-sm text-gray-500 font-['Open_Sans']">
              <p>
                By {author?.username || 'Anonymous'} •{' '}
                {new Date(timestamp).toLocaleString()}
              </p>
              <p>Upvotes: {upvotes || 0}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            text="Upvote"
            onClick={handleUpvote}
            className="bookish-button-enhanced bg-[var(--accent)] text-white"
            disabled={isUpvoting || !profile?.user?.id}
            isLoading={isUpvoting}
          />
          <Button
            text="Reply"
            onClick={handleReply}
            className="bookish-button-enhanced bg-orange-600 text-white"
            disabled={!profile?.user?.id}
          />
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

export default DiscussionPost;
