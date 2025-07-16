import React, { createContext, useContext, useState, useCallback } from "react";
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
};

type ToastContextType = {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  showToast: (
    type: ToastType,
    title: string,
    message?: string,
    duration?: number,
  ) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Date.now().toString();
      const newToast = { ...toast, id };

      setToasts((prev) => [...prev, newToast]);

      // Auto remove after duration (default 5 seconds)
      const duration = toast.duration || 5000;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast],
  );

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration?: number) => {
      addToast({ type, title, message, duration });
    },
    [addToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, showToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return (
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        );
      case "error":
        return (
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
        );
      case "warning":
        return (
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        );
      case "info":
        return <Info className="h-5 w-5 text-blue-600 dark:text-gold" />;
    }
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 dark:bg-gray-800 dark:border-green-600";
      case "error":
        return "bg-red-50 border-red-200 dark:bg-gray-800 dark:border-red-600";
      case "warning":
        return "bg-yellow-50 border-yellow-200 dark:bg-gray-800 dark:border-yellow-500";
      case "info":
        return "bg-blue-50 border-blue-200 dark:bg-gray-800 dark:border-gold";
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-80 max-w-md p-4 rounded-lg border shadow-lg transition-all duration-300 ${getToastStyles(toast.type)}`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">{getToastIcon(toast.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {toast.title}
              </p>
              {toast.message && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
