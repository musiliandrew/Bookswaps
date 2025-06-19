import React from 'react';
import { Link } from 'react-router-dom';

const SocietyList = ({ societies, isSocietiesLoading, listSocieties, societiesPagination }) => {
  return (
    <div>
      {isSocietiesLoading ? (
        <div>Loading societies...</div>
      ) : (
        <>
          {societies.map(society => (
            <Link to={`/chat/society/${society.id}`} key={society.id}>
              <div className="bg-white p-4 rounded shadow mb-2">
                <h3 className="text-xl font-bold">{society.name}</h3>
                <p className="text-sm text-gray-600">{society.description}</p>
                <p className="text-sm text-gray-600">Members: {society.member_count}</p>
                <p className="text-sm text-gray-600">Visibility: {society.visibility}</p>
              </div>
            </Link>
          ))}
          <div className="flex gap-2">
            <button
              onClick={() => listSocieties({}, societiesPagination.societies.page - 1)}
              disabled={!societiesPagination.societies.previous}
              className="p-2 bg-gray-200 rounded"
            >
              Previous
            </button>
            <button
              onClick={() => listSocieties({}, societiesPagination.societies.page + 1)}
              disabled={!societiesPagination.societies.next}
              className="p-2 bg-gray-200 rounded"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SocietyList;