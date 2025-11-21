import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomeDashboard } from './pages/HomeDashboard';
import { VideoScreen } from './pages/VideoScreen';
import { ImageScreen } from './pages/ImageScreen';
import { RegexScreen } from './pages/RegexScreen';
import { UnitsScreen } from './pages/UnitsScreen';
// PDF Module
import { PDFDashboard } from './pages/pdf/PDFDashboard';
import { PDFCompress } from './pages/pdf/PDFCompress';
import { PDFMerge } from './pages/pdf/PDFMerge';
import { PDFSplit } from './pages/pdf/PDFSplit';
import { PDFReorganize } from './pages/pdf/PDFReorganize';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomeDashboard />} />
          <Route path="video" element={<VideoScreen />} />
          <Route path="image" element={<ImageScreen />} />
          
          {/* PDF Module Routes */}
          <Route path="pdf">
            <Route index element={<PDFDashboard />} />
            <Route path="compress" element={<PDFCompress />} />
            <Route path="merge" element={<PDFMerge />} />
            <Route path="split" element={<PDFSplit />} />
            <Route path="reorganize" element={<PDFReorganize />} />
          </Route>

          <Route path="regex" element={<RegexScreen />} />
          <Route path="units" element={<UnitsScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
