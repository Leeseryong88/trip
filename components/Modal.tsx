import React, { ReactNode } from 'react';
import { XMarkIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl' | 'fullscreen';
  headerActions?: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', headerActions }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-3xl',
    xl: 'max-w-6xl',
    fullscreen: 'w-11/12 h-5/6'
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`relative bg-white rounded-2xl shadow-xl p-6 flex flex-col ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 id="modal-title" className="text-xl font-bold text-slate-800">
            {title}
          </h3>
          <div className="flex items-center gap-2">
            {headerActions}
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
              aria-label="Close modal"
            >
              <XMarkIcon />
            </button>
          </div>
        </div>
        <div className="flex-grow overflow-hidden">{children}</div>
      </div>
    </div>
  );
};

export default Modal;