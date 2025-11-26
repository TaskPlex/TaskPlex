import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { getAllModules, CATEGORIES, type ModuleCategory, type ModuleDefinition } from '../config/modules';
import { getIcon, type IconName } from '../config/icons';

// Extended category type to include 'all'
type Category = ModuleCategory | 'all';

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

      {/* New Badge */}
      {module.isNew && (
        <span className="absolute top-4 left-4 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider rounded-full">
          {t('home.new')}
        </span>
      )}

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

// Category Button component - memoized for performance
interface CategoryButtonProps {
  category: { id: Category; label: string };
  isActive: boolean;
  onClick: () => void;
}

const CategoryButton = React.memo<CategoryButtonProps>(({ category, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
      isActive
        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg transform scale-105'
        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
    }`}
  >
    {category.label}
  </button>
));

CategoryButton.displayName = 'CategoryButton';

export const HomeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const { isFavorite, toggleFavorite } = useFavorites();

  // Get all modules from registry
  const allModules = getAllModules();
  
  // Filter modules by category
  const filteredModules = activeCategory === 'all' 
    ? allModules 
    : allModules.filter(module => module.category === activeCategory);
  
  // Get categories with translations
  const categories = CATEGORIES.map(cat => ({
    id: cat.id as Category,
    label: t(cat.labelKey)
  }));

  // Memoized handlers
  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const handleCategoryChange = useCallback((categoryId: Category) => {
    setActiveCategory(categoryId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-[#f4f0f8] dark:bg-gray-800/50 py-20 px-4 text-center border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
          {t('home.heroTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">{t('common.appName')}</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          {t('home.heroSubtitle')}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max justify-center">
            {categories.map((cat) => (
              <CategoryButton
                key={cat.id}
                category={cat}
                isActive={activeCategory === cat.id}
                onClick={() => handleCategoryChange(cat.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
      </div>
    </div>
  );
};
