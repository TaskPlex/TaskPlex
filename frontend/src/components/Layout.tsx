import React, { useMemo, useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Menu, Settings, Moon, Sun, X, FileText, Video, Image, Music, Code, Database, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { getAllModules, type ModuleDefinition } from '../config/modules';
import { NavDropdown } from './ui/NavDropdown';

// Get all available modules from the registry
const ALL_MODULES = getAllModules();

// Helper to filter modules by ID prefix
const filterByPrefix = (prefix: string): ModuleDefinition[] => 
  ALL_MODULES.filter(m => m.id.startsWith(prefix));

// Helper to filter modules by category
const filterByCategory = (category: string): ModuleDefinition[] => 
  ALL_MODULES.filter(m => m.category === category);

export const Layout: React.FC = () => {
  const { t } = useTranslation();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Organize modules for nav dropdowns
  const navGroups = useMemo(() => ({
    pdf: filterByPrefix('pdf-'),
    video: filterByPrefix('video-'),
    image: filterByPrefix('image-'),
    audio: filterByPrefix('audio-'),
    code: filterByCategory('code'),
    convert: filterByCategory('convert'),
    generators: filterByCategory('generators'),
    text: filterByCategory('text'),
    security: filterByCategory('security'),
    design: filterByCategory('design'),
  }), []);

  // More tools = security + design
  const moreToolsModules = useMemo(() => [
    ...navGroups.security,
    ...navGroups.design,
  ], [navGroups]);

  // Category icons mapping
  const categoryIcons = {
    pdf: FileText,
    video: Video,
    image: Image,
    audio: Music,
    code: Code,
    convert: Database,
    generators: Code,
    text: Code,
    more: MoreHorizontal,
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* TOP NAVBAR with dropdowns */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between h-16 gap-4">
              {/* Logo */}
              <Link to="/" className="flex items-center h-full px-4 -mx-4 cursor-pointer">
                <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all leading-none">
                  TaskPlex
                </span>
              </Link>

              {/* Desktop Navigation - Centered */}
              <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
                <NavDropdown 
                  label={t('nav.pdf')}
                  modules={navGroups.pdf}
                  columns={navGroups.pdf.length > 5 ? 2 : 1}
                  icon={categoryIcons.pdf}
                />
                <NavDropdown 
                  label={t('nav.video')}
                  modules={navGroups.video}
                  columns={navGroups.video.length > 5 ? 2 : 1}
                  icon={categoryIcons.video}
                />
                <NavDropdown 
                  label={t('nav.image')}
                  modules={navGroups.image}
                  columns={navGroups.image.length > 5 ? 2 : 1}
                  icon={categoryIcons.image}
                />
                <NavDropdown 
                  label={t('nav.audio')}
                  modules={navGroups.audio}
                  columns={navGroups.audio.length > 5 ? 2 : 1}
                  icon={categoryIcons.audio}
                />
                <NavDropdown 
                  label={t('nav.code')}
                  modules={navGroups.code}
                  columns={navGroups.code.length > 5 ? 2 : 1}
                  icon={categoryIcons.code}
                />
                <NavDropdown 
                  label={t('nav.convert')}
                  modules={navGroups.convert}
                  columns={navGroups.convert.length > 5 ? 2 : 1}
                  icon={categoryIcons.convert}
                />
                <NavDropdown 
                  label={t('nav.generators')}
                  modules={navGroups.generators}
                  columns={navGroups.generators.length > 5 ? 2 : 1}
                  icon={categoryIcons.generators}
                />
                <NavDropdown 
                  label={t('nav.text')}
                  modules={navGroups.text}
                  columns={navGroups.text.length > 5 ? 2 : 1}
                  icon={categoryIcons.text}
                />
                <NavDropdown 
                  label={t('nav.more')}
                  modules={moreToolsModules}
                  columns={moreToolsModules.length > 5 ? 2 : 1}
                  icon={categoryIcons.more}
                />
              </nav>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  aria-label={resolvedTheme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
                >
                  {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Settings Button */}
                <Link
                  to="/settings"
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  aria-label={t('common.settings')}
                >
                  <Settings size={20} />
                </Link>

                {/* Mobile Menu Toggle */}
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  aria-label="Menu"
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm py-4 px-4">
              <nav className="space-y-1">
                <MobileNavLink to="/" label={t('common.dashboard')} icon={<LayoutDashboard size={20} />} onClick={() => setMobileMenuOpen(false)} />
                <div className="pt-2 pb-1 px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('nav.categories') || 'Categories'}
                </div>
                <MobileNavLink to="/pdf/compress" label={t('nav.pdf')} icon={<FileText size={20} />} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink to="/video/compress" label={t('nav.video')} icon={<Video size={20} />} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink to="/image/compress" label={t('nav.image')} icon={<Image size={20} />} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink to="/audio/convert" label={t('nav.audio')} icon={<Music size={20} />} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink to="/dev/regex" label={t('nav.devTools')} icon={<Code size={20} />} onClick={() => setMobileMenuOpen(false)} />
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                  <MobileNavLink to="/settings" label={t('common.settings')} icon={<Settings size={20} />} onClick={() => setMobileMenuOpen(false)} />
                </div>
              </nav>
            </div>
          )}
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// Mobile navigation link component
interface MobileNavLinkProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ to, label, icon, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-400 shadow-sm'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`
    }
  >
    {icon && <span className="opacity-70 group-[.active]:opacity-100">{icon}</span>}
    <span>{label}</span>
  </NavLink>
);
