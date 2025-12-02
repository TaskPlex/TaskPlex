import React, { useState, useCallback } from 'react';
import { Code2, Copy, Download, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCodeFormatter } from '../hooks/useCodeFormatter';

export const CodeFormatterScreen: React.FC = () => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('auto');
  const [indentSize, setIndentSize] = useState(2);
  const [indentChar, setIndentChar] = useState(' ');
  const [wrapLineLength, setWrapLineLength] = useState(80);

  const { mutate, data: result, isPending: loading, error, reset } = useCodeFormatter();

  const handleFormat = useCallback(() => {
    if (!code.trim()) return;
    mutate({ code, language, indentSize, indentChar, wrapLineLength });
  }, [code, language, indentSize, indentChar, wrapLineLength, mutate]);

  const handleCopy = useCallback(() => {
    if (result?.formatted_code) {
      navigator.clipboard.writeText(result.formatted_code);
    }
  }, [result]);

  const handleDownload = useCallback(() => {
    if (result?.formatted_code) {
      const blob = new Blob([result.formatted_code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `formatted.${language === 'json' ? 'json' : language === 'xml' ? 'xml' : 'js'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [result, language]);

  const handleReset = useCallback(() => {
    setCode('');
    reset();
  }, [reset]);

  const errorMessage =
    error instanceof Error
      ? error.message
      : result && !result.success
        ? result.message
        : null;

  const languages = [
    { value: 'auto', label: t('codeFormatter.language.auto') },
    { value: 'javascript', label: t('codeFormatter.language.javascript') },
    { value: 'json', label: t('codeFormatter.language.json') },
    { value: 'xml', label: t('codeFormatter.language.xml') },
    { value: 'html', label: t('codeFormatter.language.html') },
    { value: 'css', label: t('codeFormatter.language.css') },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
          <Code2 className="text-yellow-600 dark:text-yellow-400" size={32} />
          {t('codeFormatter.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('codeFormatter.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: INPUT */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <label
                htmlFor="code-input"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('codeFormatter.inputCode')}
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
              id="code-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t('codeFormatter.codePlaceholder')}
              className="w-full h-96 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {code.length} {t('codeFormatter.characters')}
            </p>
          </div>

          {/* Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div>
              <label
                htmlFor="language-select"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t('codeFormatter.language.label')}
              </label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent text-gray-900 dark:text-white"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="indent-size"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {t('codeFormatter.indentSize')}
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

              <div>
                <label
                  htmlFor="indent-char"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {t('codeFormatter.indentChar')}
                </label>
                <select
                  id="indent-char"
                  value={indentChar}
                  onChange={(e) => setIndentChar(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value=" ">{t('codeFormatter.space')}</option>
                  <option value="\t">{t('codeFormatter.tab')}</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="wrap-length"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t('codeFormatter.wrapLineLength')} ({wrapLineLength})
              </label>
              <input
                id="wrap-length"
                type="range"
                min="0"
                max="200"
                value={wrapLineLength}
                onChange={(e) => setWrapLineLength(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-600 dark:accent-yellow-400"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>0 ({t('codeFormatter.noWrap')})</span>
                <span>200</span>
              </div>
            </div>

            <button
              onClick={handleFormat}
              disabled={loading || !code.trim()}
              className="w-full py-3 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 transition-all shadow-lg hover:shadow-yellow-200 dark:hover:shadow-yellow-900/30 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  {t('codeFormatter.formatting')}
                </>
              ) : (
                <>
                  <Code2 className="w-5 h-5" />
                  {t('codeFormatter.formatBtn')}
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
                {t('codeFormatter.formattedCode')}
              </label>
              {result?.formatted_code && (
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
              value={result?.formatted_code || ''}
              placeholder={t('codeFormatter.formattedPlaceholder')}
              className="w-full h-96 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
            />
            {result?.formatted_code && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {result.formatted_length} {t('codeFormatter.characters')}
                {result.original_length && result.formatted_length && (
                  <span className="ml-2">
                    ({result.original_length} → {result.formatted_length})
                  </span>
                )}
              </p>
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



