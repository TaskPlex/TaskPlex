/**
 * ProgressBar component for displaying task progress
 * Supports different visual states: uploading, processing, completed, error
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Loader2, Upload, Cog } from 'lucide-react';
import type { TaskStatus } from '../../hooks/useTaskProgress';
import { useTheme } from '../../contexts/ThemeContext';

interface ProgressBarProps {
  /** Current progress percentage (0-100) */
  progress: number;
  /** Current task status */
  status: TaskStatus;
  /** Optional message to display */
  message?: string;
  /** Whether to show percentage text */
  showPercentage?: boolean;
  /** Whether to show status icon */
  showIcon?: boolean;
  /** Custom class name */
  className?: string;
  /** Height variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'default' | 'success' | 'error' | 'info';
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const StatusIcon: React.FC<{ status: TaskStatus; className?: string }> = ({ 
  status, 
  className = 'w-5 h-5' 
}) => {
  switch (status) {
    case 'uploading':
      return <Upload className={`${className} text-blue-500 animate-pulse`} />;
    case 'processing':
      return <Cog className={`${className} text-blue-500 animate-spin`} />;
    case 'completed':
      return <CheckCircle className={`${className} text-green-500`} />;
    case 'error':
      return <XCircle className={`${className} text-red-500`} />;
    default:
      return null;
  }
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  status,
  message,
  showPercentage = true,
  showIcon = true,
  className = '',
  size = 'md',
  variant = 'default',
}) => {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  if (status === 'idle') return null;

  const getProgressColor = () => {
    if (variant !== 'default') {
      switch (variant) {
        case 'success': return 'bg-green-500';
        case 'error': return 'bg-red-500';
        case 'info': return 'bg-blue-500';
      }
    }
    
    switch (status) {
      case 'uploading':
        return 'bg-blue-400';
      case 'processing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getDefaultMessage = () => {
    switch (status) {
      case 'uploading':
        return t('progress.uploading', 'Uploading...');
      case 'processing':
        return t('progress.processing', 'Processing...');
      case 'completed':
        return t('progress.completed', 'Completed!');
      case 'error':
        return t('progress.error', 'Error');
      default:
        return '';
    }
  };

  const displayMessage = message || getDefaultMessage();
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {/* Header with message and percentage */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {showIcon && <StatusIcon status={status} />}
          <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {displayMessage}
          </span>
        </div>
        {showPercentage && status !== 'error' && (
          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {Math.round(clampedProgress)}%
          </span>
        )}
      </div>

      {/* Progress bar track */}
      <div 
        className={`
          w-full rounded-full overflow-hidden
          ${sizeClasses[size]}
          ${isDark ? 'bg-gray-700' : 'bg-gray-200'}
        `}
      >
        {/* Progress bar fill */}
        <div
          className={`
            h-full rounded-full transition-all duration-300 ease-out
            ${getProgressColor()}
            ${status === 'processing' ? 'animate-pulse' : ''}
          `}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Stages indicator for processing */}
      {status === 'processing' && (
        <div className="flex items-center justify-center mt-2">
          <Loader2 className={`w-4 h-4 animate-spin mr-2 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('progress.pleaseWait', 'Please wait, this may take a moment...')}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Compact progress indicator for inline use
 */
export const ProgressIndicator: React.FC<{
  progress: number;
  status: TaskStatus;
  size?: 'sm' | 'md';
}> = ({ progress, status, size = 'sm' }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  if (status === 'idle') return null;

  const getColor = () => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return isDark ? 'text-blue-400' : 'text-blue-500';
    }
  };

  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className={`flex items-center gap-2 ${getColor()}`}>
      <StatusIcon status={status} className={sizeClass} />
      {status !== 'completed' && status !== 'error' && (
        <span className="text-sm font-medium">{Math.round(progress)}%</span>
      )}
    </div>
  );
};

export default ProgressBar;

