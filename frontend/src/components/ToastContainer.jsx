import React from 'react';
import Toast from './Toast';
import { useToast } from '../context/ToastContext';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full px-4 sm:px-6 space-y-3 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onClose={removeToast}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
