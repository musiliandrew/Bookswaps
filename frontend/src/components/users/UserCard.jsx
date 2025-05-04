import { Link } from 'react-router-dom';

function UserCard({ user }) {
  return (
    <div className="bg-[var(--secondary)] p-4 rounded-md shadow bookish-border hover:scale-105 transition-transform">
      <h3 className="text-lg font-semibold text-[var(--primary)]">
        {user.username}
      </h3>
      <p className="mt-2 text-sm text-gray-600">
        City: {user.city || 'Not set'}
      </p>
      <div className="mt-2">
        <label className="block text-sm font-medium text-[var(--primary)]">
          Favorite Genres
        </label>
        <div className="mt-1 flex flex-wrap gap-2">
          {user.genres?.length ? (
            user.genres.map((genre) => (
              <span
                key={genre}
                className="bg-[var(--primary)] text-[var(--secondary)] px-2 py-1 rounded-full text-xs"
              >
                {genre}
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-600">No genres selected</p>
          )}
        </div>
      </div>
      <Link
        to={`/users/${user.username}`}
        className="mt-4 block text-center bg-[var(--primary)] text-[var(--secondary)] font-medium py-2 px-4 rounded hover:bg-opacity-90"
      >
        View Profile
      </Link>
    </div>
  );
}

export default UserCard;