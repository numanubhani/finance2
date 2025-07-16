import React, { createContext, useContext, useState, useCallback } from "react";

export type Notification = {
  id: string;
  projectId: string;
  projectName: string;
  message: string;
  amount: number;
  timestamp: Date;
  read: boolean;
};

type NotificationContextType = {
  notifications: Notification[];
  addNotification: (
    projectId: string,
    projectName: string,
    message: string,
    amount: number,
  ) => void;
  markAsRead: (id: string) => void;
  clearNotification: (id: string) => void;
  unreadCount: number;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (
      projectId: string,
      projectName: string,
      message: string,
      amount: number,
    ) => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        projectId,
        projectName,
        message,
        amount,
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev]);
    },
    [],
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        clearNotification,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
