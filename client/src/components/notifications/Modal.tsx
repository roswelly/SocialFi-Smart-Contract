import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-[var(--card)] rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;