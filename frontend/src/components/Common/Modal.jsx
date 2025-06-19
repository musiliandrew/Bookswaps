import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-md mx-4 p-6 font-open-sans">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-lora font-bold text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-secondary hover:text-primary focus:outline-none"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;