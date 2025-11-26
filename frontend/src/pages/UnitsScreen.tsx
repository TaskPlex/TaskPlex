import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, ArrowRightLeft, Scale, Ruler, Thermometer, Clock, HardDrive, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConvertUnits } from '../hooks/useUnits';

const getUnitCategories = (t: (key: string) => string) => [
  {
    id: 'length',
    label: t('units.length'),
    icon: Ruler,
    units: ['meter', 'kilometer', 'centimeter', 'millimeter', 'mile', 'yard', 'foot', 'inch']
  },
  {
    id: 'mass',
    label: t('units.mass'),
    icon: Scale,
    units: ['kilogram', 'gram', 'milligram', 'metric_ton', 'pound', 'ounce']
  },
  {
    id: 'temperature',
    label: t('units.temperature'),
    icon: Thermometer,
    units: ['degC', 'degF', 'kelvin']
  },
  {
    id: 'time',
    label: t('units.time'),
    icon: Clock,
    units: ['second', 'minute', 'hour', 'day', 'week', 'year']
  },
  {
    id: 'digital',
    label: t('units.digital'),
    icon: HardDrive,
    units: ['bit', 'byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte']
  },
  {
    id: 'speed',
    label: t('units.speed'),
    icon: Activity,
    units: ['meter/second', 'kilometer/hour', 'mile/hour', 'knot']
  }
];

export const UnitsScreen: React.FC = () => {
  const { t } = useTranslation();
  const UNIT_CATEGORIES = getUnitCategories(t);
  const [category, setCategory] = useState(UNIT_CATEGORIES[0]);
  const [fromUnit, setFromUnit] = useState(UNIT_CATEGORIES[0].units[0]);
  const [toUnit, setToUnit] = useState(UNIT_CATEGORIES[0].units[1]);
  const [fromValue, setFromValue] = useState<string>('1');
  const [toValue, setToValue] = useState<string>('');

  // React Query Hook
  // On récupère directement loading et error depuis le hook !
  const { mutate: convert, isPending: loading, error } = useConvertUnits();

  // Helper function to translate unit names
  const translateUnit = (unit: string): string => {
    const translationKey = `units.unitNames.${unit}`;
    const translated = t(translationKey);
    // If translation doesn't exist, fallback to formatted unit name
    return translated !== translationKey ? translated : unit.replace(/_/g, ' ');
  };

  // Update units when category changes - use derived state instead of setState in effect
  const handleCategoryChange = (newCategory: typeof UNIT_CATEGORIES[0]) => {
    setCategory(newCategory);
    setFromUnit(newCategory.units[0]);
    setToUnit(newCategory.units[1] || newCategory.units[0]);
    setFromValue('1');
    setToValue('');
  };

  const handleConvert = useCallback(() => {
    if (!fromValue || isNaN(Number(fromValue))) {
      setToValue('');
      return;
    }

    convert(
      { value: Number(fromValue), fromUnit, toUnit },
      {
        onSuccess: (res) => {
          if (res.success) {
            const val = res.converted_value;
            const formatted = Number.isInteger(val) ? val.toString() : val.toFixed(6).replace(/\.?0+$/, '');
            setToValue(formatted);
          }
          // Si res.success est false, on pourrait lever une erreur ici pour que React Query l'attrape,
          // ou gérer un state d'erreur "business" local si on veut être puriste.
          // Pour simplifier, on assume que le backend renvoie 400 si erreur, donc 'error' du hook sera set.
        }
      }
    );
  }, [fromValue, fromUnit, toUnit, convert]);

  // Auto-convert when inputs change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleConvert();
    }, 500);
    return () => clearTimeout(timer);
  }, [handleConvert]);

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
          <Calculator className="text-blue-600 dark:text-blue-400" size={32} />
          {t('units.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('home.unitConverterDesc')}</p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {UNIT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 cursor-pointer ${
              category.id === cat.id
                ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow border border-gray-200 dark:border-gray-700'
            }`}
          >
            <cat.icon size={18} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Converter Card */}
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            
            {/* Left Side (From) */}
            <div className="flex-1 w-full space-y-4">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('units.from')}</label>
              <input
                type="number"
                value={fromValue}
                onChange={(e) => setFromValue(e.target.value)}
                className="w-full text-4xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none py-2 transition-colors"
                placeholder="0"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 font-medium focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
              >
                {category.units.map(u => (
                  <option key={u} value={u}>{translateUnit(u)}</option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <button 
              onClick={handleSwap}
              aria-label={t('units.swap')}
              className="p-4 rounded-full bg-gray-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group cursor-pointer"
            >
              <ArrowRightLeft size={24} className="group-hover:rotate-180 transition-transform duration-300" />
            </button>

            {/* Right Side (To) */}
            <div className="flex-1 w-full space-y-4">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('units.to')}</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={loading ? '...' : toValue}
                  className="w-full text-4xl font-bold text-blue-600 dark:text-blue-400 bg-transparent border-b-2 border-blue-100 dark:border-blue-900/50 py-2 focus:outline-none"
                  placeholder="0"
                />
                {loading && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-blue-200 dark:border-blue-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 font-medium focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
              >
                {category.units.map(u => (
                  <option key={u} value={u}>{translateUnit(u)}</option>
                ))}
              </select>
            </div>

          </div>

          {error && (
            <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-center font-medium">
              {/* Error is an object, we need its message */}
              {error instanceof Error ? error.message : t('common.error')}
            </div>
          )}
        </div>
        
        {/* Footer info */}
        <div className="bg-gray-50 dark:bg-gray-700/50 px-8 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <span>1 {translateUnit(fromUnit)} {t('units.equals')}</span>
          <span className="font-mono">
            {toValue && fromValue ? (Number(toValue) / Number(fromValue)).toPrecision(4) : '-'} {translateUnit(toUnit)}
          </span>
        </div>
      </div>
    </div>
  );
};
