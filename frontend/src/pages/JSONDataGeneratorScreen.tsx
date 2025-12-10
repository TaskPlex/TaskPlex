import React, { useState, useCallback, useMemo } from 'react';
import { Database, Copy, Download, RefreshCw, FileJson } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useJSONDataGenerator } from '../hooks/useJSONDataGenerator';
import { ProcessButton } from '../components/ui/ProcessButton';
import { ErrorAlert } from '../components/ui/ErrorAlert';

// Example template with regex placeholders
// Note: In JSON strings, backslashes must be escaped as \\
const EXAMPLE_TEMPLATE = JSON.stringify({
  id: "{{regex:\\d{1,5}}}",
  name: "{{regex:[A-Z][a-z]+}}",
  email: "{{regex:[a-z]+@[a-z]+\\.com}}",
  age: "{{regex:[2-9][0-9]}}",
  city: "{{regex:[A-Z][a-z]+}}",
  country: "{{regex:[A-Z]{2}}}"
}, null, 2);

export const JSONDataGeneratorScreen: React.FC = () => {
  const { t } = useTranslation();
  const [template, setTemplate] = useState(EXAMPLE_TEMPLATE);
  const [iterations, setIterations] = useState(5);
  const [copied, setCopied] = useState(false);

  const { mutate, data: result, isPending: loading, error, reset } = useJSONDataGenerator();

  const handleGenerate = useCallback(() => {
    if (!template.trim()) return;
    mutate({ template: template.trim(), iterations });
  }, [template, iterations, mutate]);

  const handleLoadExample = useCallback(() => {
    setTemplate(EXAMPLE_TEMPLATE);
    reset();
  }, [reset]);

  const handleReset = useCallback(() => {
    setTemplate('');
    setIterations(5);
    reset();
    setCopied(false);
  }, [reset]);

  const handleCopy = useCallback(() => {
    if (result?.generated_data) {
      const jsonString = JSON.stringify(result.generated_data, null, 2);
      navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const handleDownload = useCallback(() => {
    if (result?.generated_data) {
      const jsonString = JSON.stringify(result.generated_data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [result]);

  const errorMessage = error instanceof Error ? error.message : (result && !result.success ? result.message : null);

  const generatedJSONString = useMemo(() => {
    if (!result?.generated_data) return '';
    return JSON.stringify(result.generated_data, null, 2);
  }, [result]);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
          <Database className="text-yellow-600 dark:text-yellow-400" size={32} />
          {t('jsonDataGenerator.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('jsonDataGenerator.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Template Input */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <label
                htmlFor="template-input"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('jsonDataGenerator.template')}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleLoadExample}
                  className="text-xs px-3 py-1 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                  disabled={loading}
                >
                  {t('jsonDataGenerator.loadExample')}
                </button>
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1"
                  disabled={loading}
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('common.reset')}
                </button>
              </div>
            </div>
            <textarea
              id="template-input"
              value={template}
              onChange={(e) => {
                setTemplate(e.target.value);
                reset();
              }}
              placeholder={t('jsonDataGenerator.templatePlaceholder')}
              className="w-full h-96 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              disabled={loading}
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {t('jsonDataGenerator.templateHint')}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <label
              htmlFor="iterations"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {t('jsonDataGenerator.iterations')} ({iterations})
            </label>
            <input
              id="iterations"
              type="range"
              min="1"
              max="100"
              step="1"
              value={iterations}
              onChange={(e) => {
                setIterations(Number(e.target.value));
                reset();
              }}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-600 dark:accent-yellow-400"
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1</span>
              <span>100</span>
            </div>
            <input
              type="number"
              min="1"
              max="1000"
              value={iterations}
              onChange={(e) => {
                const val = Math.max(1, Math.min(1000, Number(e.target.value) || 1));
                setIterations(val);
                reset();
              }}
              className="mt-3 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <ProcessButton
            onClick={handleGenerate}
            disabled={!template.trim() || loading}
            loading={loading}
            labelKey="jsonDataGenerator.generate"
            loadingLabelKey="jsonDataGenerator.generating"
            color="green"
          />

          <ErrorAlert message={errorMessage} />
        </div>

        {/* RIGHT: Generated Data */}
        <div className="space-y-6">
          {result?.success && result.generated_data && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('jsonDataGenerator.result')} ({result.count} {t('jsonDataGenerator.items')})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title={t('common.copy')}
                  >
                    {copied ? (
                      <Copy className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title={t('common.download')}
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 overflow-auto max-h-[600px]">
                <pre className="text-xs font-mono text-gray-900 dark:text-white whitespace-pre-wrap">
                  {generatedJSONString}
                </pre>
              </div>
            </div>
          )}

          {!result && (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <FileJson className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t('jsonDataGenerator.noResult')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

