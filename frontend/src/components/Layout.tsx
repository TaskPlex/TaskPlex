import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Video, Image, FileText, Regex, Ruler, Menu } from 'lucide-react';

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
  };
  
  const loader = routeMap[routePath];
  if (loader) {
    loader().catch(() => {
      // Silently fail if preload fails
    });
  }
};

export const Layout: React.FC = () => {
  const location = useLocation();
  
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
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
            TaskPlex
          </h1>
          <p className="text-xs text-gray-400 mt-1">The Universal Tool</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem to="/" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Modules
          </div>
          <NavItem to="/video" icon={<Video size={20}/>} label="Video Tools" />
          <NavItem to="/image" icon={<Image size={20}/>} label="Image Tools" />
          <NavItem to="/pdf" icon={<FileText size={20}/>} label="PDF Tools" />
          <NavItem to="/regex" icon={<Regex size={20}/>} label="Regex Tester" />
          <NavItem to="/units" icon={<Ruler size={20}/>} label="Unit Converter" />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
            <div>
              <p className="text-sm font-medium text-gray-700">User</p>
              <p className="text-xs text-gray-500">Local Session</p>
            </div>
          </div>
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

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <NavLink
    to={to}
    onMouseEnter={() => preloadRoute(to)}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-purple-50 text-purple-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);





