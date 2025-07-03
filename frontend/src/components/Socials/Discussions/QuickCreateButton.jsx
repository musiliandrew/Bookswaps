import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
  PlusIcon,
  PencilSquareIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const QuickCreateButton = ({ onOpenModal }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragControls = useDragControls();
  const constraintsRef = useRef(null);

  // Get screen boundaries for dragging constraints
  useEffect(() => {
    const updateConstraints = () => {
      if (constraintsRef.current) {
        const rect = constraintsRef.current.getBoundingClientRect();
        const buttonSize = 56; // 14 * 4 = 56px (w-14 h-14)
        const margin = 16; // Margin from edges

        constraintsRef.current.style.left = `${margin}px`;
        constraintsRef.current.style.right = `${margin}px`;
        constraintsRef.current.style.top = `${margin}px`;
        constraintsRef.current.style.bottom = `${margin + 80}px`; // Extra space for bottom nav
      }
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, []);

  const quickActions = [
    {
      type: 'Article',
      icon: PencilSquareIcon,
      label: 'Article',
      color: 'from-blue-500 to-indigo-600',
      description: 'Share your thoughts'
    },
    {
      type: 'Synopsis',
      icon: BookOpenIcon,
      label: 'Review',
      color: 'from-green-500 to-emerald-600',
      description: 'Review a book'
    },
    {
      type: 'Query',
      icon: QuestionMarkCircleIcon,
      label: 'Question',
      color: 'from-purple-500 to-pink-600',
      description: 'Ask the community'
    }
  ];

  const handleQuickCreate = (type) => {
    setIsExpanded(false);
    onOpenModal(type);
  };

  return (
    <>
      {/* Drag constraints container */}
      <div
        ref={constraintsRef}
        className="fixed inset-0 pointer-events-none z-40"
      />

      {/* Draggable FAB Container */}
      <motion.div
        drag
        dragControls={dragControls}
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => {
          setIsDragging(true);
          setIsExpanded(false);
        }}
        onDragEnd={() => setIsDragging(false)}
        className="fixed bottom-6 right-6 z-40 mobile-fab pointer-events-auto"
        style={{ x: position.x, y: position.y }}
        animate={{
          scale: isDragging ? 1.1 : 1,
          opacity: isDragging ? 0.8 : 1
        }}
      >
        {/* Quick Actions Menu */}
        <AnimatePresence>
          {isExpanded && !isDragging && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-16 right-0 space-y-3"
            >
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <motion.button
                    key={action.type}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleQuickCreate(action.type)}
                    className="flex items-center space-x-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all p-3 pr-4 group"
                    whileHover={{ scale: 1.05, x: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{action.label}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          onClick={() => !isDragging && setIsExpanded(!isExpanded)}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
            isExpanded ? 'bg-gray-600 hover:bg-gray-700' : 'hover:shadow-xl'
          } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ backgroundColor: !isExpanded ? '#456A76' : undefined }}
          whileHover={{ scale: isDragging ? 1 : 1.1 }}
          whileTap={{ scale: isDragging ? 1 : 0.9 }}
          animate={{ rotate: isExpanded ? 45 : 0 }}
          onPointerDown={(e) => {
            const timer = setTimeout(() => dragControls.start(e), 200);
            const cleanup = () => {
              clearTimeout(timer);
              document.removeEventListener('pointerup', cleanup);
            };
            document.addEventListener('pointerup', cleanup);
          }}
        >
          {isExpanded ? (
            <XMarkIcon className="w-6 h-6 text-white" />
          ) : (
            <PlusIcon className="w-6 h-6 text-white" />
          )}
        </motion.button>

        {/* Backdrop */}
        <AnimatePresence>
          {isExpanded && !isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 -z-10"
              onClick={() => setIsExpanded(false)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default QuickCreateButton;
