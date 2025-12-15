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
const RotateVideoScreen = createLazyComponent(() => import('./pages/RotateVideoScreen'), 'RotateVideoScreen');
const ExtractAudioScreen = createLazyComponent(() => import('./pages/ExtractAudioScreen'), 'ExtractAudioScreen');
const VideoToGIFScreen = createLazyComponent(() => import('./pages/VideoToGIFScreen'), 'VideoToGIFScreen');
const VideoMergeScreen = createLazyComponent(() => import('./pages/VideoMergeScreen'), 'VideoMergeScreen');
const ImageScreen = createLazyComponent(() => import('./pages/ImageScreen'), 'ImageScreen');
const RotateImageScreen = createLazyComponent(() => import('./pages/RotateImageScreen'), 'RotateImageScreen');
const AdjustImageScreen = createLazyComponent(() => import('./pages/AdjustImageScreen'), 'AdjustImageScreen');
const ExtractColorsScreen = createLazyComponent(() => import('./pages/ExtractColorsScreen'), 'ExtractColorsScreen');
const ResizeImageScreen = createLazyComponent(() => import('./pages/ResizeImageScreen'), 'ResizeImageScreen');
const RegexScreen = createLazyComponent(() => import('./pages/RegexScreen'), 'RegexScreen');
const UnitsScreen = createLazyComponent(() => import('./pages/UnitsScreen'), 'UnitsScreen');
const QRCodeScreen = createLazyComponent(() => import('./pages/QRCodeScreen'), 'QRCodeScreen');
const QRCodeReaderScreen = createLazyComponent(() => import('./pages/QRCodeReaderScreen'), 'QRCodeReaderScreen');
const BarcodeGeneratorScreen = createLazyComponent(() => import('./pages/BarcodeGeneratorScreen'), 'BarcodeGeneratorScreen');
const CodeFormatterScreen = createLazyComponent(() => import('./pages/CodeFormatterScreen'), 'CodeFormatterScreen');
const CSSMinifierScreen = createLazyComponent(() => import('./pages/CSSMinifierScreen'), 'CSSMinifierScreen');
const JSMinifierScreen = createLazyComponent(() => import('./pages/JSMinifierScreen'), 'JSMinifierScreen');
const JSONFormatterScreen = createLazyComponent(() => import('./pages/JSONFormatterScreen'), 'JSONFormatterScreen');
const JSONMinifierScreen = createLazyComponent(() => import('./pages/JSONMinifierScreen'), 'JSONMinifierScreen');
const JSONDataGeneratorScreen = createLazyComponent(() => import('./pages/JSONDataGeneratorScreen'), 'JSONDataGeneratorScreen');
const XMLFormatterScreen = createLazyComponent(() => import('./pages/XMLFormatterScreen'), 'XMLFormatterScreen');
const CodeMinifierScreen = createLazyComponent(() => import('./pages/CodeMinifierScreen'), 'CodeMinifierScreen');
const HTMLFormatterScreen = createLazyComponent(() => import('./pages/HTMLFormatterScreen'), 'HTMLFormatterScreen');
const HTMLValidatorScreen = createLazyComponent(() => import('./pages/HTMLValidatorScreen'), 'HTMLValidatorScreen');
const JSONValidatorScreen = createLazyComponent(() => import('./pages/JSONValidatorScreen'), 'JSONValidatorScreen');
const XMLValidatorScreen = createLazyComponent(() => import('./pages/XMLValidatorScreen'), 'XMLValidatorScreen');
const JSValidatorScreen = createLazyComponent(() => import('./pages/JSValidatorScreen'), 'JSValidatorScreen');
const PyValidatorScreen = createLazyComponent(() => import('./pages/PyValidatorScreen'), 'PyValidatorScreen');
const HTMLMinifierScreen = createLazyComponent(() => import('./pages/HTMLMinifierScreen'), 'HTMLMinifierScreen');
const CSSFormatterScreen = createLazyComponent(() => import('./pages/CSSFormatterScreen'), 'CSSFormatterScreen');
const JSFormatterScreen = createLazyComponent(() => import('./pages/JSFormatterScreen'), 'JSFormatterScreen');
const XMLMinifierScreen = createLazyComponent(() => import('./pages/XMLMinifierScreen'), 'XMLMinifierScreen');
const TextFormatterScreen = createLazyComponent(() => import('./pages/TextFormatterScreen'), 'TextFormatterScreen');
const FilterImageScreen = createLazyComponent(() => import('./pages/FilterImageScreen'), 'FilterImageScreen');
const CreateCollageScreen = createLazyComponent(() => import('./pages/CreateCollageScreen'), 'CreateCollageScreen');
const HashGeneratorScreen = createLazyComponent(() => import('./pages/HashGeneratorScreen'), 'HashGeneratorScreen');
const PasswordGeneratorScreen = createLazyComponent(() => import('./pages/PasswordGeneratorScreen'), 'PasswordGeneratorScreen');
const PasswordCheckerScreen = createLazyComponent(() => import('./pages/PasswordCheckerScreen'), 'PasswordCheckerScreen');
const UUIDGeneratorScreen = createLazyComponent(() => import('./pages/UUIDGeneratorScreen'), 'UUIDGeneratorScreen');
const URLEncoderScreen = createLazyComponent(() => import('./pages/URLEncoderScreen'), 'URLEncoderScreen');
const Base64Screen = createLazyComponent(() => import('./pages/Base64Screen'), 'Base64Screen');
const Base64EncodeScreen = createLazyComponent(() => import('./pages/Base64EncodeScreen'), 'Base64EncodeScreen');
const Base64DecodeScreen = createLazyComponent(() => import('./pages/Base64DecodeScreen'), 'Base64DecodeScreen');
const SettingsScreen = createLazyComponent(() => import('./pages/SettingsScreen'), 'SettingsScreen');
const PlaceholderScreen = createLazyComponent(() => import('./pages/PlaceholderScreen'), 'PlaceholderScreen');
const ColorConverterScreen = createLazyComponent(() => import('./pages/ColorConverterScreen'), 'ColorConverterScreen');
const NumberConverterScreen = createLazyComponent(() => import('./pages/NumberConverterScreen'), 'NumberConverterScreen');
const LoremIpsumScreen = createLazyComponent(() => import('./pages/LoremIpsumScreen'), 'LoremIpsumScreen');
const WordCounterScreen = createLazyComponent(() => import('./pages/WordCounterScreen'), 'WordCounterScreen');
const AccentRemoverScreen = createLazyComponent(() => import('./pages/AccentRemoverScreen'), 'AccentRemoverScreen');
const CaseConverterScreen = createLazyComponent(() => import('./pages/CaseConverterScreen'), 'CaseConverterScreen');
const KeywordExtractorScreen = createLazyComponent(() => import('./pages/KeywordExtractorScreen'), 'KeywordExtractorScreen');
const EmailExtractorScreen = createLazyComponent(() => import('./pages/EmailExtractorScreen'), 'EmailExtractorScreen');
const URLExtractorScreen = createLazyComponent(() => import('./pages/URLExtractorScreen'), 'URLExtractorScreen');
const PaletteGeneratorScreen = createLazyComponent(() => import('./pages/PaletteGeneratorScreen'), 'PaletteGeneratorScreen');
const GradientGeneratorScreen = createLazyComponent(() => import('./pages/GradientGeneratorScreen'), 'GradientGeneratorScreen');
const CSVToJSONScreen = createLazyComponent(() => import('./pages/CSVToJSONScreen'), 'CSVToJSONScreen');
const JSONToCSVScreen = createLazyComponent(() => import('./pages/JSONToCSVScreen'), 'JSONToCSVScreen');
const AudioConvertScreen = createLazyComponent(() => import('./pages/AudioConvertScreen'), 'AudioConvertScreen');
const AudioCompressScreen = createLazyComponent(() => import('./pages/AudioCompressScreen'), 'AudioCompressScreen');

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
  'video-rotate': RotateVideoScreen,
  'video-extract-audio': ExtractAudioScreen,
  'video-to-gif': VideoToGIFScreen,
  'audio-convert': AudioConvertScreen,
  'audio-compress': AudioCompressScreen,
  'video-merge': VideoMergeScreen,
  
  // Image
  'image-compress': ImageScreen,
  'image-convert': ImageScreen,
  'image-rotate': RotateImageScreen,
  'image-adjust': AdjustImageScreen,
  'image-filters': FilterImageScreen,
  'image-extract-colors': ExtractColorsScreen,
  'image-collage': CreateCollageScreen,
  'image-resize': ResizeImageScreen,
  
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
  'qr-reader': QRCodeReaderScreen,
  'barcode-generator': BarcodeGeneratorScreen,
  'color-converter': ColorConverterScreen,
  'number-converter': NumberConverterScreen,
  'lorem-ipsum': LoremIpsumScreen,
  'word-counter': WordCounterScreen,
  'accent-remover': AccentRemoverScreen,
  'case-converter': CaseConverterScreen,
  'keyword-extractor': KeywordExtractorScreen,
  'email-extractor': EmailExtractorScreen,
    'url-extractor': URLExtractorScreen,
    'palette-generator': PaletteGeneratorScreen,
    'gradient-generator': GradientGeneratorScreen,
    'fake-data-generator': JSONDataGeneratorScreen,
    
    // Data
    'csv-to-json': CSVToJSONScreen,
    'json-to-csv': JSONToCSVScreen,
  'code-formatter': CodeFormatterScreen,
  'code-minifier': CodeMinifierScreen,
  'html-formatter': HTMLFormatterScreen,
  'html-validator': HTMLValidatorScreen,
  'json-validator': JSONValidatorScreen,
  'xml-validator': XMLValidatorScreen,
  'js-validator': JSValidatorScreen,
  'py-validator': PyValidatorScreen,
  'html-minifier': HTMLMinifierScreen,
  'css-formatter': CSSFormatterScreen,
  'css-minifier': CSSMinifierScreen,
  'js-formatter': JSFormatterScreen,
  'js-minifier': JSMinifierScreen,
  'json-formatter': JSONFormatterScreen,
  'json-minifier': JSONMinifierScreen,
  'xml-formatter': XMLFormatterScreen,
  'xml-minifier': XMLMinifierScreen,
  'text-format': TextFormatterScreen,
  'hash-generator': HashGeneratorScreen,
  'password-generator': PasswordGeneratorScreen,
  'password-checker': PasswordCheckerScreen,
  'uuid-generator': UUIDGeneratorScreen,
  'url-encoder': URLEncoderScreen,
  'base64-encoder': Base64Screen,
  'base64-only-encode': Base64EncodeScreen,
  'base64-only-decode': Base64DecodeScreen,
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

