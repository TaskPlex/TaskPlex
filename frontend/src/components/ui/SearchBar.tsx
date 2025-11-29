import React, { useCallback, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  autoFocus = false,
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search 
            size={20} 
            className="text-gray-400 dark:text-gray-500" 
          />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t('home.searchPlaceholder')}
          autoFocus={autoFocus}
          className="
            w-full
            pl-12 pr-12 py-3.5
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-xl
            text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400
            focus:border-transparent
            transition-all duration-200
            shadow-sm hover:shadow-md
            text-base
          "
        />

        {/* Clear Button */}
        {value && (
          <button
            onClick={handleClear}
            className="
              absolute inset-y-0 right-0 pr-4
              flex items-center
              text-gray-400 hover:text-gray-600
              dark:text-gray-500 dark:hover:text-gray-300
              transition-colors cursor-pointer
            "
            aria-label={t('common.reset')}
          >
            <X size={18} />
          </button>
        )}

        {/* Keyboard Shortcut Hint */}
        {!value && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <kbd className="
              hidden sm:inline-flex
              items-center gap-1
              px-2 py-1
              text-xs font-medium
              text-gray-400 dark:text-gray-500
              bg-gray-100 dark:bg-gray-700
              border border-gray-200 dark:border-gray-600
              rounded-md
            ">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        )}
      </div>
    </div>
  );
};

