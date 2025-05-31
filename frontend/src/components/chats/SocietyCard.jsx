import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';

const SocietyCard = ({ society, onJoin }) => {
  const { id, name, description, member_count, visibility, is_member } = society;

  return (
    <div className="bookish-shadow p-4 bg-white rounded-lg">
      <Link to={`/societies/${id}`} className="text-xl font-semibold text-gradient hover:underline">
        {name}
      </Link>
      <p className="text-gray-600 mt-2">{description || 'No description available'}</p>
      <div className="mt-2 text-sm text-gray-500">
        <p>Members: {member_count}</p>
        <p>Visibility: {visibility === 'public' ? 'Public' : 'Private'}</p>
      </div>
      {visibility === 'public' && !is_member && (
        <Button
          onClick={() => onJoin(id)}
          className="bookish-button-enhanced mt-4"
          disabled={is_member}
        >
          Join Society
        </Button>
      )}
      {is_member && (
        <p className="mt-4 text-success">You are a member</p>
      )}
    </div>
  );
};

export default SocietyCard;