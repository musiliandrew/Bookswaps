import { useNavigate } from 'react-router-dom';
import { useDiscussions } from '../../hooks/useDiscussions.js';
import { DiscussionForm } from '../../components/discussions/DiscussionForm';

const CreateDiscussionPage = () => {
  const navigate = useNavigate();
  const { createPost, isLoading, error } = useDiscussions();

  const handleSubmit = async (formData) => {
    const response = await createPost(formData);
    if (response) {
      navigate(`/discussions/${response.id}`); // Redirect to new discussion page
    }
  };

  return (
    <div className="container mx-auto p-4 bookish-gradient">
      <h1 className="text-3xl font-bold mb-4">Start a Discussion</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <DiscussionForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
};

export default CreateDiscussionPage;