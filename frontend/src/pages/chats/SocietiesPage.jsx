import { useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { SocietyCard } from '../components/chats/SocietyCard';
import { Link } from 'react-router-dom';

const SocietiesPage = () => {
  const { getSocieties, joinSociety, societies, isLoading, error } = useChat();

  useEffect(() => {
    getSocieties();
  }, [getSocieties]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!societies.length) return <div>No societies found. <Link to="/societies/new" className="text-primary hover:underline">Create one!</Link></div>;

  return (
    <div className="container mx-auto p-4 bookish-gradient">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Book Societies</h1>
        <Link to="/societies/new" className="bookish-button-enhanced px-4 py-2 rounded">
          Create Society
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {societies.map((society) => (
          <SocietyCard
            key={society.id}
            society={society}
            onJoin={joinSociety}
          />
        ))}
      </div>
    </div>
  );
};

export default SocietiesPage;