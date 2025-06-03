import { useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input'; 
import Button from '../../components/common/Button';

const NoteForm = ({ onSubmit, isLoading, parentPost = {} }) => {
  const { isAuthenticated, profile } = useAuth();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [showShareCard, setShowShareCard] = useState(false);

  const validateContent = () => {
    if (!content.trim()) {
      setError('Comment is required');
      return false;
    }
    if (content.length > 1000) {
      setError('Comment cannot exceed 1000 characters');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to comment');
      return;
    }
    if (!validateContent()) {
      return;
    }
    try {
      await onSubmit({
        content,
        parent_id: parentPost?.id,
        book_id: parentPost?.book_id,
        society_id: parentPost?.society_id,
      });
      toast.success('Comment posted!');
      setShowShareCard(true);
      if (profile?.notes_posted >= 5) {
        toast.success('🎉 Badge Earned: Active Commenter (5 Notes)!');
      }
      setContent('');
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Failed to post comment');
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="mt-4 bg-white p-4 rounded-lg bookish-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="form"
      aria-labelledby="note-form-title"
    >
      <motion.h3
        id="note-form-title"
        className="text-lg font-['Playfair_Display'] text-[var(--primary)] mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Add a Comment
      </motion.h3>
      <Input
        label="Comment"
        name="content"
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setError('');
        }}
        placeholder="Add a comment..."
        className="bookish-input w-full"
        type="textarea"
        rows={3}
        disabled={isLoading || !isAuthenticated}
        error={error}
        aria-required="true"
        aria-describedby={error ? 'content-error' : undefined}
      />
      <Button
        type="submit"
        text={isLoading ? 'Posting...' : 'Post Comment'}
        className="bookish-button-enhanced mt-2 bg-[var(--primary)] hover:bg-[var(--accent)]"
        disabled={isLoading || !content.trim() || !isAuthenticated}
        aria-disabled={isLoading || !content.trim() || !isAuthenticated}
      />
      {showShareCard && (
        <motion.div
          className="mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-64 w-full bookish-shadow">
            <Canvas>
              <ambientLight />
              <OrbitControls />
              <mesh>
                <boxGeometry args={[3, 2, 0.1]} />
                <meshStandardMaterial color="var(--primary)" />
                <Text position={[0, 0.5, 0.1]} fontSize={0.2} color="white">
                  New Comment
                </Text>
                <Text position={[0, 0, 0.1]} fontSize={0.15} color="white">
                  {parentPost?.title || 'BookSwaps.io'}
                </Text>
              </mesh>
            </Canvas>
            <Button
              text="Share on X"
              onClick={() => console.log('Share to X')}
              className="mt-2 bg-blue-600 hover:bg-blue-700"
              aria-label="Share new comment on X"
            />
          </div>
        </motion.div>
      )}
    </motion.form>
  );
};

export default NoteForm;