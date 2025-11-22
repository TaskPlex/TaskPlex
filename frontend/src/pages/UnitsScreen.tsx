import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, ArrowRightLeft, Scale, Ruler, Thermometer, Clock, HardDrive, Activity } from 'lucide-react';
import { useConvertUnits } from '../hooks/useUnits';

const UNIT_CATEGORIES = [
  {
    id: 'length',
    label: 'Length',
    icon: Ruler,
    units: ['meter', 'kilometer', 'centimeter', 'millimeter', 'mile', 'yard', 'foot', 'inch']
  },
  {
    id: 'mass',
    label: 'Mass',
    icon: Scale,
    units: ['kilogram', 'gram', 'milligram', 'metric_ton', 'pound', 'ounce']
  },
  {
    id: 'temperature',
    label: 'Temperature',
    icon: Thermometer,
    units: ['degC', 'degF', 'kelvin']
  },
  {
    id: 'time',
    label: 'Time',
    icon: Clock,
    units: ['second', 'minute', 'hour', 'day', 'week', 'year']
  },
  {
    id: 'digital',
    label: 'Digital Storage',
    icon: HardDrive,
    units: ['bit', 'byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte']
  },
  {
    id: 'speed',
    label: 'Speed',
    icon: Activity,
    units: ['meter/second', 'kilometer/hour', 'mile/hour', 'knot']
  }
];

export const UnitsScreen: React.FC = () => {
  const [category, setCategory] = useState(UNIT_CATEGORIES[0]);
  const [fromUnit, setFromUnit] = useState(UNIT_CATEGORIES[0].units[0]);
  const [toUnit, setToUnit] = useState(UNIT_CATEGORIES[0].units[1]);
  const [fromValue, setFromValue] = useState<string>('1');
  const [toValue, setToValue] = useState<string>('');

  // React Query Hook
  // On récupère directement loading et error depuis le hook !
  const { mutate: convert, isPending: loading, error } = useConvertUnits();

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
          <Calculator className="text-blue-600" size={32} />
          Unit Converter
        </h1>
        <p className="text-gray-600">Convert between thousands of units instantly</p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {UNIT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              category.id === cat.id
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm hover:shadow'
            }`}
          >
            <cat.icon size={18} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Converter Card */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            
            {/* Left Side (From) */}
            <div className="flex-1 w-full space-y-4">
              <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider">From</label>
              <input
                type="number"
                value={fromValue}
                onChange={(e) => setFromValue(e.target.value)}
                className="w-full text-4xl font-bold text-gray-900 bg-transparent border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none py-2 transition-colors"
                placeholder="0"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {category.units.map(u => (
                  <option key={u} value={u}>{u.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <button 
              onClick={handleSwap}
              aria-label="Swap units"
              className="p-4 rounded-full bg-gray-50 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
            >
              <ArrowRightLeft size={24} className="group-hover:rotate-180 transition-transform duration-300" />
            </button>

            {/* Right Side (To) */}
            <div className="flex-1 w-full space-y-4">
              <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider">To</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={loading ? '...' : toValue}
                  className="w-full text-4xl font-bold text-blue-600 bg-transparent border-b-2 border-blue-100 py-2 focus:outline-none"
                  placeholder="0"
                />
                {loading && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {category.units.map(u => (
                  <option key={u} value={u}>{u.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

          </div>

          {error && (
            <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-xl text-center font-medium">
              {/* Error is an object, we need its message */}
              {error instanceof Error ? error.message : 'Conversion failed'}
            </div>
          )}
        </div>
        
        {/* Footer info */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
          <span>1 {fromUnit.replace(/_/g, ' ')} =</span>
          <span className="font-mono">
            {toValue && fromValue ? (Number(toValue) / Number(fromValue)).toPrecision(4) : '-'} {toUnit.replace(/_/g, ' ')}
          </span>
        </div>
      </div>
    </div>
  );
};
