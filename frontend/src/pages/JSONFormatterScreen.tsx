import React, { useState, useCallback } from 'react';
import { Braces, Copy, Download, RefreshCw, Code2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useJSONFormatter } from '../hooks/useJSONFormatter';

export const JSONFormatterScreen: React.FC = () => {
  const { t } = useTranslation();
  const [json, setJson] = useState('');
  const [indentSize, setIndentSize] = useState(2);

  const { mutate, data: result, isPending: loading, error, reset } = useJSONFormatter();

  const handleFormat = useCallback(() => {
    if (!json.trim()) return;
    mutate({ json, indentSize });
  }, [json, indentSize, mutate]);

  const handleCopy = useCallback(() => {
    if (result?.result) {
      navigator.clipboard.writeText(result.result);
    }
  }, [result]);

  const handleDownload = useCallback(() => {
    if (result?.result) {
      const blob = new Blob([result.result], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'formatted.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [result]);

  const handleReset = useCallback(() => {
    setJson('');
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
          <Braces className="text-yellow-600 dark:text-yellow-400" size={32} />
          {t('jsonFormatter.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('jsonFormatter.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: INPUT */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <label
                htmlFor="json-input"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('jsonFormatter.inputJSON')}
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
              id="json-input"
              value={json}
              onChange={(e) => setJson(e.target.value)}
              placeholder={t('jsonFormatter.jsonPlaceholder')}
              className="w-full h-96 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {json.length} {t('jsonFormatter.characters')}
            </p>
          </div>

          {/* Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div>
              <label
                htmlFor="indent-size"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t('jsonFormatter.indentSize')}
              </label>
              <input
                id="indent-size"
                type="number"
                min="1"
                max="8"
                value={indentSize}
                onChange={(e) => setIndentSize(Number(e.target.value))}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>

            <button
              onClick={handleFormat}
              disabled={loading || !json.trim()}
              className="w-full py-3 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 transition-all shadow-lg hover:shadow-yellow-200 dark:hover:shadow-yellow-900/30 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  {t('jsonFormatter.formatting')}
                </>
              ) : (
                <>
                  <Code2 className="w-5 h-5" />
                  {t('jsonFormatter.formatBtn')}
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: OUTPUT */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('jsonFormatter.formattedJSON')}
              </label>
              {result?.result && (
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
              value={result?.result || ''}
              placeholder={t('jsonFormatter.formattedPlaceholder')}
              className="w-full h-96 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
            />
            {result?.result && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('jsonFormatter.originalSize')}:
                    </span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                      {result.original_size} {t('jsonFormatter.bytes')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('jsonFormatter.resultSize')}:
                    </span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                      {result.result_size} {t('jsonFormatter.bytes')}
                    </span>
                  </div>
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



