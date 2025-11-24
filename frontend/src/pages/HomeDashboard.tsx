import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Video, Image as ImageIcon, FileText, Regex, Ruler, 
  Minimize2, RefreshCw, FileImage
} from 'lucide-react';

// Categories for filtering
type Category = 'all' | 'media' | 'document' | 'developer' | 'utility';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string; // Tailwind text color class
  category: Category;
  path: string;
  isNew?: boolean;
}

// Tools will be created dynamically with translations
const getTools = (t: (key: string) => string): Tool[] => [
  {
    id: 'video-tools',
    title: t('navigation.videoTools'),
    description: t('home.videoToolsDesc'),
    icon: Video,
    color: 'text-purple-600',
    category: 'media',
    path: '/video'
  },
  {
    id: 'image-tools',
    title: t('navigation.imageTools'),
    description: t('home.imageToolsDesc'),
    icon: ImageIcon,
    color: 'text-blue-600',
    category: 'media',
    path: '/image'
  },
  {
    id: 'pdf-tools',
    title: t('navigation.pdfTools'),
    description: t('home.pdfToolsDesc'),
    icon: FileText,
    color: 'text-red-600',
    category: 'document',
    path: '/pdf'
  },
  {
    id: 'regex-tester',
    title: t('navigation.regexTester'),
    description: t('home.regexTesterDesc'),
    icon: Regex,
    color: 'text-yellow-600',
    category: 'developer',
    path: '/regex'
  },
  {
    id: 'unit-converter',
    title: t('navigation.unitConverter'),
    description: t('home.unitConverterDesc'),
    icon: Ruler,
    color: 'text-green-600',
    category: 'utility',
    path: '/units'
  },
  {
    id: 'compress-video',
    title: t('home.compressVideo'),
    description: t('home.compressVideoDesc'),
    icon: Minimize2,
    color: 'text-purple-500',
    category: 'media',
    path: '/video',
    isNew: true
  },
  {
    id: 'organize-pdf',
    title: t('home.organizePdf'),
    description: t('home.organizePdfDesc'),
    icon: RefreshCw,
    color: 'text-red-500',
    category: 'document',
    path: '/pdf/reorganize'
  },
  {
    id: 'convert-image',
    title: t('home.convertImage'),
    description: t('home.convertImageDesc'),
    icon: FileImage,
    color: 'text-blue-500',
    category: 'media',
    path: '/image'
  }
];

const getCategories = (t: (key: string) => string): { id: Category; label: string }[] => [
  { id: 'all', label: t('home.allTools') },
  { id: 'media', label: t('home.media') },
  { id: 'document', label: t('home.documents') },
  { id: 'developer', label: t('home.developer') },
  { id: 'utility', label: t('home.utilities') },
];

export const HomeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const tools = getTools(t);
  const categories = getCategories(t);

  const filteredTools = activeCategory === 'all' 
    ? tools 
    : tools.filter(tool => tool.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <div className="bg-[#f4f0f8] py-20 px-4 text-center border-b border-gray-100">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
          {t('home.heroTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">{t('common.appName')}</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {t('home.heroSubtitle')}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.id
                    ? 'bg-gray-900 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => navigate(tool.path)}
              className="group relative flex flex-col p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 text-left h-full hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="mb-6 p-4 rounded-xl bg-gray-50 w-fit group-hover:bg-gray-100 transition-colors">
                <tool.icon size={40} className={`${tool.color} transition-transform duration-300 group-hover:scale-110`} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                {tool.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {tool.description}
              </p>

              {/* New Badge */}
              {tool.isNew && (
                <span className="absolute top-6 right-6 px-2.5 py-1 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                  {t('home.new')}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};





