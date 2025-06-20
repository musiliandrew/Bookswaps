import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SocietyFilters from './SocietyFilters';

const SocietyList = ({ societies, isSocietiesLoading, joinSociety, listSocieties, societyFilters, setSocietyFilters, societiesPagination }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4"
    >
      <SocietyFilters societyFilters={societyFilters} setSocietyFilters={setSocietyFilters} />
      {isSocietiesLoading ? (
        <div className="text-center">Loading societies...</div>
      ) : societies.length === 0 ? (
        <div className="text-center">No societies found. Try adjusting filters.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {societies.map(society => {
            console.log('Society:', society); // Debug log
            return (
              <div key={society.id} className="bg-white p-4 rounded shadow">
                <Link to={`/discussions/society/${society.id}`}>
                  <h3 className="text-xl font-bold">{society.name}</h3>
                </Link>
                <p>{society.description}</p>
                <p className="text-sm text-gray-600">Members: {society.member_count}</p>
                <button
                  onClick={() => joinSociety(society.id)}
                  className="mt-2 bg-[var(--accent)] text-white p-2 rounded disabled:opacity-50"
                  disabled={society.is_member || society.visibility === 'private'}
                  title={society.is_member ? 'Already a member' : society.visibility === 'private' ? 'Private society' : 'Join society'}
                >
                  {society.visibility === 'private' ? 'Private' : society.is_member ? 'Joined' : 'Join'}
                </button>
              </div>
            );
          })}
        </div>
      )}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => listSocieties(societyFilters, societiesPagination.societies.page)}
          className="p-2 bg-[var(--accent)] text-white rounded"
        >
          Refresh
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => listSocieties(societyFilters, societiesPagination.societies.page - 1)}
            disabled={!societiesPagination.societies.previous}
            className="p-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => listSocieties(societyFilters, societiesPagination.societies.page + 1)}
            disabled={!societiesPagination.societies.next}
            className="p-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SocietyList;