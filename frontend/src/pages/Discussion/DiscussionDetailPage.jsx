import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { useDiscussions } from '../../hooks/useDiscussions';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAuth } from '../../hooks/useAuth';
import NoteForm from '../../components/discussions/NoteForm'; 
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const DiscussionDetailPage = () => {
  const { discussionId } = useParams();
  const { addComment, getPost, reactToComment, isLoading, error } = useDiscussions();
  const { isAuthenticated, profile } = useAuth();
  const [post, setPost] = useState(null);
  const { messages: wsComments, reactions: wsReactions } = useWebSocket(discussionId);
  const [showShareCard, setShowShareCard] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPost(discussionId);
        if (data) setPost(data);
      } catch (err) {
        console.error('Fetch post error:', err);
        toast.error('Failed to load discussion');
      }
    };
    fetchPost();
  }, [discussionId, getPost]);

  useEffect(() => {
    if (error) {
      toast.error(error || 'Error loading discussion');
    }
  }, [error]);

  const allComments = [
    ...(post?.comments || []),
    ...wsComments.filter(
      (wsComment) => !post?.comments?.some((c) => c.id === wsComment.id)
    ),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const commentsWithReactions = allComments.map((comment) => {
    const commentReactions = wsReactions
      .filter((r) => r.comment_id === comment.id)
      .reduce(
        (acc, r) => ({
          ...acc,
          [`${r.reaction_type}_count`]: r.count,
        }),
        { like_count: comment.reactions?.like_count || 0, love_count: 0, laugh_count: 0 }
      );
    return { ...comment, reactions: commentReactions };
  });

  const handleCommentSubmit = async (commentData) => {
    try {
      await addComment(discussionId, commentData);
      const data = await getPost(discussionId);
      if (data) setPost(data);
      if (profile?.notes_posted >= 5) {
        toast.success('🎉 Badge Earned: Active Commenter (5 Notes)!');
      }
    } catch (err) {
      console.error('Comment error:', err);
      toast.error('Failed to post comment');
    }
  };

  const handleCommentReaction = async (commentId, reaction) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to react to comments');
      return;
    }
    try {
      const success = await reactToComment(commentId, reaction);
      if (success) {
        const data = await getPost(discussionId);
        if (data) setPost(data);
        if (profile?.reactions_given >= 10) {
          toast.success('🎉 Badge Earned: Reaction Master (10 Reactions)!');
        }
      }
    } catch (err) {
      console.error('Reaction error:', err);
      toast.error('Failed to react to comment');
    }
  };

  const handleShare = () => {
    setShowShareCard(true);
  };

  if (isLoading && !post) {
    return (
      <motion.div
        className="text-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Loading...
      </motion.div>
    );
  }

  if (!post) {
    return (
      <motion.div
        className="text-center p-4 font-['Poppins'] text-[var(--text)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Discussion not found
      </motion.div>
    );
  }

  return (
    <motion.div
      className="container mx-auto p-4 bookish-gradient min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      role="main"
      aria-labelledby="discussion-title"
    >
      <div className="bookish-shadow p-4 bg-white rounded-lg mb-4">
        <motion.h1
          id="discussion-title"
          className="text-3xl font-bold font-['Playfair_Display'] text-[var(--primary)] mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {post.title}
        </motion.h1>
        {post.image && (
          <motion.img
            src={post.image}
            alt={`${post.title} image`}
            className="w-full h-48 object-cover rounded mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            aria-hidden="true"
          />
        )}
        <motion.p
          className="text-gray-600 font-['Poppins'] mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {post.content}
        </motion.p>
        <motion.div
          className="text-sm text-gray-500 font-['Poppins'] mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <p>
            By {post.author?.username || 'Anonymous'} • {new Date(post.timestamp).toLocaleString()}
          </p>
          <p>Likes: {post.reactions?.like_count || 0}</p>
        </motion.div>
        <div className="flex gap-2">
          {(post.book_id || post.society_id) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {post.book_id && (
                <Link
                  to={`/books/${post.book_id}`}
                  className="text-[var(--primary)] hover:underline font-['Poppins']"
                  aria-label={`View book related to ${post.title}`}
                >
                  View Book
                </Link>
              )}
              {post.book_id && post.society_id && ' | '}
              {post.society_id && (
                <Link
                  to={`/societies/${post.society_id}`}
                  className="text-[var(--primary)] hover:underline font-['Poppins']"
                  aria-label={`View society related to ${post.title}`}
                >
                  View Society
                </Link>
              )}
            </motion.div>
          )}
          <Button
            text="Share"
            onClick={handleShare}
            className="bookish-button-enhanced bg-teal-600 hover:bg-teal-700"
            aria-label={`Share discussion ${post.title}`}
          />
        </div>
      </div>

      <motion.h2
        className="text-2xl font-semibold font-['Playfair_Display'] mt-6 mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        Comments
      </motion.h2>
      <div className="space-y-4 mb-4" role="list">
        <AnimatePresence>
          {commentsWithReactions.length ? (
            commentsWithReactions.map((comment, index) => (
              <motion.div
                key={comment.id}
                className="bookish-shadow p-2 bg-white rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                role="listitem"
              >
                <p className="text-sm text-gray-500 font-['Poppins']">
                  {comment.author?.username || 'Anonymous'} • {new Date(comment.timestamp).toLocaleString()}
                </p>
                <p className="font-['Poppins']">{comment.content}</p>
                <div className="flex space-x-2 mt-2">
                  <Button
                    text={`👍 ${comment.reactions?.like_count || 0}`}
                    onClick={() => handleCommentReaction(comment.id, 'like')}
                    className="bookish-button-enhanced text-sm px-2 py-1 bg-[var(--primary)] hover:bg-[var(--accent)]"
                    disabled={!isAuthenticated}
                    aria-label={`Like comment by ${comment.author?.username || 'Anonymous'}`}
                  />
                  <Button
                    text={`❤️ ${comment.reactions?.love_count || 0}`}
                    onClick={() => handleCommentReaction(comment.id, 'love')}
                    className="bookish-button-enhanced text-sm px-2 py-1 bg-[var(--primary)] hover:bg-[var(--accent)]"
                    disabled={!isAuthenticated}
                    aria-label={`Love comment by ${comment.author?.username || 'Anonymous'}`}
                  />
                  <Button
                    text={`😂 ${comment.reactions?.laugh_count || 0}`}
                    onClick={() => handleCommentReaction(comment.id, 'laugh')}
                    className="bookish-button-enhanced text-sm px-2 py-1 bg-[var(--primary)] hover:bg-[var(--accent)]"
                    disabled={!isAuthenticated}
                    aria-label={`Laugh at comment by ${comment.author?.username || 'Anonymous'}`}
                  />
                </div>
              </motion.div>
            ))
          ) : (
            <motion.p
              className="text-center font-['Poppins'] text-[var(--text)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              No comments yet. Be the first to comment!
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <NoteForm
        onSubmit={handleCommentSubmit}
        isLoading={isLoading}
        parentPost={{ id: post.id, title: post.title, book_id: post.book_id, society_id: post.society_id }}
      />

      {showShareCard && (
        <motion.div
          className="mt-8"
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
                <meshStandardMaterial color="var(--primary)" />
                <Text position={[0, 0.5, 0.1]} fontSize={0.2} color="white">
                  {post.title}
                </Text>
                <Text position={[0, 0, 0.1]} fontSize={0.15} color="white">
                  BookSwaps.io
                </Text>
              </mesh>
            </Canvas>
            <Button
              text="Share on X"
              onClick={() => console.log('Share to X')}
              className="mt-2 bg-blue-600 hover:bg-blue-700"
              aria-label={`Share discussion ${post.title} on X`}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DiscussionDetailPage;