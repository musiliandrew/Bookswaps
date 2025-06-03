import { useNavigate } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import { SocietyForm } from '../../components/chats/SocietyForm';

const CreateSocietyPage = () => {
  const navigate = useNavigate();
  const { createSociety, isLoading, error } = useChat();

  const handleSubmit = async (formData) => {
    const response = await createSociety(formData);
    if (response) {
      navigate(`/societies/${response.id}`); // Redirect to new society page
    }
  };

  return (
    <div className="container mx-auto p-4 bookish-gradient">
      <h1 className="text-3xl font-bold mb-4">Create a Society</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <SocietyForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
};

export default CreateSocietyPage;