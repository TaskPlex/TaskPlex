import React, { useState, useCallback } from 'react';
import { Merge, Upload, Download, Video, Plus, X, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../services/api';
import { useTaskProgress } from '../hooks/useTaskProgress';
import { useDownload } from '../hooks/useDownload';
import { QualitySelector, FormatSelector, ProgressBar, OperationToggle, type QualityLevel } from '../components/ui';
import { truncateFilename } from '../utils/filename';

const VIDEO_FORMATS = ['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv'];
const MERGE_MODES = [
  { id: 'quality', labelKey: 'modules.video.merge.modeQuality' },
  { id: 'fast', labelKey: 'modules.video.merge.modeFast' },
];

// Result type from SSE
interface VideoResult {
  success: boolean;
  download_url?: string;
  filename?: string;
  processed_size?: number;
  compression_ratio?: number;
  message?: string;
}

export const VideoMergeScreen: React.FC = () => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState<string>('mp4');
  const [quality, setQuality] = useState<QualityLevel>('medium');
  const [mergeMode, setMergeMode] = useState<'fast' | 'quality'>('quality');

  // Use SSE-based task progress tracking
  const {
    status,
    progress,
    message,
    result,
    error,
    isLoading,
    startTask,
    cancel,
    reset,
  } = useTaskProgress<VideoResult>();

  const { downloadDirect } = useDownload();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      reset();
    }
  }, [reset]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    reset();
  }, [reset]);

  const handleMerge = useCallback(async () => {
    if (files.length < 2) return;
    await startTask((signal) => 
      ApiService.mergeVideosAsync(files, outputFormat, quality, mergeMode, signal)
    );
  }, [files, outputFormat, quality, mergeMode, startTask]);

  const handleCancel = useCallback(() => {
    cancel();
  }, [cancel]);

  const handleReset = useCallback(() => {
    setFiles([]);
    reset();
  }, [reset]);

  // Type-safe result
  const videoResult = result as VideoResult | null;
  const errorMessage = error || (videoResult && !videoResult.success ? videoResult.message : null);

  const handleDownload = useCallback(() => {
    if (videoResult?.download_url) {
      const url = ApiService.getDownloadUrl(videoResult.download_url);
      const filename = videoResult.download_url.split('/').pop() || 'merged.mp4';
      downloadDirect(url, filename);
    }
  }, [videoResult, downloadDirect]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
          <Merge className="text-purple-600 dark:text-purple-400" size={32} />
          {t('modules.video.merge.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('modules.video.merge.description')}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        {files.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative group cursor-pointer">
            <input 
              type="file" 
              accept="video/*" 
              multiple
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            />
            <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
              <Upload className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('modules.video.merge.selectFiles')}</h3>
            <p className="text-gray-500 dark:text-gray-400">{t('modules.video.merge.dropFiles')}</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="p-2 bg-white dark:bg-gray-600 rounded-lg border border-gray-100 dark:border-gray-500 shadow-sm">
                    <Video className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white" title={file.name}>
                      {truncateFilename(file.name)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button 
                    onClick={() => removeFile(index)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              
              <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-200 dark:hover:border-purple-800">
                <input 
                  type="file" 
                  accept="video/*" 
                  multiple
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <Plus size={20} />
                <span className="font-medium">{t('modules.video.merge.addMore')}</span>
              </div>
            </div>

            {files.length >= 2 && (
              <div className="space-y-4">
                <OperationToggle
                  operations={MERGE_MODES}
                  value={mergeMode}
                  onChange={(mode) => setMergeMode(mode as 'fast' | 'quality')}
                  labelKey="modules.video.merge.modeLabel"
                  color="purple"
                  disabled={isLoading}
                />

                {mergeMode === 'fast' && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                          {t('modules.video.merge.fastModeWarning')}
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                          {t('modules.video.merge.fastModeDescription')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <FormatSelector
                  formats={VIDEO_FORMATS}
                  value={outputFormat}
                  onChange={setOutputFormat}
                  labelKey="modules.video.merge.outputFormat"
                  disabled={isLoading}
                />

                {mergeMode === 'quality' && (
                  <QualitySelector
                    value={quality}
                    onChange={setQuality}
                    labelKey="modules.video.merge.quality"
                    color="purple"
                    disabled={isLoading}
                  />
                )}
              </div>
            )}

            {/* Progress Bar - shown during upload/processing */}
            {isLoading && (
              <div className="py-4">
                <ProgressBar
                  progress={progress}
                  status={status}
                  message={message || t('modules.video.merge.merging')}
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

            {errorMessage && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-100 dark:border-red-800">
                {errorMessage}
              </div>
            )}

            {!videoResult || !videoResult.success ? (
              <button
                onClick={handleMerge}
                disabled={isLoading || files.length < 2}
                className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-200 dark:hover:shadow-purple-900/30 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? t('modules.video.merge.merging') : t('modules.video.merge.mergeBtn')}
              </button>
            ) : (
              <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800 rounded-xl p-6 text-center animate-in fade-in slide-in-from-bottom-4">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-purple-900 dark:text-purple-200 mb-2">{t('modules.video.merge.successTitle')}</h3>
                <p className="text-purple-700 dark:text-purple-300 mb-6">{t('modules.video.merge.successMessage')}</p>
                
                <div className="flex gap-3 justify-center">
                  {videoResult.download_url && (
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-md cursor-pointer"
                    >
                      <Download className="w-5 h-5" />
                      {t('modules.video.merge.downloadResult')}
                    </button>
                  )}
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    {t('common.reset')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

