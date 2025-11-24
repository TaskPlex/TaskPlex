import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Layout } from './components/Layout';
import { LoadingFallback } from './components/LoadingFallback';
import { ErrorBoundary } from './components/ErrorBoundary';

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
const SettingsScreen = createLazyComponent(() => import('./pages/SettingsScreen'), 'SettingsScreen');

// PDF Module - lazy loaded (heavy dependencies like react-pdf)
const PDFDashboard = createLazyComponent(() => import('./pages/pdf/PDFDashboard'), 'PDFDashboard');
const PDFCompress = createLazyComponent(() => import('./pages/pdf/PDFCompress'), 'PDFCompress');
const PDFMerge = createLazyComponent(() => import('./pages/pdf/PDFMerge'), 'PDFMerge');
const PDFSplit = createLazyComponent(() => import('./pages/pdf/PDFSplit'), 'PDFSplit');
const PDFReorganize = createLazyComponent(() => import('./pages/pdf/PDFReorganize'), 'PDFReorganize');

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
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomeDashboard />} />
                <Route path="video" element={<VideoScreen />} />
                <Route path="image" element={<ImageScreen />} />
                
                {/* PDF Module Routes - Heavy dependencies loaded on demand */}
                <Route path="pdf">
                  <Route index element={<PDFDashboard />} />
                  <Route path="compress" element={<PDFCompress />} />
                  <Route path="merge" element={<PDFMerge />} />
                  <Route path="split" element={<PDFSplit />} />
                  <Route path="reorganize" element={<PDFReorganize />} />
                </Route>

                <Route path="regex" element={<RegexScreen />} />
                <Route path="units" element={<UnitsScreen />} />
                <Route path="settings" element={<SettingsScreen />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
        {/* Devtools only in development */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

