import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Enhanced Backdrop */}
          <motion.div
            className="absolute inset-0 modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Enhanced Modal Content */}
          <motion.div
            className={`relative modal-content rounded-3xl shadow-2xl w-full ${sizeClasses[size]} mx-4 font-open-sans border border-white/20`}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.4
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl pointer-events-none" />

            {/* Header */}
            <motion.div
              className="flex justify-between items-center p-6 border-b border-white/10"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <h2 className="text-3xl font-lora font-bold text-primary">{title}</h2>
              <motion.button
                onClick={onClose}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-primary/70 hover:text-primary transition-all duration-200"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <XMarkIcon className="w-6 h-6" />
              </motion.button>
            </motion.div>

            {/* Content */}
            <motion.div
              className="p-6 max-h-[75vh] overflow-y-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {children}
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              className="absolute -top-2 -right-2 w-6 h-6 bg-accent/30 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-2 -left-2 w-4 h-4 bg-primary/30 rounded-full"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;