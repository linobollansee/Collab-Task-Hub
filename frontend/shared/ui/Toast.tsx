'use client';

import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';

interface ToastContextType {
  showToast: (content: ReactNode, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<{ id: number; content: ReactNode; duration: number }[]>([]);

  const showToast = useCallback((content: ReactNode, duration = 2000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, content, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="px-4 py-3 rounded-md bg-white shadow-lg border border-gray-200"
          >
            {toast.content}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
