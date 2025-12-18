import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, SearchX } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { useModuleSearch } from '../hooks/useModuleSearch';
import { getAllModules, type ModuleDefinition } from '../config/modules';
import { getIcon, type IconName } from '../config/icons';
import { SearchBar } from '../components/ui/SearchBar';

// Module Card component - memoized for performance
interface ModuleCardProps {
  module: ModuleDefinition;
  isFavorite: boolean;
  onToggleFavorite: (moduleId: string) => void;
  onNavigate: (path: string) => void;
  t: (key: string) => string;
}

const ModuleCard = React.memo<ModuleCardProps>(({ 
  module, 
  isFavorite: isFav, 
  onToggleFavorite, 
  onNavigate,
  t 
}) => {
  const ModuleIcon = getIcon(module.icon as IconName);

  return (
    <div className="group relative flex flex-col p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-purple-900/20 transition-all duration-300 h-full hover:-translate-y-1 cursor-pointer">
      <button
        onClick={() => onNavigate(module.path)}
        className="flex-1 text-left cursor-pointer"
      >
        {/* Icon */}
        <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-700 w-fit group-hover:bg-gray-100 dark:group-hover:bg-gray-600 transition-colors">
          {React.createElement(ModuleIcon, {
            size: 40,
            className: `${module.color} transition-transform duration-300 group-hover:scale-110`,
          })}
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {t(module.labelKey)}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
          {t(module.descriptionKey)}
        </p>
      </button>

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(module.id);
        }}
        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10 cursor-pointer"
        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Star 
          size={20} 
          className={`transition-all ${
            isFav 
              ? 'text-yellow-500 fill-yellow-500' 
              : 'text-gray-400 dark:text-gray-500 hover:text-yellow-500'
          }`} 
        />
      </button>

      {/* Placeholder Badge */}
      {module.status === 'placeholder' && (
        <span className="absolute bottom-4 left-4 px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 text-[10px] font-bold uppercase tracking-wider rounded-full">
          {t('home.comingSoon')}
        </span>
      )}
    </div>
  );
});

ModuleCard.displayName = 'ModuleCard';

export const HomeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const { isFavorite, toggleFavorite } = useFavorites();
  const { searchModules } = useModuleSearch();

  // Get all modules from registry
  const allModules = getAllModules();
  
  // Apply search filter and sort favorites first, then alphabetically (memoized for performance)
  const filteredModules = useMemo(() => {
    const filtered = searchModules(allModules, searchQuery);
    // Sort: favorites first, then alphabetically by title
    return filtered.sort((a, b) => {
      const aIsFavorite = isFavorite(a.id);
      const bIsFavorite = isFavorite(b.id);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      // If both are favorites or both are not, sort alphabetically by title
      const aTitle = t(a.labelKey).toLowerCase();
      const bTitle = t(b.labelKey).toLowerCase();
      return aTitle.localeCompare(bTitle);
    });
  }, [allModules, searchQuery, searchModules, isFavorite, t]);
  
  // Check if we have no results
  const hasNoResults = searchQuery.trim() !== '' && filteredModules.length === 0;

  // Memoized handlers
  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return (
    <div className="min-h-full bg-gray-50/50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-purple-50 to-transparent dark:from-gray-800/50 dark:to-transparent py-16 px-4 text-center overflow-hidden backdrop-blur-sm">
        {/* Animated sinusoidal line */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            {/* Smooth sinusoidal wave using cubic Bezier curves */}
            <path
              d="M 0,100 Q 250,20 500,100 T 1000,100 T 1500,100 T 2000,100 T 2500,100 T 3000,100"
              strokeWidth="2"
              fill="none"
              className="stroke-gray-600/30 dark:stroke-white/40"
              style={{ filter: 'blur(0.5px)' }}
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 0"
                to="-1000 0"
                dur="12s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
            {t('home.heroTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">{t('common.appName')}</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
            {t('home.heroSubtitle')}
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-[1600px] mx-auto px-2 py-12">
        {hasNoResults ? (
          /* No Results State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
              <SearchX size={48} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {t('home.noResults')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              {t('home.noResultsHint')}
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-6 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
            >
              {t('common.reset')}
            </button>
          </div>
        ) : (
          /* Modules Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredModules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                isFavorite={isFavorite(module.id)}
                onToggleFavorite={toggleFavorite}
                onNavigate={handleNavigate}
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
