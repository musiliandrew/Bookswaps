import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDiscussions } from '../hooks/useDiscussions';
import { DiscussionCard } from '../components/discussions/DiscussionCard';

const DiscussionsPage = () => {
  const { getPosts, posts, isLoading, error } = useDiscussions();

  useEffect(() => {
    getPosts();
  }, [getPosts]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!posts.length) return <div>No discussions found. <Link to="/discussions/new" className="text-primary hover:underline">Start one!</Link></div>;

  return (
    <div className="container mx-auto p-4 bookish-gradient">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Discussions</h1>
        <Link to="/discussions/new" className="bookish-button-enhanced px-4 py-2 rounded">
          New Discussion
        </Link>
      </div>
      <div className="space-y-4">
        {posts.map((post) => (
          <DiscussionCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default DiscussionsPage;