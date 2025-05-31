import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDiscussions } from '../hooks/useDiscussions';
import { useWebSocket } from '../hooks/useWebSocket.js';
import { NoteForm } from '../components/discussions/NoteForm';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth.js';
import { toast } from 'react-toastify';

const DiscussionDetailPage = () => {
  const { discussionId } = useParams();
  const { addComment, getPost, reactToComment, isLoading, error } = useDiscussions();
  const { isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const { messages: wsComments, reactions: wsReactions } = useWebSocket(discussionId);

  useEffect(() => {
    const fetchPost = async () => {
      const data = await getPost(discussionId);
      if (data) setPost(data);
    };
    fetchPost();
  }, [discussionId, getPost]);

  // Merge WebSocket comments with post comments
  const allComments = [
    ...(post?.comments || []),
    ...wsComments.filter(
      (wsComment) => !post?.comments?.some((c) => c.id === wsComment.id)
    ),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Apply real-time reactions to comments
  const commentsWithReactions = allComments.map((comment) => {
    const commentReactions = wsReactions
      .filter((r) => r.comment_id === comment.id)
      .reduce(
        (acc, r) => ({
          ...acc,
          [`${r.reaction_type}_count`]: r.count,
        }),
        { like_count: comment.reactions?.like_count || 0, love_count: comment.reactions?.love_count || 0, laugh_count: comment.reactions?.laugh_count || 0 }
      );
    return {
      ...comment,
      reactions: commentReactions,
    };
  });

  const handleCommentSubmit = async (content) => {
    await addComment(discussionId, content);
    const data = await getPost(discussionId);
    if (data) setPost(data);
  };

  const handleCommentReaction = async (commentId, reaction) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to react to comments');
      return;
    }
    const success = await reactToComment(commentId, reaction);
    if (success) {
      const data = await getPost(discussionId);
      if (data) setPost(data);
    }
  };

  if (!post) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4 bookish-gradient">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-600 mb-4">{post.content}</p>
      <p className="text-sm text-gray-500 mb-4">
        By {post.author?.username || 'Anonymous'} • {new Date(post.timestamp).toLocaleString()}
      </p>
      <p className="text-sm text-gray-500">
        Likes: {post.reactions?.like_count || 0}
      </p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-2">Comments</h2>
      <div className="space-y-4 mb-4">
        {commentsWithReactions.length ? (
          commentsWithReactions.map((comment) => (
            <div key={comment.id} className="bookish-shadow p-2 bg-white rounded-lg">
              <p className="text-sm text-gray-500">
                {comment.author?.username || 'Anonymous'} • {new Date(comment.timestamp).toLocaleString()}
              </p>
              <p>{comment.content}</p>
              <div className="flex space-x-2 mt-2">
                <Button
                  onClick={() => handleCommentReaction(comment.id, 'like')}
                  className="bookish-button-enhanced text-sm px-2 py-1"
                  disabled={!isAuthenticated}
                >
                  👍 {comment.reactions?.like_count || 0}
                </Button>
                <Button
                  onClick={() => handleCommentReaction(comment.id, 'love')}
                  className="bookish-button-enhanced text-sm px-2 py-1"
                  disabled={!isAuthenticated}
                >
                  ❤️ {comment.reactions?.love_count || 0}
                </Button>
                <Button
                  onClick={() => handleCommentReaction(comment.id, 'laugh')}
                  className="bookish-button-enhanced text-sm px-2 py-1"
                  disabled={!isAuthenticated}
                >
                  😂 {comment.reactions?.laugh_count || 0}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}
      </div>
      
      <NoteForm onSubmit={handleCommentSubmit} isLoading={isLoading} />
    </div>
  );
};

export default DiscussionDetailPage;