import React, { useState, useCallback } from 'react';
import { QrCode, Scan, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQRCodeReader } from '../hooks/useQRCodeReader';
import { FileDropzone } from '../components/ui/FileDropzone';
import { ProcessButton } from '../components/ui/ProcessButton';
import { ErrorAlert } from '../components/ui/ErrorAlert';

export const QRCodeReaderScreen: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);

  const { mutate, data: result, isPending: loading, error, reset } = useQRCodeReader();

  const handleFileChange = useCallback((newFile: File | null) => {
    setFile(newFile);
    reset();
    setCopied(false);
  }, [reset]);

  const handleRead = useCallback(() => {
    if (!file) return;
    mutate(file);
  }, [file, mutate]);

  const handleReset = useCallback(() => {
    setFile(null);
    reset();
    setCopied(false);
  }, [reset]);

  const handleCopy = useCallback(() => {
    if (result?.data) {
      navigator.clipboard.writeText(result.data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const errorMessage = error instanceof Error ? error.message : (result && !result.success ? result.message : null);

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
          <Scan className="text-yellow-600 dark:text-yellow-400" size={32} />
          {t('qrcodeReader.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('qrcodeReader.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Upload & Controls */}
        <div className="space-y-6">
          <FileDropzone
            file={file}
            onFileChange={handleFileChange}
            accept="image/*"
            fileType="image"
            labelKey="qrcodeReader.imageFile"
            dropLabelKey="qrcodeReader.dragDrop"
            color="green"
            disabled={loading}
          />

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('qrcodeReader.supportedFormats')}
            </p>
          </div>

          <ProcessButton
            onClick={handleRead}
            disabled={!file || loading}
            loading={loading}
            labelKey="qrcodeReader.readQRCode"
            loadingLabelKey="qrcodeReader.reading"
            color="green"
          />

          {file && (
            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.reset')}
            </button>
          )}

          <ErrorAlert message={errorMessage} />
        </div>

        {/* RIGHT: Preview & Result */}
        <div className="space-y-6">
          {file && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('qrcodeReader.preview')}
              </h3>
              <div className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt="QR Code preview"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>
          )}

          {result?.success && result.data && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('qrcodeReader.result')}
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                        {t('qrcodeReader.decodedData')}
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white break-all font-mono">
                        {result.data}
                      </p>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex-shrink-0 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title={t('common.copy')}
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {result.qr_type && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t('qrcodeReader.type')}: <span className="font-medium">{result.qr_type}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!file && !result && (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <QrCode className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t('qrcodeReader.noPreview')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

