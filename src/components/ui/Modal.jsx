import React, { useEffect, useRef } from 'react';
import { cn } from '../../utils/dateUtils';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70" />
      <div
        ref={modalRef}
        className={cn(
          "relative bg-white dark:bg-dark-secondary rounded-lg shadow-lg max-h-[85vh] overflow-hidden flex flex-col",
          "w-full max-w-md mx-3",
          className
        )}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-dark-primary">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 flex-1">
          {children}
        </div>

        {footer && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-2 overflow-x-auto">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};