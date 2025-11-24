import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Video, Image, FileText, Regex, Ruler, Menu, Settings, Star, ChevronLeft, ChevronRight, Minimize2, RefreshCw, FileImage } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '../hooks/useFavorites';

// Preload route components on hover for better UX
const preloadRoute = (routePath: string) => {
  const routeMap: Record<string, () => Promise<unknown>> = {
    '/': () => import('../pages/HomeDashboard'),
    '/video': () => import('../pages/VideoScreen'),
    '/image': () => import('../pages/ImageScreen'),
    '/regex': () => import('../pages/RegexScreen'),
    '/units': () => import('../pages/UnitsScreen'),
    '/pdf': () => import('../pages/pdf/PDFDashboard'),
    '/pdf/compress': () => import('../pages/pdf/PDFCompress'),
    '/pdf/merge': () => import('../pages/pdf/PDFMerge'),
    '/pdf/split': () => import('../pages/pdf/PDFSplit'),
    '/pdf/reorganize': () => import('../pages/pdf/PDFReorganize'),
    '/settings': () => import('../pages/SettingsScreen'),
  };
  
  const loader = routeMap[routePath];
  if (loader) {
    loader().catch(() => {
      // Silently fail if preload fails
    });
  }
};

// Available modules configuration - includes all tools
const MODULES = [
  { id: 'video', path: '/video', icon: Video, labelKey: 'navigation.videoTools' },
  { id: 'image', path: '/image', icon: Image, labelKey: 'navigation.imageTools' },
  { id: 'pdf', path: '/pdf', icon: FileText, labelKey: 'navigation.pdfTools' },
  { id: 'regex', path: '/regex', icon: Regex, labelKey: 'navigation.regexTester' },
  { id: 'units', path: '/units', icon: Ruler, labelKey: 'navigation.unitConverter' },
  // Sub-modules
  { id: 'compress-video', path: '/video', icon: Minimize2, labelKey: 'home.compressVideo' },
  { id: 'organize-pdf', path: '/pdf/reorganize', icon: RefreshCw, labelKey: 'home.organizePdf' },
  { id: 'convert-image', path: '/image', icon: FileImage, labelKey: 'home.convertImage' },
];

export const Layout: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { isFavorite, toggleFavorite, isCollapsed, toggleSidebar } = useFavorites();
  
  // Preload adjacent routes when user is on a page
  React.useEffect(() => {
    const preloadAdjacentRoutes = () => {
      // Preload common routes
      preloadRoute('/');
      preloadRoute('/video');
      preloadRoute('/image');
      preloadRoute('/pdf');
    };
    
    // Small delay to not interfere with current page load
    const timer = setTimeout(preloadAdjacentRoutes, 1000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Filter modules to show only favorites
  const favoriteModules = MODULES.filter(module => isFavorite(module.id));
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 hidden md:flex flex-col transition-all duration-300`}>
        <div className={`border-b border-gray-100 relative ${isCollapsed ? 'p-2' : 'p-6'}`}>
          {!isCollapsed ? (
            <>
              <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                {t('common.appName')}
              </h1>
              <p className="text-xs text-gray-400 mt-1">{t('common.appTagline')}</p>
              {/* Toggle sidebar button - top right (expanded mode) */}
              <button
                onClick={toggleSidebar}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
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
                className="w-full p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex items-center justify-center"
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
            <div className="mb-2 border-t border-gray-200"></div>
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
            <div className="my-2 border-t border-gray-200"></div>
          )}
          
          {!isCollapsed && favoriteModules.length > 0 && (
            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t('common.modules')}
            </div>
          )}

          {!isCollapsed ? (
            favoriteModules.length > 0 ? (
              favoriteModules.map(module => (
                <div key={module.id} className="group relative">
                  <NavItem 
                    to={module.path} 
                    icon={<module.icon size={20}/>} 
                    label={t(module.labelKey)}
                    isCollapsed={false}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(module.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                    aria-label="Remove from favorites"
                  >
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  </button>
                </div>
              ))
            ) : (
              <div className="px-3 py-8 text-center">
                <Star size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">{t('sidebar.noFavorites')}</p>
                <p className="text-xs text-gray-400 mt-1">{t('sidebar.addFavoritesHint')}</p>
              </div>
            )
          ) : (
            favoriteModules.map(module => (
              <NavItem 
                key={module.id}
                to={module.path} 
                icon={<module.icon size={20}/>} 
                label={t(module.labelKey)}
                isCollapsed={true}
              />
            ))
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <NavItem 
            to="/settings" 
            icon={<Settings size={20}/>} 
            label={t('common.settings')}
            isCollapsed={isCollapsed}
          />
          
          {!isCollapsed && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-700">User</p>
                <p className="text-xs text-gray-500">Local Session</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto">
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <span className="font-bold text-lg">TaskPlex</span>
          <button className="p-2 rounded-md bg-gray-100"><Menu size={20}/></button>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, label, isCollapsed }: { to: string; icon: React.ReactNode; label: string; isCollapsed: boolean }) => (
  <NavLink
    to={to}
    onMouseEnter={() => preloadRoute(to)}
    className={({ isActive }) =>
      `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isCollapsed ? 'px-2 py-3' : 'px-3 py-3'} rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-purple-50 text-purple-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`
    }
    title={isCollapsed ? label : undefined}
  >
    <div className={isCollapsed ? 'flex items-center justify-center' : ''}>
      {icon}
    </div>
    {!isCollapsed && <span>{label}</span>}
  </NavLink>
);





