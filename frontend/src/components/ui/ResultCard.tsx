import React, { useCallback } from 'react';
import { Download, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../../services/api';
import { useDownload } from '../../hooks/useDownload';

interface ResultCardProps {
  success: boolean;
  message?: string;
  downloadUrl?: string;
  filename?: string;
  originalSize?: number;
  processedSize?: number;
  compressionRatio?: number;
  downloadLabelKey?: string;
  color?: 'purple' | 'blue' | 'red' | 'green';
  className?: string;
  children?: React.ReactNode;
}

const colorClasses = {
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/30 border-purple-100 dark:border-purple-800',
    text: 'text-purple-800 dark:text-purple-200',
    subtext: 'text-purple-700 dark:text-purple-300',
    button: 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
    subtext: 'text-blue-700 dark:text-blue-300',
    button: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-800',
    text: 'text-red-800 dark:text-red-200',
    subtext: 'text-red-700 dark:text-red-300',
    button: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-800',
    text: 'text-green-800 dark:text-green-200',
    subtext: 'text-green-700 dark:text-green-300',
    button: 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500',
  },
};

export const ResultCard: React.FC<ResultCardProps> = ({
  success,
  message,
  downloadUrl,
  filename,
  originalSize,
  processedSize,
  compressionRatio,
  downloadLabelKey = 'common.download',
  color = 'green',
  className = '',
  children,
}) => {
  const { t } = useTranslation();
  const { downloadDirect } = useDownload();
  const colors = colorClasses[color];

  const handleDownload = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (downloadUrl) {
      const url = ApiService.getDownloadUrl(downloadUrl);
      const extractedFilename = filename || downloadUrl.split('/').pop() || 'download';
      downloadDirect(url, extractedFilename);
    }
  }, [downloadUrl, filename, downloadDirect]);

  if (!success) return null;

  const showSizeInfo = originalSize && processedSize;
  const reduction = showSizeInfo
    ? Math.round((1 - processedSize / originalSize) * 100)
    : compressionRatio
    ? Math.round(compressionRatio)
    : null;

  return (
    <div
      className={`p-6 rounded-xl border ${colors.bg} animate-in fade-in slide-in-from-bottom-4 duration-500 ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <CheckCircle className={`w-6 h-6 ${colors.subtext} flex-shrink-0`} />
          <div>
            <p className={`font-medium ${colors.text}`}>
              {message || t('common.success')}
            </p>
            {reduction !== null && (
              <p className={`text-sm mt-1 ${colors.subtext}`}>
                Reduced by <span className="font-bold">{reduction}%</span>
                {showSizeInfo && (
                  <span className="opacity-75 ml-2">
                    ({(originalSize / 1024).toFixed(0)}KB → {(processedSize / 1024).toFixed(0)}KB)
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {downloadUrl && (
          <button
            onClick={handleDownload}
            className={`flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg font-bold transition-colors shadow-sm hover:shadow-md cursor-pointer ${colors.button}`}
          >
            <Download className="w-5 h-5" />
            {t(downloadLabelKey)}
          </button>
        )}
      </div>

      {children}
    </div>
  );
};
