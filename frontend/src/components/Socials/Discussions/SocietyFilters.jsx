import React from 'react';

const SocietyFilters = ({ societyFilters, setSocietyFilters }) => {
  return (
    <div className="mb-4">
      <select
        value={societyFilters.focus_type}
        onChange={e => setSocietyFilters({ ...societyFilters, focus_type: e.target.value })}
        className="p-2 border rounded mr-2"
      >
        <option value="">All Focus Types</option>
        <option value="Book">Book</option>
        <option value="Genre">Genre</option>
      </select>
      <input
        type="text"
        value={societyFilters.focus_id}
        onChange={e => setSocietyFilters({ ...societyFilters, focus_id: e.target.value })}
        className="p-2 border rounded mr-2"
        placeholder="Focus ID"
      />
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={societyFilters.my_societies}
          onChange={e => setSocietyFilters({ ...societyFilters, my_societies: e.target.checked })}
          className="mr-2"
        />
        My Societies
      </label>
    </div>
  );
};

export default SocietyFilters;