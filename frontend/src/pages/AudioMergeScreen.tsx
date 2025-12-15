import React, { useState, useCallback, useMemo } from 'react';
import { Merge, Upload, Download, Music, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMergeAudio } from '../hooks/useAudio';
import { ApiService } from '../services/api';
import { useDownload } from '../hooks/useDownload';
import { QualitySelector, FormatSelector, type QualityLevel } from '../components/ui';
import { truncateFilename } from '../utils/filename';

const AUDIO_FORMATS = ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a'];
const AUDIO_BITRATES = ['128k', '160k', '192k', '256k', '320k'];

export const AudioMergeScreen: React.FC = () => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState<string>('mp3');
  const [quality, setQuality] = useState<QualityLevel>('medium');
  const [bitrate, setBitrate] = useState<string>('192k');

  const { mutate, data, isPending, isError, error, reset } = useMergeAudio();
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

  const handleMerge = useCallback(() => {
    if (files.length < 2) return;
    mutate({ files, outputFormat, quality, bitrate });
  }, [files, outputFormat, quality, bitrate, mutate]);

  const handleReset = useCallback(() => {
    setFiles([]);
    reset();
  }, [reset]);

  const errorMessage = useMemo(() => {
    if (isError && error instanceof Error) return error.message;
    if (data && !data.success) return data.message;
    return null;
  }, [isError, error, data]);

  const handleDownload = useCallback(() => {
    if (data?.download_url) {
      const url = ApiService.getDownloadUrl(data.download_url);
      const filename = data.download_url.split('/').pop() || 'merged.mp3';
      downloadDirect(url, filename);
    }
  }, [data, downloadDirect]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
          <Merge className="text-pink-600 dark:text-pink-400" size={32} />
          {t('modules.audio.merge.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('modules.audio.merge.description')}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        {files.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative group cursor-pointer">
            <input 
              type="file" 
              accept="audio/*" 
              multiple
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            />
            <div className="w-20 h-20 bg-pink-50 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
              <Upload className="w-10 h-10 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('audioMerge.selectFiles')}</h3>
            <p className="text-gray-500 dark:text-gray-400">{t('audioMerge.dropFiles')}</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="p-2 bg-white dark:bg-gray-600 rounded-lg border border-gray-100 dark:border-gray-500 shadow-sm">
                    <Music className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white" title={file.name}>
                      {truncateFilename(file.name)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button 
                    onClick={() => removeFile(index)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/30 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              
              <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 hover:border-pink-200 dark:hover:border-pink-800">
                <input 
                  type="file" 
                  accept="audio/*" 
                  multiple
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <Plus size={20} />
                <span className="font-medium">{t('audioMerge.addMore')}</span>
              </div>
            </div>

            {files.length >= 2 && (
              <div className="space-y-4">
                <FormatSelector
                  formats={AUDIO_FORMATS}
                  value={outputFormat}
                  onChange={setOutputFormat}
                  labelKey="audioMerge.outputFormat"
                  disabled={isPending}
                />

                <QualitySelector
                  value={quality}
                  onChange={setQuality}
                  labelKey="audioMerge.quality"
                  color="pink"
                  disabled={isPending}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {t('audioMerge.bitrate')}
                  </label>
                  <select
                    value={bitrate}
                    onChange={(e) => setBitrate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    disabled={isPending}
                  >
                    {AUDIO_BITRATES.map((br) => (
                      <option key={br} value={br}>{br}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {isPending && (
              <div className="py-4 text-center">
                <div className="inline-flex items-center gap-2 text-pink-600 dark:text-pink-400">
                  <div className="w-5 h-5 border-2 border-pink-600 dark:border-pink-400 border-t-transparent rounded-full animate-spin" />
                  <span className="font-medium">{t('audioMerge.merging')}</span>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-100 dark:border-red-800">
                {errorMessage}
              </div>
            )}

            {!data || !data.success ? (
              <button
                onClick={handleMerge}
                disabled={isPending || files.length < 2}
                className="w-full py-4 bg-pink-600 text-white rounded-xl font-bold text-lg hover:bg-pink-700 transition-all shadow-lg hover:shadow-pink-200 dark:hover:shadow-pink-900/30 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPending ? t('audioMerge.merging') : t('audioMerge.mergeBtn')}
              </button>
            ) : (
              <div className="bg-pink-50 dark:bg-pink-900/30 border border-pink-100 dark:border-pink-800 rounded-xl p-6 text-center animate-in fade-in slide-in-from-bottom-4">
                <div className="w-16 h-16 bg-pink-100 dark:bg-pink-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-pink-900 dark:text-pink-200 mb-2">{t('audioMerge.successTitle')}</h3>
                <p className="text-pink-700 dark:text-pink-300 mb-6">{t('audioMerge.successMessage')}</p>
                
                <div className="flex gap-3 justify-center">
                  {data.download_url && (
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition-colors shadow-md cursor-pointer"
                    >
                      <Download className="w-5 h-5" />
                      {t('audioMerge.downloadResult')}
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

