import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { toast } from 'react-toastify';
import { useChat } from '../../hooks/useChat';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAuth } from '../../hooks/useAuth';
import { useDiscussions } from '../../hooks/useDiscussions';
import SocietyForm from '../../components/chats/SocietyForm'; // Fixed import
import Button from '../../components/common/Button';
import { api } from '../../utils/api';

const SocietyPage = () => {
  const { societyId } = useParams();
  const { getMessages, messages: initialMessages, isLoading, error } = useChat();
  const { messages: wsMessages, sendMessage } = useWebSocket(societyId);
  const { profile } = useAuth();
  const { createPost } = useDiscussions();
  const [society, setSociety] = useState(null);
  const [combinedMessages, setCombinedMessages] = useState([]);
  const [showShareCard, setShowShareCard] = useState(false);

  useEffect(() => {
    const fetchSociety = async () => {
      try {
        const response = await api.get(`/chats/societies/${societyId}/`);
        setSociety(response.data);
      } catch {
        toast.error('Failed to fetch society details');
      }
    };

    fetchSociety();
    getMessages(societyId);
  }, [societyId, getMessages]);

  useEffect(() => {
    const allMessages = [...initialMessages, ...wsMessages].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
    const uniqueMessages = Array.from(
      new Map(allMessages.map((msg) => [msg.id, msg])).values()
    );
    setCombinedMessages(uniqueMessages);

    if (uniqueMessages.length && profile?.messages_sent >= 10) {
      toast.success('🎉 Badge Earned: Chatty Reader (10 Messages)!');
    }
  }, [initialMessages, wsMessages, profile]);

  useEffect(() => {
    if (error) {
      toast.error(error || 'Error loading society data');
    }
  }, [error]);

  const handleDiscuss = async () => {
    if (!profile?.user?.id) {
      toast.warning('Please sign in to discuss');
      return;
    }
    if (!society?.book_id) {
      toast.info('No book associated with this society');
      return;
    }
    try {
      await createPost({
        content: `Let’s discuss ${society.name}’s book! What are your thoughts?`,
        book_id: society.book_id,
        society_id: societyId,
      });
      toast.success('Discussion posted!');
    } catch (err) {
      console.error('Discuss error:', err);
      toast.error('Failed to post discussion');
    }
  };

  const handleShare = () => {
    setShowShareCard(true);
  };

  if (isLoading && !society) {
    return (
      <motion.div
        className="text-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Loading...
      </motion.div>
    );
  }

  if (!society) {
    return (
      <motion.div
        className="text-center p-4 font-['Poppins'] text-[#333]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Society not found
      </motion.div>
    );
  }

  return (
    <motion.div
      className="container mx-auto p-4 bookish-gradient min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      role="main"
      aria-labelledby="society-title"
    >
      <div className="flex items-center gap-4 mb-6">
        {society.logo && (
          <img
            src={society.logo || '/assets/bookish.png'}
            alt={`${society.name} logo`}
            className="w-16 h-16 object-cover rounded"
            aria-hidden="true"
          />
        )}
        <motion.h1
          id="society-title"
          className="text-3xl font-bold font-['Playfair_Display'] text-[#FF6F61]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {society.name}
        </motion.h1>
      </div>
      <motion.p
        className="text-gray-600 mb-6 font-['Poppins']"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {society.description || 'No description'}
      </motion.p>

      <div className="flex justify-end gap-2 mb-4">
        {society.book_id && (
          <Button
            text="Discuss Book"
            onClick={handleDiscuss}
            className="bookish-button-enhanced bg-orange-600 hover:bg-orange-700"
            disabled={!society.is_member || !profile?.user?.id}
            aria-label={`Discuss book for ${society.name}`}
          />
        )}
        <Button
          text="Share Society"
          onClick={handleShare}
          className="bookish-button-enhanced bg-teal-600 hover:bg-teal-700"
          aria-label={`Share ${society.name}`}
        />
      </div>

      <motion.div
        className="bookish-shadow p-4 bg-white rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold mb-2 font-['Playfair_Display']">Messages</h2>
        <div className="space-y-4 max-h-[500px] overflow-y-auto" role="list">
          <AnimatePresence>
            {combinedMessages.length ? (
              combinedMessages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  className="bookish-shadow p-2 bg-gray-50 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  role="listitem"
                >
                  <p className="text-sm text-gray-500 font-['Poppins']">
                    {msg.sender?.username} • {new Date(msg.timestamp).toLocaleString()}
                  </p>
                  <p className="font-['Poppins']">{msg.content}</p>
                </motion.div>
              ))
            ) : (
              <motion.p
                className="text-center font-['Poppins'] text-[#333]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                No messages yet. Start the conversation!
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        {society.is_member && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <SocietyForm
              onSubmit={(content) => sendMessage({ content, societyId })}
              societyId={societyId}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </motion.div>

      {showShareCard && (
        <motion.div
          className="mt-8"
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
                <meshStandardMaterial color="#FF6F61" />
                <Text position={[0, 0.5, 0.1]} fontSize={0.2} color="white">
                  {society.name}
                </Text>
                <Text position={[0, 0, 0.1]} fontSize={0.15} color="white">
                  BookSwaps.io
                </Text>
              </mesh>
            </Canvas>
            <Button
              text="Share on X"
              onClick={() => console.log('Share to X')}
              className="mt-2 bg-blue-600 hover:bg-blue-700"
              aria-label={`Share ${society.name} on X`}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SocietyPage;