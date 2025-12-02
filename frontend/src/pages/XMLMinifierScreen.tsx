import React, { useState, useCallback } from 'react';
import { Minimize2, Copy, Download, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useXMLMinifier } from '../hooks/useXMLMinifier';

export const XMLMinifierScreen: React.FC = () => {
  const { t } = useTranslation();
  const [xml, setXml] = useState('');

  const { mutate, data: result, isPending: loading, error, reset } = useXMLMinifier();

  const handleMinify = useCallback(() => {
    if (!xml.trim()) return;
    mutate({ xml });
  }, [xml, mutate]);

  const handleCopy = useCallback(() => {
    if (result?.minified_xml) {
      navigator.clipboard.writeText(result.minified_xml);
    }
  }, [result]);

  const handleDownload = useCallback(() => {
    if (result?.minified_xml) {
      const blob = new Blob([result.minified_xml], { type: 'text/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'minified.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [result]);

  const handleReset = useCallback(() => {
    setXml('');
    reset();
  }, [reset]);

  const errorMessage =
    error instanceof Error
      ? error.message
      : result && !result.success
        ? result.message
        : null;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
          <Minimize2 className="text-yellow-600 dark:text-yellow-400" size={32} />
          {t('xmlMinifier.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('xmlMinifier.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: INPUT */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <label
                htmlFor="xml-input"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('xmlMinifier.inputXML')}
              </label>
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                {t('common.reset')}
              </button>
            </div>
            <textarea
              id="xml-input"
              value={xml}
              onChange={(e) => setXml(e.target.value)}
              placeholder={t('xmlMinifier.xmlPlaceholder')}
              className="w-full h-96 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {xml.length} {t('xmlMinifier.characters')}
            </p>
          </div>

          <button
            onClick={handleMinify}
            disabled={loading || !xml.trim()}
            className="w-full py-3 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 transition-all shadow-lg hover:shadow-yellow-200 dark:hover:shadow-yellow-900/30 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                {t('xmlMinifier.minifying')}
              </>
            ) : (
              <>
                <Minimize2 className="w-5 h-5" />
                {t('xmlMinifier.minifyBtn')}
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN: OUTPUT */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('xmlMinifier.minifiedXML')}
              </label>
              {result?.minified_xml && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    {t('common.copy')}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    {t('common.download')}
                  </button>
                </div>
              )}
            </div>
            <textarea
              readOnly
              value={result?.minified_xml || ''}
              placeholder={t('xmlMinifier.minifiedPlaceholder')}
              className="w-full h-96 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
            />
            {result?.minified_xml && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('xmlMinifier.originalSize')}:
                    </span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                      {result.original_length} {t('xmlMinifier.bytes')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('xmlMinifier.minifiedSize')}:
                    </span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                      {result.minified_length} {t('xmlMinifier.bytes')}
                    </span>
                  </div>
                  {result.compression_ratio !== undefined && (
                    <div className="col-span-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t('xmlMinifier.compressionRatio')}:
                      </span>
                      <span className="ml-2 font-semibold text-green-600 dark:text-green-400">
                        {result.compression_ratio}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-100 dark:border-red-800">
              {errorMessage}
            </div>
          )}

          {result && result.success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg border border-green-100 dark:border-green-800">
              {result.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


