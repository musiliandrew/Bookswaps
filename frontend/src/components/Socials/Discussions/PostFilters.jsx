import React from 'react';

const PostFilters = ({ postFilters, setPostFilters }) => {
  return (
    <div className="mb-4">
      <select
        value={postFilters.type}
        onChange={e => setPostFilters({ ...postFilters, type: e.target.value })}
        className="p-2 border rounded mr-2"
      >
        <option value="">All Types</option>
        <option value="Article">Article</option>
        <option value="Synopsis">Synopsis</option>
        <option value="Query">Query</option>
      </select>
      <input
        type="text"
        value={postFilters.book_id}
        onChange={e => setPostFilters({ ...postFilters, book_id: e.target.value })}
        className="p-2 border rounded mr-2"
        placeholder="Book ID"
      />
      <input
        type="text"
        value={postFilters.tag}
        onChange={e => setPostFilters({ ...postFilters, tag: e.target.value })}
        className="p-2 border rounded"
        placeholder="Tag"
      />
    </div>
  );
};

export default PostFilters;