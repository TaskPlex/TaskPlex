import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Palette, Pipette, Droplet, Copy, Check, Sparkles } from 'lucide-react';
import { useConvertColor } from '../hooks/useColor';
import { ErrorAlert, ProcessButton } from '../components/ui';

const quickSwatches = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#9333ea', '#0ea5e9'];

export const ColorConverterScreen: React.FC = () => {
  const { t } = useTranslation();
  const [colorValue, setColorValue] = useState('#4f46e5');
  const [pickerValue, setPickerValue] = useState('#4f46e5');
  const [copied, setCopied] = useState<string | null>(null);

  const convertMutation = useConvertColor();
  const result = convertMutation.data;
  const loading = convertMutation.isPending;

  const errorMessage = useMemo(() => {
    if (convertMutation.error instanceof Error) return convertMutation.error.message;
    if (result && !result.success) return result.message;
    return null;
  }, [convertMutation.error, result]);

  const currentPreview = result?.normalized_hex || pickerValue || '#4f46e5';

  const handleConvert = useCallback(() => {
    if (!colorValue.trim()) return;
    convertMutation.mutate({ color: colorValue.trim() });
  }, [colorValue, convertMutation]);

  const handlePickerChange = useCallback(
    (value: string) => {
      setPickerValue(value);
      setColorValue(value);
      convertMutation.reset();
    },
    [convertMutation]
  );

  const handleSwatchSelect = useCallback(
    (value: string) => {
      setPickerValue(value);
      setColorValue(value);
      convertMutation.mutate({ color: value });
    },
    [convertMutation]
  );

  const handleCopy = useCallback(async (value: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied((prev) => (prev === value ? null : prev)), 1200);
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Palette className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('colorConverter.title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('colorConverter.subtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('colorConverter.inputLabel')}
            </label>
            <input
              type="text"
              value={colorValue}
              onChange={(e) => setColorValue(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('colorConverter.inputPlaceholder')}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('colorConverter.inputHelp')}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('colorConverter.pickerLabel')}
              </label>
              <div className="flex items-center gap-2">
                <Pipette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{pickerValue}</span>
              </div>
            </div>
            <input
              type="color"
              value={pickerValue}
              onChange={(e) => handlePickerChange(e.target.value)}
              className="w-full h-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer"
              aria-label={t('colorConverter.pickerLabel')}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <Sparkles className="w-4 h-4 text-amber-500" />
              {t('colorConverter.quickColors')}
            </div>
            <div className="flex flex-wrap gap-2">
              {quickSwatches.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => handleSwatchSelect(swatch)}
                  className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:scale-105 transition"
                  style={{ backgroundColor: swatch }}
                  aria-label={swatch}
                />
              ))}
            </div>
          </div>

          <ProcessButton
            onClick={handleConvert}
            disabled={!colorValue.trim()}
            loading={loading}
            labelKey="colorConverter.convertButton"
            loadingLabelKey="colorConverter.processing"
            color="blue"
          />

          <ErrorAlert message={errorMessage ?? undefined} />
        </div>

        {/* Results */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Droplet className="w-4 h-4" />
                {t('colorConverter.preview')}
              </h3>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                <div
                  className="h-40 w-full"
                  style={{ backgroundColor: currentPreview }}
                  aria-label={currentPreview}
                />
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {currentPreview}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t('colorConverter.inputFormat', { format: result?.input_format ?? 'hex' })}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentPreview)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {copied === currentPreview ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied === currentPreview ? t('colorConverter.copied') : t('colorConverter.copy')}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4" />
                {t('colorConverter.formats')}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {(['hex', 'rgb', 'hsl', 'cmyk'] as const).map((key) => {
                  const value = result?.formats?.[key] || '';
                  const label = t(`colorConverter.${key}`);
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs uppercase text-gray-500 dark:text-gray-400">{label}</span>
                        <span className="font-mono text-sm text-gray-900 dark:text-white break-all">{value || '—'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(value)}
                        disabled={!value}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {copied === value ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied === value ? t('colorConverter.copied') : t('colorConverter.copy')}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Pipette className="w-4 h-4" />
              {t('colorConverter.components')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'R', value: result?.components?.r },
                { label: 'G', value: result?.components?.g },
                { label: 'B', value: result?.components?.b },
                { label: 'H', value: result?.components?.h },
                { label: 'S', value: result?.components?.s },
                { label: 'L', value: result?.components?.l },
                { label: 'C', value: result?.components?.c },
                { label: 'K', value: result?.components?.k },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-center shadow-sm"
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.value !== undefined && item.value !== null ? item.value : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

