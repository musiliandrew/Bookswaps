import React from 'react';

const SocietyCreationForm = ({ newSociety, setNewSociety, handleCreateSociety }) => {
  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="text-xl font-bold mb-2">Create a New Society</h3>
      <input
        type="text"
        value={newSociety.name}
        onChange={e => setNewSociety({ ...newSociety, name: e.target.value })}
        className="w-full p-2 border rounded mb-2"
        placeholder="Society Name"
      />
      <textarea
        value={newSociety.description}
        onChange={e => setNewSociety({ ...newSociety, description: e.target.value })}
        className="w-full p-2 border rounded mb-2"
        placeholder="Description"
      />
      <select
        value={newSociety.visibility}
        onChange={e => setNewSociety({ ...newSociety, visibility: e.target.value })}
        className="w-full p-2 border rounded mb-2"
      >
        <option value="public">Public</option>
        <option value="private">Private</option>
      </select>
      <select
        value={newSociety.focus_type}
        onChange={e => setNewSociety({ ...newSociety, focus_type: e.target.value })}
        className="w-full p-2 border rounded mb-2"
      >
        <option value="">No Focus</option>
        <option value="Book">Book</option>
        <option value="Genre">Genre</option>
      </select>
      <input
        type="text"
        value={newSociety.focus_id}
        onChange={e => setNewSociety({ ...newSociety, focus_id: e.target.value })}
        className="w-full p-2 border rounded mb-2"
        placeholder="Focus ID (optional)"
      />
      <button onClick={handleCreateSociety} className="bg-[var(--accent)] text-white p-2 rounded">
        Create Society
      </button>
    </div>
  );
};

export default SocietyCreationForm;