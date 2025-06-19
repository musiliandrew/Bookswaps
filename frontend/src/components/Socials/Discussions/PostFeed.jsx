import React from 'react';
import { Link } from 'react-router-dom';

const PostFeed = ({ posts, isDiscussionsLoading, listPosts, postFilters, discussionsPagination }) => {
  return (
    <div>
      {isDiscussionsLoading ? (
        <div>Loading posts...</div>
      ) : (
        <>
          {posts && posts.length > 0 ? (
            posts.map(post => (
              <div key={post.id} className="bg-white p-4 rounded shadow mb-4">
                <Link to={`/discussions/post/${post.id}`}>
                  <h3 className="text-xl font-bold">{post.title}</h3>
                </Link>
                {/* Fixed: Access username property instead of rendering the user object */}
                <p className="text-gray-600">
                  By {post.user?.username || post.user || 'Unknown User'}
                </p>
                <p>{post.content?.substring(0, 100)}...</p>
                <div className="flex gap-2 text-sm text-gray-600">
                  <span>Upvotes: {post.upvotes || 0}</span>
                  <span>Notes: {post.note_count || 0}</span>
                  <span>Reprints: {post.reprint_count || 0}</span>
                </div>
              </div>
            ))
          ) : (
            <div>No posts available</div>
          )}
          {discussionsPagination?.posts && (
            <div className="flex gap-2">
              <button
                onClick={() => listPosts(postFilters, discussionsPagination.posts.page - 1)}
                disabled={!discussionsPagination.posts.previous}
                className="p-2 bg-gray-200 rounded"
              >
                Previous
              </button>
              <button
                onClick={() => listPosts(postFilters, discussionsPagination.posts.page + 1)}
                disabled={!discussionsPagination.posts.next}
                className="p-2 bg-gray-200 rounded"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PostFeed;