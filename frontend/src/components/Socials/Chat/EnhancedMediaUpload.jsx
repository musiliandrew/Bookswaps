import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../../hooks/useChat';
import { toast } from 'react-toastify';
import {
  XMarkIcon,
  PhotoIcon,
  DocumentIcon,
  FilmIcon,
  MusicalNoteIcon,
  PaperClipIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const EnhancedMediaUpload = ({ 
  isOpen, 
  onClose, 
  onUploadComplete, 
  receiverId,
  societyId = null,
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024 // 10MB
}) => {
  const { sendMediaMessage, isLoading } = useChat();
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/mov'],
    audio: ['audio/mp3', 'audio/wav', 'audio/ogg'],
    document: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };

  const getFileType = (file) => {
    for (const [type, mimes] of Object.entries(allowedTypes)) {
      if (mimes.includes(file.type)) return type;
    }
    return 'document';
  };

  const getFileIcon = (fileType) => {
    const icons = {
      image: PhotoIcon,
      video: FilmIcon,
      audio: MusicalNoteIcon,
      document: DocumentIcon
    };
    return icons[fileType] || DocumentIcon;
  };

  const validateFile = (file) => {
    if (file.size > maxFileSize) {
      return `File "${file.name}" is too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB.`;
    }
    
    const isAllowed = Object.values(allowedTypes).flat().includes(file.type);
    if (!isAllowed) {
      return `File type "${file.type}" is not supported.`;
    }
    
    return null;
  };

  const handleFiles = useCallback((newFiles) => {
    const fileArray = Array.from(newFiles);
    const validFiles = [];
    const errors = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push({
          file,
          id: Math.random().toString(36).substr(2, 9),
          type: getFileType(file),
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        });
      }
    });

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    if (files.length + validFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setFiles(prev => [...prev, ...validFiles]);
  }, [files.length, maxFiles]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileId) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      // Clean up preview URLs
      const removed = prev.find(f => f.id === fileId);
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    try {
      const uploadPromises = files.map(async (fileData) => {
        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append('file_type', fileData.type);
        
        if (societyId) {
          formData.append('society_id', societyId);
        } else {
          formData.append('receiver_id', receiverId);
        }

        // Simulate progress (in real implementation, you'd track actual progress)
        setUploadProgress(prev => ({ ...prev, [fileData.id]: 0 }));
        
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [fileData.id]: Math.min((prev[fileData.id] || 0) + 10, 90)
          }));
        }, 100);

        try {
          const result = await sendMediaMessage(formData);
          clearInterval(progressInterval);
          setUploadProgress(prev => ({ ...prev, [fileData.id]: 100 }));
          return result;
        } catch (error) {
          clearInterval(progressInterval);
          setUploadProgress(prev => ({ ...prev, [fileData.id]: -1 })); // Error state
          throw error;
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (successful > 0) {
        toast.success(`${successful} file(s) uploaded successfully`);
        onUploadComplete?.();
        onClose();
      }
      
      if (failed > 0) {
        toast.error(`${failed} file(s) failed to upload`);
      }

    } catch (error) {
      toast.error('Upload failed');
      console.error('Upload error:', error);
    }
  };

  const handleClose = () => {
    // Clean up preview URLs
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setUploadProgress({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="bookish-glass rounded-2xl border border-white/20 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl">
                <CloudArrowUpIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-lora font-bold text-primary">
                  Upload Media
                </h3>
                <p className="text-sm text-primary/70">
                  Share images, videos, documents and more
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-primary/70" />
            </button>
          </div>

          {/* Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              dragActive
                ? 'border-accent bg-accent/10'
                : 'border-white/20 hover:border-white/40 hover:bg-white/5'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept={Object.values(allowedTypes).flat().join(',')}
            />
            
            <CloudArrowUpIcon className="w-12 h-12 text-primary/50 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-primary mb-2">
              Drop files here or click to browse
            </h4>
            <p className="text-sm text-primary/70 mb-4">
              Support for images, videos, audio, and documents
            </p>
            <p className="text-xs text-primary/50">
              Maximum {maxFiles} files, {maxFileSize / (1024 * 1024)}MB each
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-primary mb-4">Selected Files ({files.length})</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {files.map((fileData) => {
                  const IconComponent = getFileIcon(fileData.type);
                  const progress = uploadProgress[fileData.id];
                  const isUploading = progress !== undefined && progress >= 0 && progress < 100;
                  const isComplete = progress === 100;
                  const hasError = progress === -1;

                  return (
                    <motion.div
                      key={fileData.id}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {/* File Preview/Icon */}
                      <div className="flex-shrink-0">
                        {fileData.preview ? (
                          <img
                            src={fileData.preview}
                            alt={fileData.file.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-primary/70" />
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-primary truncate">
                          {fileData.file.name}
                        </p>
                        <p className="text-sm text-primary/70">
                          {formatFileSize(fileData.file.size)} • {fileData.type}
                        </p>
                        
                        {/* Progress Bar */}
                        {isUploading && (
                          <div className="mt-2">
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div
                                className="bg-accent h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-primary/60 mt-1">
                              Uploading... {progress}%
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Status/Actions */}
                      <div className="flex-shrink-0">
                        {isComplete ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : hasError ? (
                          <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                        ) : !isUploading ? (
                          <button
                            onClick={() => removeFile(fileData.id)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            <XMarkIcon className="w-4 h-4 text-primary/70" />
                          </button>
                        ) : null}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-primary"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || isLoading}
              className="flex-1 bookish-button-enhanced text-white py-3 rounded-xl disabled:opacity-50"
            >
              {isLoading ? 'Uploading...' : `Upload ${files.length} file(s)`}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnhancedMediaUpload;
