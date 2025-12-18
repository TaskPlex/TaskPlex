import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ModuleDefinition } from '../../config/modules';
import { getIcon, type IconName } from '../../config/icons';
import { useFavorites } from '../../hooks/useFavorites';

interface NavDropdownProps {
  label: string;
  modules: ModuleDefinition[];
  columns?: 1 | 2;
  icon?: LucideIcon;
}

export const NavDropdown: React.FC<NavDropdownProps> = ({
  label,
  modules,
  columns = 1,
  icon: Icon,
}) => {
  const { t } = useTranslation();
  const { isFavorite } = useFavorites();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sort modules: favorites first, then alphabetically by title
  const sortedModules = useMemo(() => {
    return [...modules].sort((a, b) => {
      const aIsFavorite = isFavorite(a.id);
      const bIsFavorite = isFavorite(b.id);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      // If both are favorites or both are not, sort alphabetically by title
      const aTitle = t(a.labelKey).toLowerCase();
      const bTitle = t(b.labelKey).toLowerCase();
      return aTitle.localeCompare(bTitle);
    });
  }, [modules, isFavorite, t]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    
    // Clear any pending open timeout
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }
    
    // Small delay before opening to let other dropdowns close first
    openTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 50);
  };

  const handleMouseLeave = () => {
    // Clear any pending open timeout
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    
    // Close immediately when leaving
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 50);
  };

  // Split modules into columns (max 2 columns, max 5 items per column)
  const getColumnModules = (): ModuleDefinition[][] => {
    if (columns === 1) {
      return [sortedModules];
    }
    
    // Maximum 2 columns, 5 items per column
    const maxItemsPerColumn = 5;
    const result: ModuleDefinition[][] = [];
    
    // First column: up to 5 items
    const firstColumn = sortedModules.slice(0, maxItemsPerColumn);
    result.push(firstColumn);
    
    // Second column: remaining items (if any)
    if (sortedModules.length > maxItemsPerColumn) {
      const secondColumn = sortedModules.slice(maxItemsPerColumn);
      result.push(secondColumn);
    }
    
    return result;
  };

  const columnModules = getColumnModules();

  const renderModuleLink = (module: ModuleDefinition) => {
    const IconComponent = getIcon(module.icon as IconName);
    
    return (
      <Link
        key={module.id}
        to={module.path}
        onClick={() => setIsOpen(false)}
        className="flex items-center gap-3 px-3 py-1.5 hover:bg-purple-50 dark:hover:bg-purple-900 rounded-lg transition-all duration-200 group w-full"
      >
        <div className={`flex-shrink-0 p-1 rounded-md bg-gray-50 dark:bg-gray-700/50 group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors`}>
          <IconComponent 
            size={16} 
            className={`${module.color} transition-transform group-hover:scale-110`} 
          />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 min-w-0">
            <span className="block text-xs font-semibold text-gray-700 dark:text-gray-200 truncate flex-1 min-w-0">
              {t(module.labelKey)}
            </span>
            {isFavorite(module.id) && (
              <Star size={12} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
            )}
            {module.status === 'placeholder' && (
              <span className="text-[10px] px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded uppercase font-medium flex-shrink-0">
                {t('home.comingSoon')}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div 
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2.5 
          text-sm font-semibold
          rounded-lg
          transition-all duration-200 cursor-pointer
          ${isOpen 
            ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30' 
            : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }
        `}
      >
        {Icon && <Icon size={18} className={isOpen ? 'text-purple-600 dark:text-purple-400' : ''} />}
        <span>{label}</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className={`
            absolute top-full left-1/2 -translate-x-1/2 mt-4
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-xl shadow-2xl
            py-1.5
            z-50
            animate-in fade-in slide-in-from-top-2 duration-200
            ${columns === 2 ? 'w-[520px]' : 'w-[256px]'}
            before:content-[''] before:absolute before:-top-2 before:left-1/2 before:-translate-x-1/2
            before:w-4 before:h-4 before:bg-white dark:before:bg-gray-800
            before:border-l before:border-t before:border-gray-200 dark:before:border-gray-700
            before:rotate-45
          `}
        >
          {columns > 1 ? (
            <div className="flex">
              {(() => {
                // Check if any column has more than 5 items
                const anyColumnHasMoreThan5 = columnModules.some(col => col.length > 5);
                return columnModules.map((columnModules, colIndex) => (
                  <React.Fragment key={colIndex}>
                    {colIndex > 0 && (
                      <div className="w-px bg-gray-200/50 dark:bg-gray-700/50 my-3" />
                    )}
                    <div className="w-[256px] px-1">
                      <div className={`space-y-0 px-1 pb-1 ${anyColumnHasMoreThan5 ? 'max-h-[190px] overflow-y-auto' : ''}`}>
                        {columnModules.map(renderModuleLink)}
                      </div>
                    </div>
                  </React.Fragment>
                ));
              })()}
            </div>
          ) : (
            <div className="px-1 space-y-0 max-h-[400px] overflow-y-auto">
              {sortedModules.map(renderModuleLink)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

