import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Layout } from './components/Layout';
import { LoadingFallback } from './components/LoadingFallback';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DownloadNotificationProvider } from './contexts/DownloadNotificationContext';
import { DownloadNotifications } from './components/ui';
import { getAllModules } from './config/modules';

// Helper function to create lazy components with better error handling
const createLazyComponent = <T extends React.ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<{ [K: string]: T }>,
  componentName: string
) => {
  return lazy(async () => {
    try {
      const module = await importFn();
      const component = module[componentName];
      if (!component) {
        throw new Error(`Component ${componentName} not found in module. Available exports: ${Object.keys(module).join(', ')}`);
      }
      return { default: component };
    } catch (error) {
      console.error(`Failed to load component ${componentName}:`, error);
      throw error;
    }
  });
};

// Lazy load all page components for code splitting
const HomeDashboard = createLazyComponent(() => import('./pages/HomeDashboard'), 'HomeDashboard');
const VideoScreen = createLazyComponent(() => import('./pages/VideoScreen'), 'VideoScreen');
const ImageScreen = createLazyComponent(() => import('./pages/ImageScreen'), 'ImageScreen');
const RegexScreen = createLazyComponent(() => import('./pages/RegexScreen'), 'RegexScreen');
const UnitsScreen = createLazyComponent(() => import('./pages/UnitsScreen'), 'UnitsScreen');
const QRCodeScreen = createLazyComponent(() => import('./pages/QRCodeScreen'), 'QRCodeScreen');
const CodeFormatterScreen = createLazyComponent(() => import('./pages/CodeFormatterScreen'), 'CodeFormatterScreen');
const CSSMinifierScreen = createLazyComponent(() => import('./pages/CSSMinifierScreen'), 'CSSMinifierScreen');
const JSMinifierScreen = createLazyComponent(() => import('./pages/JSMinifierScreen'), 'JSMinifierScreen');
const JSONFormatterScreen = createLazyComponent(() => import('./pages/JSONFormatterScreen'), 'JSONFormatterScreen');
const JSONMinifierScreen = createLazyComponent(() => import('./pages/JSONMinifierScreen'), 'JSONMinifierScreen');
const XMLFormatterScreen = createLazyComponent(() => import('./pages/XMLFormatterScreen'), 'XMLFormatterScreen');
const CodeMinifierScreen = createLazyComponent(() => import('./pages/CodeMinifierScreen'), 'CodeMinifierScreen');
const HTMLFormatterScreen = createLazyComponent(() => import('./pages/HTMLFormatterScreen'), 'HTMLFormatterScreen');
const HTMLMinifierScreen = createLazyComponent(() => import('./pages/HTMLMinifierScreen'), 'HTMLMinifierScreen');
const CSSFormatterScreen = createLazyComponent(() => import('./pages/CSSFormatterScreen'), 'CSSFormatterScreen');
const JSFormatterScreen = createLazyComponent(() => import('./pages/JSFormatterScreen'), 'JSFormatterScreen');
const XMLMinifierScreen = createLazyComponent(() => import('./pages/XMLMinifierScreen'), 'XMLMinifierScreen');
const SettingsScreen = createLazyComponent(() => import('./pages/SettingsScreen'), 'SettingsScreen');
const PlaceholderScreen = createLazyComponent(() => import('./pages/PlaceholderScreen'), 'PlaceholderScreen');

// PDF Module - lazy loaded (heavy dependencies like react-pdf)
const PDFCompress = createLazyComponent(() => import('./pages/pdf/PDFCompress'), 'PDFCompress');
const PDFMerge = createLazyComponent(() => import('./pages/pdf/PDFMerge'), 'PDFMerge');
const PDFSplit = createLazyComponent(() => import('./pages/pdf/PDFSplit'), 'PDFSplit');
const PDFReorganize = createLazyComponent(() => import('./pages/pdf/PDFReorganize'), 'PDFReorganize');
const PDFOCR = createLazyComponent(() => import('./pages/pdf/PDFOCR'), 'PDFOCR');
const PDFPassword = createLazyComponent(() => import('./pages/pdf/PDFPassword'), 'PDFPassword');

// Map module IDs to their corresponding React components
const componentMap: Record<string, React.LazyExoticComponent<React.ComponentType<Record<string, unknown>>>> = {
  // Video
  'video-compress': VideoScreen,
  'video-convert': VideoScreen,
  
  // Image
  'image-compress': ImageScreen,
  'image-convert': ImageScreen,
  
  // PDF
  'pdf-compress': PDFCompress,
  'pdf-merge': PDFMerge,
  'pdf-split': PDFSplit,
  'pdf-reorganize': PDFReorganize,
  'pdf-ocr': PDFOCR,
  'pdf-password': PDFPassword,
  
  // Developer
  'regex': RegexScreen,
  'units': UnitsScreen,
  'qr-generator': QRCodeScreen,
  'code-formatter': CodeFormatterScreen,
  'code-minifier': CodeMinifierScreen,
  'html-formatter': HTMLFormatterScreen,
  'html-minifier': HTMLMinifierScreen,
  'css-formatter': CSSFormatterScreen,
  'css-minifier': CSSMinifierScreen,
  'js-formatter': JSFormatterScreen,
  'js-minifier': JSMinifierScreen,
  'json-formatter': JSONFormatterScreen,
  'json-minifier': JSONMinifierScreen,
  'xml-formatter': XMLFormatterScreen,
  'xml-minifier': XMLMinifierScreen,
};

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache by default
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  // Get all modules and generate routes dynamically
  const allModules = getAllModules();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <FavoritesProvider>
            <DownloadNotificationProvider>
              <BrowserRouter>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<Layout />}>
                      <Route index element={<HomeDashboard />} />
                      
                      {/* Dynamically generate routes from module registry */}
                      {allModules.map((module) => {
                        // Get the component for this module (either implemented or placeholder)
                        const Component = componentMap[module.id] || PlaceholderScreen;
                        
                        return (
                          <Route 
                            key={module.id} 
                            path={module.path} 
                            element={<Component />} 
                          />
                        );
                      })}

                      <Route path="settings" element={<SettingsScreen />} />
                    </Route>
                  </Routes>
                </Suspense>
              </BrowserRouter>
              {/* Download notifications toast */}
              <DownloadNotifications />
            </DownloadNotificationProvider>
          </FavoritesProvider>
        </ThemeProvider>
        {/* Devtools only in development */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

