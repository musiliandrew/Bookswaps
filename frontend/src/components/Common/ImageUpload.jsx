import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PhotoIcon, 
  XMarkIcon, 
  ArrowUpTrayIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const ImageUpload = ({ 
  onImageSelect, 
  currentImage, 
  label = "Upload Image",
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
  className = "",
  disabled = false,
  showPreview = true,
  placeholder = "Click to upload or drag and drop"
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file.type.startsWith('image/')) {
      return 'Please select a valid image file';
    }
    
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`;
    }
    
    return null;
  };

  const handleFileSelect = (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    
    // Call parent callback
    onImageSelect(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    setError(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-[var(--text-primary)]">
          {label}
        </label>
      )}
      
      <motion.div
        className={`relative border-2 border-dashed rounded-lg transition-all duration-200 ${
          dragOver 
            ? 'border-[var(--accent)] bg-[var(--accent)]/5' 
            : 'border-[var(--secondary)] hover:border-[var(--accent)]/50'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        {showPreview && preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <motion.button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <XMarkIcon className="w-4 h-4" />
            </motion.button>
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
              Click to change
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center space-y-3">
              {dragOver ? (
                <ArrowUpTrayIcon className="w-12 h-12 text-[var(--accent)] animate-bounce" />
              ) : (
                <PhotoIcon className="w-12 h-12 text-[var(--text-secondary)]" />
              )}
              
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {dragOver ? 'Drop image here' : placeholder}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  PNG, JPG, GIF up to {Math.round(maxSize / (1024 * 1024))}MB
                </p>
              </div>
              
              {!disabled && (
                <motion.div
                  className="px-4 py-2 bg-[var(--accent)] text-white text-sm rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Choose File
                </motion.div>
              )}
            </div>
          </div>
        )}
      </motion.div>
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      <p className="text-xs text-[var(--text-secondary)]">
        Supported formats: JPG, PNG, GIF. Maximum size: {Math.round(maxSize / (1024 * 1024))}MB
      </p>
    </div>
  );
};

export default ImageUpload;
