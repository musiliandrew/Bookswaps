import React from 'react';
import { motion } from 'framer-motion';
import ThreadedNotes from './ThreadedNotes';

const PostDetail = ({ postId, post, showSpoiler, setShowSpoiler, upvoteDiscussionPost, reprintDiscussionPost, deletePost, navigate, isDiscussionsLoading, notes, handleAddNote, newNote, setNewNote, likeDiscussionNote }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-4 rounded shadow"
    >
      <h2 className="text-2xl font-bold">{post.title}</h2>
      <p className="text-gray-600">By {post.user}</p>
      <div className="flex gap-2 text-sm text-gray-600">
        <span>Upvotes: {post.upvotes}</span>
        <span>Notes: {post.note_count}</span>
        <span>Reprints: {post.reprint_count}</span>
      </div>
      {post.spoiler && !showSpoiler ? (
        <button
          onClick={() => setShowSpoiler(true)}
          className="text-[var(--accent)] underline"
        >
          Show Spoiler
        </button>
      ) : (
        <div className="mt-2" dangerouslySetInnerHTML={{ __html: post.content }} />
      )}
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => upvoteDiscussionPost(postId)}
          className="bg-[var(--accent)] text-white p-2 rounded"
        >
          Upvote
        </button>
        <button
          onClick={() => reprintDiscussionPost(postId, { comment: '' })}
          className="bg-green-500 text-white p-2 rounded"
        >
          Reprint
        </button>
        {post.is_owner && (
          <button
            onClick={() => deletePost(postId).then(() => navigate('/discussions'))}
            className="bg-red-500 text-white p-2 rounded"
          >
            Delete
          </button>
        )}
      </div>
      <h3 className="text-xl mt-4">Comments</h3>
      {isDiscussionsLoading ? (
        <div>Loading comments...</div>
      ) : (
        <ThreadedNotes
          notes={notes}
          handleAddNote={handleAddNote}
          newNote={newNote}
          setNewNote={setNewNote}
          likeDiscussionNote={likeDiscussionNote}
        />
      )}
    </motion.div>
  );
};

export default PostDetail;