import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDiscussions } from '../../hooks/useDiscussions';
import { useAuth } from '../../hooks/useAuth';
import Input from '../Common/Input';
import Button from '../Common/Button';
import ErrorMessage from '../Common/ErrorMessage';
import Tilt from 'react-parallax-tilt';
import { toast } from 'react-toastify';

const DiscussionNotes = ({ discussionId, className = '' }) => {
  const { notes, listNotes, addDiscussionNote, isLoading, error, pagination } = useDiscussions();
  const { profile } = useAuth();
  const [content, setContent] = useState('');
  const [expanded, setExpanded] = useState({});
  const observer = useRef();
  const particlesRef = useRef();

  useEffect(() => {
    listNotes(discussionId);
  }, [discussionId, listNotes]);

  useEffect(() => {
    if (particlesRef.current) {
      window.particlesJS(particlesRef.current.id, {
        particles: {
          number: { value: 50, density: { enable: true, value_area: 800 } },
          color: { value: '#FFD700' },
          shape: { type: 'circle' },
          opacity: { value: 0.5, random: true },
          size: { value: 3, random: true },
          line_linked: { enable: false },
          move: { enable: true, speed: 2, direction: 'none', random: true, straight: false },
        },
        interactivity: { detect_on: 'canvas', events: { onhover: { enable: false }, onclick: { enable: false } } },
      });
    }
  }, []);

  const lastNoteRef = useRef();
  useEffect(() => {
    if (isLoading || !pagination.notes.next) return;

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        listNotes(discussionId, pagination.notes.page + 1);
      }
    });

    const currentLastNote = lastNoteRef.current;

    if (currentLastNote) {
      observer.current.observe(currentLastNote);
    }

    return () => {
      if (observer.current && currentLastNote) {
        observer.current.unobserve(currentLastNote);
      }
    };
  }, [isLoading, pagination.notes, listNotes, discussionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile?.user?.id) {
      toast.error('Please sign in to comment');
      return;
    }
    if (!content.trim()) {
      toast.error('Comment is required');
      return;
    }
    try {
      await addDiscussionNote(discussionId, { content });
      setContent('');
      toast.success('Comment posted!');
    } catch {
      toast.error('Failed to post comment');
    }
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (error) return <ErrorMessage message={error} />;

  return (
    <motion.div
      className={`bookish-glass p-6 rounded-xl relative ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div
        id="particles-js"
        ref={particlesRef}
        className="absolute inset-0 z-0 opacity-20"
        style={{ pointerEvents: 'none' }}
      ></div>
      <div className="relative z-10">
        <h3 className="text-xl font-['Lora'] text-gradient mb-4">Comments</h3>
        {notes.length === 0 ? (
          <p className="text-[var(--text)] font-['Open_Sans']">No comments yet.</p>
        ) : (
          notes.map((note, index) => (
            <Tilt key={note.id} tiltMaxAngleX={5} tiltMaxAngleY={5}>
              <motion.div
                ref={index === notes.length - 1 ? lastNoteRef : null}
                className="mb-4 p-4 bookish-glass rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <p className="text-sm font-['Open_Sans'] text-[var(--text)]">{note.content}</p>
                <p className="text-xs text-gray-500 font-['Open_Sans']">
                  By {note.author?.username || 'Anonymous'} •{' '}
                  {new Date(note.timestamp).toLocaleString()}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button
                    text={expanded[note.id] ? 'Collapse' : 'Expand'}
                    onClick={() => toggleExpand(note.id)}
                    className="bookish-button-enhanced bg-gray-600 text-white text-xs"
                  />
                </div>
                {expanded[note.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-xs text-[var(--text)] font-['Open_Sans'] mt-2">
                      Likes: {note.likes || 0}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </Tilt>
          ))
        )}
        {isLoading && (
          <div className="text-center">
            <div className="bookish-spinner mx-auto w-6 h-6 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-4">
          <Input
            placeholder="Add a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bookish-input mb-2"
            type="textarea"
            rows={3}
          />
          <Button
            type="submit"
            text="Post Comment"
            className="bookish-button-enhanced bg-[var(--accent)] text-white"
            disabled={isLoading || !content.trim()}
          />
        </form>
      </div>
    </motion.div>
  );
};

export default DiscussionNotes;