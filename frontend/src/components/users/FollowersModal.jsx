import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

function FollowersModal({ isOpen, onClose, type, userId, getList, list, isLoading, error }) {
  useEffect(() => {
    if (isOpen && userId) {
      getList(userId, type);
    }
  }, [isOpen, userId, type, getList]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--secondary)] p-6 rounded-md shadow max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-[var(--primary)]">
            {type === 'followers' ? 'Followers' : 'Following'}
          </h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        {isLoading ? (
          <p className="text-[var(--primary)]">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : list?.length ? (
          <ul className="space-y-2">
            {list.map((user) => (
              <li key={user.user_id}>
                <Link
                  to={`/users/${user.username}`}
                  className="text-[var(--primary)] hover:underline"
                  onClick={onClose}
                >
                  {user.username} {user.city && `(${user.city})`}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No {type} found.</p>
        )}
      </div>
    </div>
  );
}

export default FollowersModal;