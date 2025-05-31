import { Link } from 'react-router-dom';
import { Button } from '../components/common';
import { useDiscussions } from '../hooks/useDiscussions';

const DiscussionCard = ({ post }) => {
  const { id, title, content, author, timestamp, reactions } = post;
  const { reactToPost } = useDiscussions();

  const handleLike = () => {
    reactToPost(id, 'like');
  };

  return (
    <div className="bookish-shadow p-4 bg-white rounded-lg">
      <Link to={`/discussions/${id}`} className="text-xl font-semibold text-gradient hover:underline">
        {title}
      </Link>
      <p className="text-gray-600 mt-2">{content.substring(0, 200)}...</p>
      <div className="mt-2 text-sm text-gray-500">
        <p>By {author?.username || 'Anonymous'} • {new Date(timestamp).toLocaleString()}</p>
        <p>Likes: {reactions?.like_count || 0}</p>
      </div>
      <Button
        onClick={handleLike}
        className="bookish-button-enhanced mt-4"
      >
        Like
      </Button>
    </div>
  );
};

export default DiscussionCard;