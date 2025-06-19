import React from 'react';

const PostCreationForm = ({ newPost, setNewPost, handleCreatePost }) => {
  return (
    <form onSubmit={handleCreatePost} className="bg-white p-4 rounded shadow mb-4">
      <h3 className="text-xl font-bold mb-2">Create a Post</h3>
      <input
        type="text"
        value={newPost.title}
        onChange={e => setNewPost({ ...newPost, title: e.target.value })}
        className="w-full p-2 border rounded mb-2"
        placeholder="Title"
      />
      <textarea
        value={newPost.content}
        onChange={e => setNewPost({ ...newPost, content: e.target.value })}
        className="w-full p-2 border rounded mb-2"
        placeholder="Content"
      />
      <select
        value={newPost.type}
        onChange={e => setNewPost({ ...newPost, type: e.target.value })}
        className="w-full p-2 border rounded mb-2"
      >
        <option value="Article">Article</option>
        <option value="Synopsis">Synopsis</option>
        <option value="Query">Query</option>
      </select>
      <input
        type="text"
        value={newPost.book_id}
        onChange={e => setNewPost({ ...newPost, book_id: e.target.value })}
        className="w-full p-2 border rounded mb-2"
        placeholder="Book ID"
      />
      <input
        type="text"
        value={newPost.tags}
        onChange={e => setNewPost({ ...newPost, tags: e.target.value })}
        className="w-full p-2 border rounded mb-2"
        placeholder="Tags (comma-separated)"
      />
      <input
        type="text"
        value={newPost.media_urls}
        onChange={e => setNewPost({ ...newPost, media_urls: e.target.value })}
        className="w-full p-2 border rounded mb-2"
        placeholder="Media URLs (comma-separated)"
      />
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={newPost.spoiler}
          onChange={e => setNewPost({ ...newPost, spoiler: e.target.checked })}
          className="mr-2"
        />
        Spoiler
      </label>
      <button type="submit" className="mt-2 bg-[var(--accent)] text-white p-2 rounded">
        Create Post
      </button>
    </form>
  );
};

export default PostCreationForm;