import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Palette, Pipette, Copy, Check, Sparkles, RefreshCw } from 'lucide-react';
import { usePaletteGenerator } from '../hooks/usePaletteGenerator';
import { ErrorAlert, ProcessButton } from '../components/ui';
import type { PaletteScheme } from '../services/api';

const quickSwatches = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#9333ea', '#0ea5e9', '#ec4899', '#14b8a6'];

const schemes: { value: PaletteScheme; label: string }[] = [
  { value: 'monochromatic', label: 'Monochromatic' },
  { value: 'complementary', label: 'Complementary' },
  { value: 'triadic', label: 'Triadic' },
  { value: 'analogous', label: 'Analogous' },
  { value: 'split_complementary', label: 'Split Complementary' },
  { value: 'tetradic', label: 'Tetradic' },
];

export const PaletteGeneratorScreen: React.FC = () => {
  const { t } = useTranslation();
  const [baseColor, setBaseColor] = useState('#4f46e5');
  const [pickerValue, setPickerValue] = useState('#4f46e5');
  const [scheme, setScheme] = useState<PaletteScheme>('complementary');
  const [count, setCount] = useState(5);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const generateMutation = usePaletteGenerator();
  const result = generateMutation.data;
  const loading = generateMutation.isPending;

  const errorMessage = useMemo(() => {
    if (generateMutation.error instanceof Error) return generateMutation.error.message;
    if (result && !result.success) return result.message;
    return null;
  }, [generateMutation.error, result]);

  const handleGenerate = useCallback(() => {
    if (!baseColor.trim()) return;
    generateMutation.mutate({ baseColor: baseColor.trim(), scheme, count });
  }, [baseColor, scheme, count, generateMutation]);

  const handlePickerChange = useCallback(
    (value: string) => {
      setPickerValue(value);
      setBaseColor(value);
      generateMutation.reset();
    },
    [generateMutation]
  );

  const handleSwatchSelect = useCallback(
    (value: string) => {
      setPickerValue(value);
      setBaseColor(value);
      generateMutation.mutate({ baseColor: value, scheme, count });
    },
    [scheme, count, generateMutation]
  );

  const handleCopy = useCallback(async (value: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopiedValue(value);
    setTimeout(() => setCopiedValue(null), 1200);
  }, []);

  const handleReset = useCallback(() => {
    setBaseColor('#4f46e5');
    setPickerValue('#4f46e5');
    setScheme('complementary');
    setCount(5);
    generateMutation.reset();
  }, [generateMutation]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Palette className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('modules.design.paletteGenerator.title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('modules.design.paletteGenerator.description')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('modules.design.paletteGenerator.baseColorLabel')}
            </label>
            <input
              type="text"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="#4f46e5"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('modules.design.paletteGenerator.baseColorHint')}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('modules.design.paletteGenerator.colorPickerLabel')}
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
              aria-label={t('modules.design.paletteGenerator.colorPickerLabel')}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <Sparkles className="w-4 h-4 text-amber-500" />
              {t('modules.design.paletteGenerator.quickColors')}
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('modules.design.paletteGenerator.schemeLabel')}
            </label>
            <select
              value={scheme}
              onChange={(e) => setScheme(e.target.value as PaletteScheme)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {schemes.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('modules.design.paletteGenerator.countLabel')} ({count})
            </label>
            <input
              type="range"
              min="2"
              max="10"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>2</span>
              <span>10</span>
            </div>
          </div>

          <div className="flex gap-2">
            <ProcessButton
              onClick={handleGenerate}
              loading={loading}
              disabled={!baseColor.trim()}
              className="flex-1"
              labelKey="modules.design.paletteGenerator.generate"
              loadingLabelKey="modules.design.paletteGenerator.generating"
            />
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {errorMessage && <ErrorAlert message={errorMessage} />}
        </div>

        {/* Results */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {result?.colors && result.colors.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('modules.design.paletteGenerator.generatedPalette')}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t('modules.design.paletteGenerator.scheme')}: {result.scheme}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {result.colors.map((color, idx) => (
                    <div
                      key={`${color.hex}-${idx}`}
                      className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <div
                        className="w-full h-24"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {t('modules.design.paletteGenerator.color')} #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(color.hex)}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                            aria-label={t('common.copy')}
                          >
                            {copiedValue === color.hex || copiedValue === color.rgb || copiedValue === color.hsl ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-start gap-2">
                            <span className="text-gray-500 dark:text-gray-400 min-w-[32px]">HEX:</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(color.hex)}
                              className="font-mono text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-left break-all flex-1"
                            >
                              {color.hex}
                            </button>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-gray-500 dark:text-gray-400 min-w-[32px]">RGB:</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(color.rgb)}
                              className="font-mono text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-left break-all flex-1"
                            >
                              {color.rgb}
                            </button>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-gray-500 dark:text-gray-400 min-w-[32px]">HSL:</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(color.hsl)}
                              className="font-mono text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-left break-all flex-1"
                            >
                              {color.hsl}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Palette className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {t('modules.design.paletteGenerator.noPalette')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

