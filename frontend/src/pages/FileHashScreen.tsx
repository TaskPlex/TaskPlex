import React, { useState, useCallback, useMemo } from 'react';
import { Hash, Copy, Check, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useHashFile } from '../hooks/useHash';
import {
  FileDropzone,
  ProcessButton,
  ErrorAlert,
} from '../components/ui';

const ALGORITHMS = [
  { value: 'md5', label: 'MD5' },
  { value: 'sha1', label: 'SHA1' },
  { value: 'sha256', label: 'SHA256 (Recommended)' },
  { value: 'sha512', label: 'SHA512' },
] as const;

export const FileHashScreen: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [algorithm, setAlgorithm] = useState<'md5' | 'sha1' | 'sha256' | 'sha512'>('sha256');
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [copied, setCopied] = useState<'hex' | 'base64' | null>(null);

  const hashMutation = useHashFile();

  const loading = hashMutation.isPending;
  const result = hashMutation.data;
  const error = hashMutation.error;

  const handleFileChange = useCallback((newFile: File | null) => {
    setFile(newFile);
    hashMutation.reset();
    setCopied(null);
  }, [hashMutation]);

  const handleSubmit = useCallback(() => {
    if (!file) return;
    hashMutation.mutate({ file, algorithm, uppercase });
  }, [file, algorithm, uppercase, hashMutation]);

  const handleCopy = useCallback((type: 'hex' | 'base64', value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const errorMessage = useMemo(() => {
    if (error instanceof Error) return error.message;
    if (result && !result.success) return result.message;
    return null;
  }, [error, result]);

  const canSubmit = useMemo(() => {
    return file !== null;
  }, [file]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
        <Hash className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        {t('fileHash.title')}
      </h1>

      <div className="space-y-6">
        {/* File Upload */}
        <FileDropzone
          file={file}
          onFileChange={handleFileChange}
          accept="*/*"
          fileType="any"
          labelKey="fileHash.selectFile"
          dropLabelKey="fileHash.dropFile"
          color="purple"
        />

        {/* Algorithm Selection */}
        <div className="space-y-2">
          <label htmlFor="algorithm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('fileHash.algorithm')}
          </label>
          <select
            id="algorithm"
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as 'md5' | 'sha1' | 'sha256' | 'sha512')}
            className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-purple-500"
          >
            {ALGORITHMS.map((algo) => (
              <option key={algo.value} value={algo.value}>
                {algo.label}
              </option>
            ))}
          </select>
        </div>

        {/* Uppercase Option */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="uppercase"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="uppercase" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('fileHash.uppercase')}
          </label>
        </div>

        {/* Process Button */}
        <ProcessButton
          onClick={handleSubmit}
          disabled={!canSubmit}
          loading={loading}
          labelKey="fileHash.calculateBtn"
          loadingLabelKey="fileHash.calculating"
          color="purple"
        />

        {/* Error Alert */}
        <ErrorAlert message={errorMessage} />

        {/* Results */}
        {result && result.success && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('fileHash.result')}
              </h3>
            </div>

            {/* File Info */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('fileHash.filename')}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{result.filename}</span>
              </div>
              {result.file_size && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('fileHash.fileSize')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {(result.file_size / 1024).toFixed(2)} KB
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('fileHash.algorithm')}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white uppercase">
                  {result.algorithm}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
              {/* Hex Digest */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('fileHash.hexDigest')}
                  </label>
                  <button
                    onClick={() => handleCopy('hex', result.hex_digest)}
                    className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                  >
                    {copied === 'hex' ? (
                      <>
                        <Check className="w-4 h-4" />
                        {t('common.copied')}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {t('common.copy')}
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3 border border-gray-200 dark:border-gray-700">
                  <code className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                    {result.hex_digest}
                  </code>
                </div>
              </div>

              {/* Base64 Digest */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('fileHash.base64Digest')}
                  </label>
                  <button
                    onClick={() => handleCopy('base64', result.base64_digest)}
                    className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                  >
                    {copied === 'base64' ? (
                      <>
                        <Check className="w-4 h-4" />
                        {t('common.copied')}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {t('common.copy')}
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3 border border-gray-200 dark:border-gray-700">
                  <code className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                    {result.base64_digest}
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-purple-900 dark:text-purple-200 mb-2">
            {t('fileHash.infoTitle')}
          </h3>
          <ul className="text-sm text-purple-800 dark:text-purple-300 space-y-1 list-disc list-inside">
            <li>{t('fileHash.info1')}</li>
            <li>{t('fileHash.info2')}</li>
            <li>{t('fileHash.info3')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

