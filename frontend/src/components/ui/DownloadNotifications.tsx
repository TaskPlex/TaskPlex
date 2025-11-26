import React, { useCallback, useState, useEffect } from 'react';
import { Download, X, CheckCircle, AlertCircle, Loader2, FolderOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDownloadNotifications, type DownloadNotification } from '../../contexts/DownloadNotificationContext';

// Check if running in Tauri - more reliable detection
const checkIsTauri = (): boolean => {
  try {
    return typeof window !== 'undefined' && 
           ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
  } catch {
    return false;
  }
};

// Open Downloads folder using Tauri shell plugin
const openDownloadsFolder = async (): Promise<boolean> => {
  try {
    const { open } = await import('@tauri-apps/plugin-shell');
    const { downloadDir } = await import('@tauri-apps/api/path');
    const downloadsPath = await downloadDir();
    await open(downloadsPath);
    return true;
  } catch (error) {
    console.error('Failed to open downloads folder:', error);
    return false;
  }
};

interface NotificationItemProps {
  notification: DownloadNotification;
  onDismiss: () => void;
  onRedownload: () => void;
  onOpenFolder: () => void;
  canOpenFolder: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDismiss,
  onRedownload,
  onOpenFolder,
  canOpenFolder,
}) => {
  const { t } = useTranslation();

  const statusConfig = {
    downloading: {
      icon: <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />,
      bg: 'bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700',
      text: 'text-blue-800 dark:text-blue-200',
    },
    completed: {
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      bg: 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700',
      text: 'text-emerald-800 dark:text-emerald-200',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      bg: 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700',
      text: 'text-red-800 dark:text-red-200',
    },
  };

  const config = statusConfig[notification.status];

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm
        animate-in slide-in-from-right-5 fade-in duration-300
        ${config.bg}
      `}
    >
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
      
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${config.text}`}>
          {notification.filename}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
          {notification.status === 'downloading' && t('download.inProgress')}
          {notification.status === 'completed' && t('download.completed')}
          {notification.status === 'error' && (notification.message || t('download.error'))}
        </p>
        
        {notification.status === 'completed' && (
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <button
              onClick={onRedownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
                bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                rounded-lg border border-gray-200 dark:border-gray-600
                hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {t('download.redownload')}
            </button>
            {canOpenFolder ? (
              <button
                onClick={onOpenFolder}
                className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 
                  hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition-colors cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                {t('download.savedToDownloads')}
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <FolderOpen className="w-3.5 h-3.5" />
                {t('download.savedToDownloads')}
              </span>
            )}
          </div>
        )}
      </div>

      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
        aria-label={t('common.close')}
      >
        <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>
    </div>
  );
};

export const DownloadNotifications: React.FC = () => {
  const { notifications, removeNotification } = useDownloadNotifications();
  const [canOpenFolder, setCanOpenFolder] = useState(false);

  // Check Tauri availability after component mounts (ensures window is fully loaded)
  useEffect(() => {
    // Small delay to ensure Tauri internals are injected
    const timer = setTimeout(() => {
      setCanOpenFolder(checkIsTauri());
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRedownload = useCallback((notification: DownloadNotification) => {
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = notification.downloadUrl;
    link.download = notification.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleOpenFolder = useCallback(async () => {
    const success = await openDownloadsFolder();
    if (!success) {
      // If opening folder failed, disable the button
      setCanOpenFolder(false);
    }
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-80 max-w-[calc(100vw-2rem)]">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={() => removeNotification(notification.id)}
          onRedownload={() => handleRedownload(notification)}
          onOpenFolder={handleOpenFolder}
          canOpenFolder={canOpenFolder}
        />
      ))}
    </div>
  );
};

