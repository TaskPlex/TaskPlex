import React, { useState, useCallback } from 'react';
import { Video, Play, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../services/api';
import { useTaskProgress } from '../hooks/useTaskProgress';
import {
  FileDropzone,
  QualitySelector,
  OperationToggle,
  ProcessButton,
  ErrorAlert,
  ResultCard,
  FormatSelector,
  ProgressBar,
  type QualityLevel,
} from '../components/ui';

// Result type from SSE
interface VideoResult {
  success: boolean;
  download_url?: string;
  filename?: string;
  original_size?: number;
  processed_size?: number;
  compression_ratio?: number;
  message?: string;
}

const VIDEO_OPERATIONS = [
  { id: 'compress', labelKey: 'video.compress' },
  { id: 'convert', labelKey: 'video.convert' },
];

const VIDEO_FORMATS = ['mp4', 'avi', 'mov', 'mkv', 'webm'];

export const VideoScreen: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [operation, setOperation] = useState<string>('compress');
  const [quality, setQuality] = useState<QualityLevel>('medium');
  const [format, setFormat] = useState('mp4');

  // Use SSE-based task progress tracking
  const {
    status,
    progress,
    message,
    result,
    error,
    isLoading,
    isProcessing,
    isCompleted,
    isError,
    startTask,
    cancel,
    reset,
  } = useTaskProgress<VideoResult>();

  // Memoized handlers
  const handleFileChange = useCallback((newFile: File | null) => {
    setFile(newFile);
    reset();
  }, [reset]);

  const handleOperationChange = useCallback((newOperation: string) => {
    setOperation(newOperation);
    reset();
  }, [reset]);

  const handleSubmit = useCallback(async () => {
    if (!file) return;
    
    if (operation === 'compress') {
      await startTask((signal) => 
        ApiService.compressVideoAsync(file, quality, signal)
      );
    } else {
      await startTask((signal) => 
        ApiService.convertVideoAsync(file, format, quality, signal)
      );
    }
  }, [file, operation, quality, format, startTask]);

  const handleCancel = useCallback(() => {
    cancel();
  }, [cancel]);

  const handleReset = useCallback(() => {
    setFile(null);
    reset();
  }, [reset]);

  // Type-safe result
  const videoResult = result as VideoResult | null;
  const errorMessage = error || (videoResult && !videoResult.success ? videoResult.message : null);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
        <Video className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        {t('video.title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: CONTROLS */}
        <div className="space-y-6">
          <OperationToggle
            operations={VIDEO_OPERATIONS}
            value={operation}
            onChange={handleOperationChange}
            labelKey="video.operation"
            color="purple"
            disabled={isLoading}
          />

          <FileDropzone
            file={file}
            onFileChange={handleFileChange}
            accept="video/*"
            fileType="video"
            labelKey="video.videoFile"
            dropLabelKey="video.dragDrop"
            color="purple"
            disabled={isLoading}
          />

          <QualitySelector
            value={quality}
            onChange={setQuality}
            labelKey="video.quality"
            color="purple"
            disabled={isLoading}
          />

          {operation === 'convert' && (
            <FormatSelector
              formats={VIDEO_FORMATS}
              value={format}
              onChange={setFormat}
              labelKey="video.outputFormat"
              disabled={isLoading}
            />
          )}

          {/* Progress Bar - shown during upload/processing */}
          {isLoading && (
            <div className="py-4">
              <ProgressBar
                progress={progress}
                status={status}
                message={message}
                size="lg"
              />
              
              {/* Cancel button */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-300 dark:hover:border-red-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Process button - hidden during loading */}
          {!isLoading && !isCompleted && (
            <ProcessButton
              onClick={handleSubmit}
              disabled={!file}
              loading={false}
              labelKey={operation === 'compress' ? 'video.compressVideo' : 'video.convertVideo'}
              loadingLabelKey="video.processing"
              color="purple"
            />
          )}

          {/* Reset button after completion */}
          {isCompleted && (
            <button
              onClick={handleReset}
              className="w-full py-3 px-4 rounded-lg font-medium border-2 border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer"
            >
              {t('common.reset')}
            </button>
          )}
          
          <ErrorAlert message={errorMessage} />
        </div>

        {/* RIGHT COLUMN: RESULT & PREVIEW */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('video.result')}</h2>
          
          {/* Processing animation */}
          {isProcessing && (
            <div className="h-64 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl flex flex-col items-center justify-center">
              <div className="relative">
                <Video className="w-16 h-16 text-purple-500 dark:text-purple-400" />
                <div className="absolute inset-0 animate-ping">
                  <Video className="w-16 h-16 text-purple-500 dark:text-purple-400 opacity-40" />
                </div>
              </div>
              <p className="mt-4 text-purple-600 dark:text-purple-400 font-medium">
                {message || t('progress.processing')}
              </p>
              <p className="mt-2 text-2xl font-bold text-purple-700 dark:text-purple-300">
                {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* Completed result */}
          {isCompleted && videoResult && videoResult.success ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in duration-500">
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                {videoResult.download_url && (
                  <video 
                    src={ApiService.getDownloadUrl(videoResult.download_url)} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <ResultCard
                success={videoResult.success}
                message={videoResult.message}
                downloadUrl={videoResult.download_url}
                compressionRatio={videoResult.compression_ratio}
                downloadLabelKey="video.downloadResult"
                color="green"
              />
            </div>
          ) : !isProcessing && (
            <div className="h-64 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
              <Play className="w-12 h-12 mb-2 opacity-20" />
              <p>{t('video.preview')}</p>
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="h-64 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl flex flex-col items-center justify-center text-red-500 dark:text-red-400">
              <X className="w-12 h-12 mb-2" />
              <p className="font-medium">{t('progress.error')}</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
