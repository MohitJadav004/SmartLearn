import React, { createContext, useContext, useState, useCallback } from 'react';

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
  const [confirm, setConfirm] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDangerous: false,
    onConfirm: null,
    onCancel: null
  });

  const showConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirm({
        isOpen: true,
        title: options.title || 'Confirm Action',
        message: options.message || 'Are you sure?',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        isDangerous: options.isDangerous || false,
        onConfirm: () => {
          setConfirm(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirm(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm, showConfirm }}>
      {children}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};
