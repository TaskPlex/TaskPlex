/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

export interface DownloadNotification {
  id: string;
  filename: string;
  downloadUrl: string;
  timestamp: Date;
  status: 'downloading' | 'completed' | 'error';
  message?: string;
}

interface DownloadNotificationContextType {
  notifications: DownloadNotification[];
  addNotification: (notification: Omit<DownloadNotification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  updateNotification: (id: string, updates: Partial<DownloadNotification>) => void;
  clearAll: () => void;
}

const DownloadNotificationContext = createContext<DownloadNotificationContextType | undefined>(undefined);

const NOTIFICATION_TIMEOUT = 8000; // Auto-remove after 8 seconds

export const DownloadNotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<DownloadNotification[]>([]);

  const addNotification = useCallback((notification: Omit<DownloadNotification, 'id' | 'timestamp'>) => {
    const id = `download-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: DownloadNotification = {
      ...notification,
      id,
      timestamp: new Date(),
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, 5)); // Keep max 5 notifications

    // Auto-remove completed notifications after timeout
    if (notification.status === 'completed') {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, NOTIFICATION_TIMEOUT);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const updateNotification = useCallback((id: string, updates: Partial<DownloadNotification>) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );

    // Auto-remove if status changed to completed
    if (updates.status === 'completed') {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, NOTIFICATION_TIMEOUT);
    }
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = useMemo(() => ({
    notifications,
    addNotification,
    removeNotification,
    updateNotification,
    clearAll,
  }), [notifications, addNotification, removeNotification, updateNotification, clearAll]);

  return (
    <DownloadNotificationContext.Provider value={value}>
      {children}
    </DownloadNotificationContext.Provider>
  );
};

export const useDownloadNotifications = (): DownloadNotificationContextType => {
  const context = useContext(DownloadNotificationContext);
  if (context === undefined) {
    throw new Error('useDownloadNotifications must be used within a DownloadNotificationProvider');
  }
  return context;
};

