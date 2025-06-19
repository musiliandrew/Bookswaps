import React from 'react';
import { Link } from 'react-router-dom';

const TopPostsSidebar = ({ topPosts }) => {
  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Top Posts</h3>
      {topPosts.map(post => (
        <div key={post.id} className="bg-white p-2 rounded shadow mb-2">
          <Link to={`/discussions/post/${post.id}`}>
            <h4 className="font-bold">{post.title}</h4>
          </Link>
          <p className="text-sm text-gray-600">Upvotes: {post.upvotes} | Notes: {post.note_count}</p>
        </div>
      ))}
    </div>
  );
};

export default TopPostsSidebar;