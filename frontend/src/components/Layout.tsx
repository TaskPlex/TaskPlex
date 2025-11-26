import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Menu, Settings, Star, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '../hooks/useFavorites';
import { useTheme } from '../contexts/ThemeContext';
import { getAllModules } from '../config/modules';
import { getIcon, type IconName } from '../config/icons';

// Get all available modules from the registry
const MODULES = getAllModules();

export const Layout: React.FC = () => {
  const { t } = useTranslation();
  const { isFavorite, toggleFavorite, isCollapsed, toggleSidebar } = useFavorites();
  const { resolvedTheme, toggleTheme } = useTheme();

  // Filter modules to show only favorites
  const favoriteModules = MODULES.filter(module => isFavorite(module.id));
  
  // Get icons for favorite modules
  const getFavoriteModuleIcon = (moduleIconName: string) => {
    const IconComponent = getIcon(moduleIconName as IconName);
    return <IconComponent size={20} />;
  };
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* SIDEBAR */}
      <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col transition-all duration-300`}>
        <div className={`border-b border-gray-100 dark:border-gray-700 relative ${isCollapsed ? 'p-2' : 'p-6'}`}>
          {!isCollapsed ? (
            <>
              <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
                {t('common.appName')}
              </h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('common.appTagline')}</p>
              {/* Toggle sidebar button - top right (expanded mode) */}
              <button
                onClick={toggleSidebar}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft size={18} />
              </button>
            </>
          ) : (
            <>
              {/* Toggle sidebar button - top (collapsed mode) */}
              <button
                onClick={toggleSidebar}
                className="w-full p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Expand sidebar"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Separator after toggle button when collapsed */}
          {isCollapsed && (
            <div className="mb-2 border-t border-gray-200 dark:border-gray-700"></div>
          )}
          
          {/* Dashboard always at the top */}
          <NavItem 
            to="/" 
            icon={<LayoutDashboard size={20}/>} 
            label={t('common.dashboard')} 
            isCollapsed={isCollapsed}
          />
          
          {/* Separator after dashboard when collapsed */}
          {isCollapsed && favoriteModules.length > 0 && (
            <div className="my-2 border-t border-gray-200 dark:border-gray-700"></div>
          )}
          
          {!isCollapsed && favoriteModules.length > 0 && (
            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {t('common.modules')}
            </div>
          )}

          {!isCollapsed ? (
            favoriteModules.length > 0 ? (
              favoriteModules.map(module => (
                <div key={module.id} className="group relative">
                  <NavItem 
                    to={module.path} 
                    icon={getFavoriteModuleIcon(module.icon)} 
                    label={t(module.labelKey)}
                    isCollapsed={false}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(module.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                    aria-label="Remove from favorites"
                  >
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  </button>
                </div>
              ))
            ) : (
              <div className="px-3 py-8 text-center">
                <Star size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-400 dark:text-gray-500">{t('sidebar.noFavorites')}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('sidebar.addFavoritesHint')}</p>
              </div>
            )
          ) : (
            favoriteModules.map(module => (
              <NavItem 
                key={module.id}
                to={module.path} 
                icon={getFavoriteModuleIcon(module.icon)} 
                label={t(module.labelKey)}
                isCollapsed={true}
              />
            ))
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isCollapsed ? 'px-2 py-3' : 'px-3 py-3'} w-full rounded-lg text-sm font-medium transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white cursor-pointer`}
            title={isCollapsed ? (resolvedTheme === 'dark' ? t('common.lightMode') : t('common.darkMode')) : undefined}
          >
            {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            {!isCollapsed && (
              <span>{resolvedTheme === 'dark' ? t('common.lightMode') : t('common.darkMode')}</span>
            )}
          </button>
          
          <NavItem 
            to="/settings" 
            icon={<Settings size={20}/>} 
            label={t('common.settings')}
            isCollapsed={isCollapsed}
          />
          
          {!isCollapsed && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">User</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Local Session</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <header className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <span className="font-bold text-lg text-gray-900 dark:text-white">TaskPlex</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-pointer"
            >
              {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-pointer">
              <Menu size={20}/>
            </button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
}

const NavItem = React.memo<NavItemProps>(({ to, icon, label, isCollapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isCollapsed ? 'px-2 py-3' : 'px-3 py-3'} rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
      }`
    }
    title={isCollapsed ? label : undefined}
  >
    <div className={isCollapsed ? 'flex items-center justify-center' : ''}>
      {icon}
    </div>
    {!isCollapsed && <span>{label}</span>}
  </NavLink>
));

NavItem.displayName = 'NavItem';
