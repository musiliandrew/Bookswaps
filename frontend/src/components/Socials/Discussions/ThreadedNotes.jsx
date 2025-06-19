import React from 'react';

const ThreadedNotes = ({ notes, handleAddNote, newNote, setNewNote, likeDiscussionNote }) => {
  const renderNotes = (notes, parentId = null, depth = 0) => {
    return notes
      .filter(note => note.parent_note === parentId)
      .map(note => (
        <div key={note.id} className={`ml-${depth * 4} p-2 border-l-2`}>
          <p>{note.content}</p>
          <div className="flex gap-2 text-sm text-gray-600">
            <button onClick={() => likeDiscussionNote(note.id)}>
              Like ({note.likes || 0})
            </button>
            <button onClick={() => setNewNote(`Reply to ${note.id}`)}>
              Reply
            </button>
          </div>
          {newNote.startsWith(`Reply to ${note.id}`) && (
            <form onSubmit={e => handleAddNote(e, note.id)} className="mt-2">
              <textarea
                value={newNote.replace(`Reply to ${note.id}`, '')}
                onChange={e => setNewNote(`Reply to ${note.id}${e.target.value}`)}
                className="w-full p-2 border rounded"
                placeholder="Write a reply..."
              />
              <button type="submit" className="mt-2 bg-blue-500 text-white p-2 rounded">
                Submit Reply
              </button>
            </form>
          )}
          {renderNotes(notes, note.id, depth + 1)}
        </div>
      ));
  };

  return (
    <>
      {renderNotes(notes)}
      <form onSubmit={handleAddNote} className="mt-4">
        <textarea
          value={newNote.startsWith('Reply to') ? '' : newNote}
          onChange={e => setNewNote(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Write a comment..."
        />
        <button type="submit" className="mt-2 bg-[var(--accent)] text-white p-2 rounded">
          Submit Comment
        </button>
      </form>
    </>
  );
};

export default ThreadedNotes;