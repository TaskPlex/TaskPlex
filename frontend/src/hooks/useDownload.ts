import { useCallback } from 'react';
import { useDownloadNotifications } from '../contexts/DownloadNotificationContext';

interface UseDownloadOptions {
  onSuccess?: (filename: string) => void;
  onError?: (error: Error) => void;
}

export const useDownload = (options: UseDownloadOptions = {}) => {
  const { addNotification, updateNotification } = useDownloadNotifications();

  const download = useCallback(
    async (url: string, filename?: string) => {
      // Extract filename from URL if not provided
      const extractedFilename = filename || url.split('/').pop() || 'download';
      
      // Add notification as downloading
      const notificationId = addNotification({
        filename: extractedFilename,
        downloadUrl: url,
        status: 'downloading',
      });

      try {
        // Fetch the file to track progress (optional enhancement)
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Download failed: ${response.statusText}`);
        }

        const blob = await response.blob();
        
        // Create download link
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = extractedFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);

        // Update notification to completed
        updateNotification(notificationId, {
          status: 'completed',
          downloadUrl: url, // Keep original URL for re-download
        });

        options.onSuccess?.(extractedFilename);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Download failed';
        
        // Update notification to error
        updateNotification(notificationId, {
          status: 'error',
          message: errorMessage,
        });

        options.onError?.(error instanceof Error ? error : new Error(errorMessage));
      }
    },
    [addNotification, updateNotification, options]
  );

  // Simple download without fetch (for direct links)
  const downloadDirect = useCallback(
    (url: string, filename?: string) => {
      const extractedFilename = filename || url.split('/').pop() || 'download';
      
      // Create download link directly
      const link = document.createElement('a');
      link.href = url;
      link.download = extractedFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Add completed notification
      addNotification({
        filename: extractedFilename,
        downloadUrl: url,
        status: 'completed',
      });

      options.onSuccess?.(extractedFilename);
    },
    [addNotification, options]
  );

  return { download, downloadDirect };
};

