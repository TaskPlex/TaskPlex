import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, Pipette, Copy, Check, Download, Code, RefreshCw, Plus, X } from 'lucide-react';
import { useGradientGenerator } from '../hooks/useGradientGenerator';
import { ErrorAlert, ProcessButton } from '../components/ui';
import { ColorWheel } from '../components/ui/ColorWheel';
import { ApiService } from '../services/api';
import { useDownload } from '../hooks/useDownload';
import type { GradientType } from '../services/api';

const quickColors = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#9333ea', '#0ea5e9', '#ec4899', '#14b8a6'];

const gradientTypes: { value: GradientType; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'radial', label: 'Radial' },
  { value: 'conic', label: 'Conic' },
];

export const GradientGeneratorScreen: React.FC = () => {
  const { t } = useTranslation();
  const [colors, setColors] = useState<string[]>(['#2563eb', '#0ea5e9']);
  const [type, setType] = useState<GradientType>('linear');
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [angle, setAngle] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);

  const generateMutation = useGradientGenerator();
  const result = generateMutation.data;
  const loading = generateMutation.isPending;
  const { downloadDirect } = useDownload();

  const errorMessage = useMemo(() => {
    if (generateMutation.error instanceof Error) return generateMutation.error.message;
    if (result && !result.success) return result.message;
    return null;
  }, [generateMutation.error, result]);

  const handleGenerate = useCallback(() => {
    if (colors.length < 2) return;
    generateMutation.mutate({ colors, type, width, height, angle });
  }, [colors, type, width, height, angle, generateMutation]);

  const handleAddColor = useCallback(() => {
    if (colors.length < 10) {
      setColors([...colors, '#000000']);
    }
  }, [colors]);

  const handleRemoveColor = useCallback(
    (index: number) => {
      if (colors.length > 2) {
        setColors(colors.filter((_, i) => i !== index));
      }
    },
    [colors]
  );

  const handleColorChange = useCallback(
    (index: number, value: string) => {
      const newColors = [...colors];
      newColors[index] = value;
      setColors(newColors);
    },
    [colors]
  );

  const handleColorWheelSelect = useCallback(
    (color: string, index?: number) => {
      if (index !== undefined && index !== null) {
        // Clic sur un point existant - juste sélectionner
        setSelectedColorIndex(index);
      } else if (selectedColorIndex !== null && selectedColorIndex >= 0 && selectedColorIndex < colors.length) {
        // Mettre à jour la couleur sélectionnée
        handleColorChange(selectedColorIndex, color);
      } else if (colors.length < 10) {
        // Ajouter une nouvelle couleur
        setColors([...colors, color]);
        setSelectedColorIndex(colors.length);
      }
    },
    [colors, selectedColorIndex, handleColorChange]
  );

  const handleCopy = useCallback(async (value: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied((prev) => (prev === value ? null : prev)), 1200);
  }, []);

  const handleDownload = useCallback(() => {
    if (!result?.download_url) return;
    const url = ApiService.getDownloadUrl(result.download_url);
    const filename = result.filename || result.download_url.split('/').pop() || 'gradient.png';
    downloadDirect(url, filename);
  }, [result, downloadDirect]);

  const handleReset = useCallback(() => {
    setColors(['#2563eb', '#0ea5e9']);
    setType('linear');
    setWidth(800);
    setHeight(600);
    setAngle(0);
    generateMutation.reset();
  }, [generateMutation]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Layers className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('modules.design.gradientGenerator.title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('modules.design.gradientGenerator.description')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('modules.design.gradientGenerator.colorsLabel')}
            </label>
            <div className="space-y-2">
              {colors.map((color, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    onClick={() => setSelectedColorIndex(index)}
                    className={`w-12 h-10 rounded-lg border-2 cursor-pointer transition ${
                      selectedColorIndex === index
                        ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800'
                        : 'border-gray-200 dark:border-gray-700'
                    } bg-white dark:bg-gray-900`}
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    onClick={() => setSelectedColorIndex(index)}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 font-mono text-sm transition ${
                      selectedColorIndex === index
                        ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800'
                        : 'border-gray-200 dark:border-gray-700'
                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="#000000"
                  />
                  {colors.length > 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        handleRemoveColor(index);
                        if (selectedColorIndex === index) {
                          setSelectedColorIndex(null);
                        } else if (selectedColorIndex !== null && selectedColorIndex > index) {
                          setSelectedColorIndex(selectedColorIndex - 1);
                        }
                      }}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {colors.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="w-full px-3 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('modules.design.gradientGenerator.addColor')}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('modules.design.gradientGenerator.colorWheelLabel')}
            </label>
            <div className="flex justify-center bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <ColorWheel
                colors={colors}
                onColorSelect={handleColorWheelSelect}
                size={250}
                selectedIndex={selectedColorIndex}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              {t('modules.design.gradientGenerator.colorWheelHelp')}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <Pipette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {t('modules.design.gradientGenerator.quickColors')}
            </div>
            <div className="flex flex-wrap gap-2">
              {quickColors.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => {
                    if (colors.length < 10) {
                      setColors([...colors, swatch]);
                    }
                  }}
                  className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:scale-105 transition"
                  style={{ backgroundColor: swatch }}
                  aria-label={swatch}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('modules.design.gradientGenerator.typeLabel')}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as GradientType)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {gradientTypes.map((gt) => (
                <option key={gt.value} value={gt.value}>
                  {gt.label}
                </option>
              ))}
            </select>
          </div>

          {type === 'linear' || type === 'conic' ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('modules.design.gradientGenerator.angleLabel')} ({angle}°)
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>0°</span>
                <span>360°</span>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('modules.design.gradientGenerator.widthLabel')}
              </label>
              <input
                type="number"
                min="100"
                max="4000"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('modules.design.gradientGenerator.heightLabel')}
              </label>
              <input
                type="number"
                min="100"
                max="4000"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <ProcessButton
              onClick={handleGenerate}
              loading={loading}
              disabled={colors.length < 2}
              className="flex-1"
              labelKey="modules.design.gradientGenerator.generate"
              loadingLabelKey="modules.design.gradientGenerator.generating"
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
        <div className="lg:col-span-8 space-y-6">
          {result?.filename ? (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('modules.design.gradientGenerator.preview')}
                  </h2>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {t('modules.design.gradientGenerator.download')}
                  </button>
                </div>
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  {result.download_url && (
                    <img
                      src={ApiService.getDownloadUrl(result.download_url)}
                      alt="Gradient preview"
                      className="w-full h-auto"
                      style={{ maxHeight: '400px', objectFit: 'contain' }}
                    />
                  )}
                </div>
              </div>

              {result.css_code && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      {t('modules.design.gradientGenerator.cssCode')}
                    </h2>
                    <button
                      type="button"
                      onClick={() => handleCopy(result.css_code || '')}
                      className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
                    >
                      {copied === result.css_code ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
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
                  <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm text-gray-800 dark:text-gray-200">
                      background: {result.css_code};
                    </code>
                  </pre>
                </div>
              )}

              {result.svg_code && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      {t('modules.design.gradientGenerator.svgCode')}
                    </h2>
                    <button
                      type="button"
                      onClick={() => handleCopy(result.svg_code || '')}
                      className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
                    >
                      {copied === result.svg_code ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
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
                  <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm text-gray-800 dark:text-gray-200">
                      {result.svg_code}
                    </code>
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Layers className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {t('modules.design.gradientGenerator.noGradient')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

