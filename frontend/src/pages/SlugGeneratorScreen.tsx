import React, { useState, useCallback, useMemo } from 'react';
import { Link, RefreshCw, Copy, Check, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSlug } from '../hooks/useSlug';
import { ProcessButton } from '../components/ui/ProcessButton';
import { ErrorAlert } from '../components/ui/ErrorAlert';

export const SlugGeneratorScreen: React.FC = () => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const { mutate, data: result, isPending: loading, error, reset } = useSlug();

  const handleGenerate = useCallback(() => {
    if (!text.trim()) return;
    mutate({ text });
  }, [text, mutate]);

  const handleReset = useCallback(() => {
    setText('');
    reset();
    setCopied(false);
  }, [reset]);

  const handleCopy = useCallback(() => {
    if (result?.slug) {
      navigator.clipboard.writeText(result.slug);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const errorMessage = useMemo(() => {
    if (error instanceof Error) return error.message;
    if (result && !result.success) return result.message;
    return null;
  }, [error, result]);

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
          <Link className="text-orange-600 dark:text-orange-400" size={32} />
          {t('slugGenerator.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('slugGenerator.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Text Input */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('slugGenerator.inputLabel')}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('slugGenerator.inputPlaceholder')}
              className="w-full min-h-[300px] p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent font-mono text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('slugGenerator.inputHint')}</p>
          </div>

          <div className="flex items-center gap-3">
            <ProcessButton
              onClick={handleGenerate}
              disabled={!text.trim() || loading}
              loading={loading}
              labelKey="slugGenerator.generate"
              loadingLabelKey="slugGenerator.generating"
              color="orange"
            />
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              <RefreshCw size={16} />
              {t('common.reset')}
            </button>
          </div>

          <ErrorAlert message={errorMessage} />
        </div>

        {/* RIGHT: Result */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('slugGenerator.result')}
              </h2>
              {result?.slug && (
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors text-sm"
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      {t('common.copied')}
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      {t('common.copy')}
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 min-h-[300px]">
              {result?.slug ? (
                <div className="space-y-4">
                  <div className="font-mono text-sm text-gray-900 dark:text-white break-words">
                    {result.slug}
                  </div>
                  {result.original_text && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
                      {t('slugGenerator.fromText')}: <span className="font-mono">{result.original_text}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 text-sm h-full flex items-center justify-center">
                  {t('slugGenerator.placeholder')}
                </div>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  {t('slugGenerator.infoTitle')}
                </h3>
                <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                  <li>{t('slugGenerator.info1')}</li>
                  <li>{t('slugGenerator.info2')}</li>
                  <li>{t('slugGenerator.info3')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

