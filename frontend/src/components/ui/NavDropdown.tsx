import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ModuleDefinition } from '../../config/modules';
import { getIcon, type IconName } from '../../config/icons';

interface NavDropdownProps {
  label: string;
  modules: ModuleDefinition[];
  columns?: 1 | 2;
  columnLabels?: [string, string];
  splitByStatus?: boolean;
}

export const NavDropdown: React.FC<NavDropdownProps> = ({
  label,
  modules,
  columns = 1,
  columnLabels,
  splitByStatus = false,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  // Split modules for two columns if needed
  const getColumnModules = (): [ModuleDefinition[], ModuleDefinition[]] => {
    if (columns === 1) {
      return [modules, []];
    }
    
    if (splitByStatus) {
      const implemented = modules.filter(m => m.status === 'implemented');
      const placeholder = modules.filter(m => m.status === 'placeholder');
      return [implemented, placeholder];
    }
    
    // Split in half
    const midpoint = Math.ceil(modules.length / 2);
    return [modules.slice(0, midpoint), modules.slice(midpoint)];
  };

  const [leftColumn, rightColumn] = getColumnModules();

  const renderModuleLink = (module: ModuleDefinition) => {
    const IconComponent = getIcon(module.icon as IconName);
    
    return (
      <Link
        key={module.id}
        to={module.path}
        onClick={() => setIsOpen(false)}
        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group"
      >
        <IconComponent 
          size={20} 
          className={`${module.color} transition-transform group-hover:scale-110`} 
        />
        <div className="flex-1 min-w-0">
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
            {t(module.labelKey)}
          </span>
        </div>
        {module.status === 'placeholder' && (
          <span className="text-[10px] px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded uppercase font-medium">
            {t('home.comingSoon')}
          </span>
        )}
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
          flex items-center gap-1.5 px-4 py-2 
          text-sm font-semibold uppercase tracking-wide
          transition-colors cursor-pointer
          ${isOpen 
            ? 'text-purple-600 dark:text-purple-400' 
            : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
          }
        `}
      >
        {label}
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className={`
            absolute top-full left-0 mt-1
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-xl shadow-xl
            py-3
            z-50
            animate-in fade-in slide-in-from-top-2 duration-200
            ${columns === 2 ? 'min-w-[500px]' : 'min-w-[280px]'}
          `}
        >
          {columns === 2 ? (
            <div className="flex">
              {/* Left Column */}
              <div className="flex-1 px-2">
                {columnLabels && (
                  <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {columnLabels[0]}
                  </div>
                )}
                <div className="space-y-0.5">
                  {leftColumn.map(renderModuleLink)}
                </div>
              </div>
              
              {/* Divider */}
              <div className="w-px bg-gray-200 dark:bg-gray-700 my-2" />
              
              {/* Right Column */}
              <div className="flex-1 px-2">
                {columnLabels && (
                  <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {columnLabels[1]}
                  </div>
                )}
                <div className="space-y-0.5">
                  {rightColumn.map(renderModuleLink)}
                </div>
              </div>
            </div>
          ) : (
            <div className="px-2 space-y-0.5 max-h-[400px] overflow-y-auto">
              {modules.map(renderModuleLink)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

