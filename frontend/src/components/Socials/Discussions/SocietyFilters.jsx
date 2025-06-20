import React from 'react';

const SocietyFilters = ({ societyFilters, setSocietyFilters }) => {
  const handleFocusId = (e) => {
    const value = e.target.value;
    if (value && !/^\d+$/.test(value)) return; // Allow only numeric IDs
    setSocietyFilters({ ...societyFilters, focus_id: value });
  };

  const resetFilters = () => {
    setSocietyFilters({ focus_type: '', focus_id: '', my_societies: false });
  };

  return (
    <div className="mb-4 flex items-center gap-2">
      <select
        value={societyFilters.focus_type || ''}
        onChange={e => setSocietyFilters({ ...societyFilters, focus_type: e.target.value || undefined })}
        className="p-2 border rounded"
      >
        <option value="">All Focus Types</option>
        <option value="Book">Book</option>
        <option value="Genre">Genre</option>
      </select>
      <input
        type="text"
        value={societyFilters.focus_id || ''}
        onChange={handleFocusId}
        className="p-2 border rounded"
        placeholder="Focus ID (e.g., 123)"
      />
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={societyFilters.my_societies || false}
          onChange={e => setSocietyFilters({ ...societyFilters, my_societies: e.target.checked })}
          className="mr-2"
        />
        My Societies
      </label>
      <button
        onClick={resetFilters}
        className="p-2 bg-gray-200 rounded"
      >
        Reset
      </button>
    </div>
  );
};

export default SocietyFilters;