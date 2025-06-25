import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const MediaUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [messageType, setMessageType] = useState('IMAGE');
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const mediaTypes = [
    { type: 'IMAGE', label: 'Photo', icon: PhotoIcon, accept: 'image/*' },
    { type: 'VIDEO', label: 'Video', icon: VideoCameraIcon, accept: 'video/*' },
    { type: 'FILE', label: 'Document', icon: DocumentIcon, accept: '*' },
    { type: 'BOOK_REFERENCE', label: 'Book', icon: BookOpenIcon, accept: null }
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);

    // Create preview for images and videos
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = () => {
    if (!selectedFile && messageType !== 'BOOK_REFERENCE') {
      toast.error('Please select a file');
      return;
    }

    onUpload(selectedFile, messageType, caption);
    handleClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setCaption('');
    setMessageType('IMAGE');
    onClose();
  };

  const triggerFileInput = (type) => {
    setMessageType(type);
    if (type !== 'BOOK_REFERENCE') {
      const mediaType = mediaTypes.find(m => m.type === type);
      fileInputRef.current.accept = mediaType.accept;
      fileInputRef.current.click();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--text)]">Share Media</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Media Type Selection */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {mediaTypes.map((media) => {
                const Icon = media.icon;
                return (
                  <button
                    key={media.type}
                    onClick={() => triggerFileInput(media.type)}
                    className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                      messageType === media.type
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                        : 'border-gray-200 hover:border-[var(--primary)]/50'
                    }`}
                  >
                    <Icon className="w-8 h-8 mx-auto mb-2 text-[var(--primary)]" />
                    <p className="text-sm font-medium text-[var(--text)]">{media.label}</p>
                  </button>
                );
              })}
            </div>

            {/* File Preview */}
            {preview && (
              <div className="mb-4">
                {messageType === 'IMAGE' ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : messageType === 'VIDEO' ? (
                  <video
                    src={preview}
                    className="w-full h-48 object-cover rounded-lg"
                    controls
                  />
                ) : null}
              </div>
            )}

            {/* Selected File Info */}
            {selectedFile && !preview && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DocumentIcon className="w-8 h-8 text-[var(--primary)]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Caption Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Caption (optional)
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-[var(--text)] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile && messageType !== 'BOOK_REFERENCE'}
                className="flex-1 py-3 px-4 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MediaUploadModal;
