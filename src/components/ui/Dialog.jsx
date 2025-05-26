import React from 'react';
import { Button } from './Button';

export const Dialog = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  onCancel,
  title, 
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info' // 'info', 'warning', 'danger'
}) => {
  if (!isOpen) return null;

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          icon: (
            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'danger':
        return {
          icon: (
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          button: 'bg-red-600 hover:bg-red-700'
        };
      default:
        return {
          icon: (
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          button: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75" onClick={handleCancel} />

        {/* Dialog panel */}
        <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-dark-secondary rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-gray-100 dark:bg-dark-hover rounded-full sm:mx-0 sm:h-10 sm:w-10">
              {typeStyles.icon}
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-dark-primary">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-dark-secondary">
                  {message}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <Button
              type="button"
              className={`${typeStyles.button} text-white w-full sm:ml-3 sm:w-auto`}
              onClick={handleConfirm}
            >
              {confirmText}
            </Button>
            <Button
              type="button"
              className="mt-3 bg-white dark:bg-dark-hover text-gray-700 dark:text-dark-primary hover:bg-gray-50 dark:hover:bg-dark-hover/80 w-full sm:mt-0 sm:w-auto"
              onClick={handleCancel}
            >
              {cancelText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 