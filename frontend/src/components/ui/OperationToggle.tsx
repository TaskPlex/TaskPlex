import React from 'react';
import { useTranslation } from 'react-i18next';

interface Operation {
  id: string;
  labelKey: string;
}

interface OperationToggleProps {
  operations: Operation[];
  value: string;
  onChange: (operationId: string) => void;
  labelKey?: string;
  color?: 'purple' | 'blue' | 'red' | 'green';
  className?: string;
  disabled?: boolean;
}

const colorClasses = {
  purple: 'bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 shadow-sm',
  blue: 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-sm',
  red: 'bg-white dark:bg-gray-700 text-red-700 dark:text-red-300 shadow-sm',
  green: 'bg-white dark:bg-gray-700 text-green-700 dark:text-green-300 shadow-sm',
};

export const OperationToggle: React.FC<OperationToggleProps> = ({
  operations,
  value,
  onChange,
  labelKey,
  color = 'purple',
  className = '',
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}>
      {labelKey && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t(labelKey)}
        </label>
      )}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
        {operations.map((op) => (
          <button
            key={op.id}
            type="button"
            onClick={() => onChange(op.id)}
            disabled={disabled}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              value === op.id
                ? colorClasses[color]
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {t(op.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
};
