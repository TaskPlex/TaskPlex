import React, { useState, useEffect } from 'react';
import { RefreshCw, Upload, FileText } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ApiService } from '../../services/api';
import { useReorganizePDF } from '../../hooks/usePDF';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker using CDN to ensure correct version and MIME type
// This avoids issues with local Nginx configuration or bundler paths
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFPage {
  id: string;
  originalIndex: number;
}

const SortablePage = ({ page }: { page: PDFPage }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: page.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-move hover:shadow-md transition-shadow" {...attributes} {...listeners}>
      <div className="p-2 pointer-events-none">
        <Page 
          pageNumber={page.originalIndex + 1} 
          width={150} 
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="mx-auto shadow-sm"
        />
      </div>
      <div className="bg-gray-50 px-3 py-2 text-xs text-center font-medium border-t border-gray-100 text-gray-600">
        Page {page.originalIndex + 1}
      </div>
    </div>
  );
};

export const PDFReorganize: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PDFPage[]>([]);

  const { mutate, isPending: loading, data: result, error, reset } = useReorganizePDF();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Effect to auto-download when result is available
  useEffect(() => {
    if (result && result.download_url) {
      const link = document.createElement('a');
      link.href = ApiService.getDownloadUrl(result.download_url);
      link.download = result.filename || 'download.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [result]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      reset();
      setPages([]);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    const newPages = Array.from({ length: numPages }, (_, i) => ({
      id: `page-${i}`,
      originalIndex: i,
    }));
    setPages(newPages);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleReorganize = () => {
    if (!file) return;
    const order = pages.map(p => p.originalIndex + 1).join(',');
    mutate({ file, pageOrder: order });
  };

  const errorMessage = error instanceof Error ? error.message : (result && !result.success ? result.message : null);

  return (
    <div className="p-8 max-w-6xl mx-auto h-screen flex flex-col">
      <div className="text-center mb-6 flex-none">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
          <RefreshCw className="text-purple-600" size={32} />
          Organize PDF
        </h1>
        <p className="text-gray-600">Sort, add or delete PDF pages. Drag and drop pages to reorder.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col min-h-0 overflow-hidden">
        {!file ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 transition-colors relative group cursor-pointer max-w-xl w-full">
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Upload className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Select PDF file</h3>
              <p className="text-gray-500">or drop PDF here</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white flex-none">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <span className="font-medium text-gray-900">{file.name}</span>
                <span className="text-sm text-gray-500">({pages.length} pages)</span>
              </div>
              <div className="flex gap-3 items-center">
                {errorMessage && <span className="text-red-600 text-sm mr-2">{errorMessage}</span>}
                <button 
                  onClick={() => { setFile(null); reset(); }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReorganize}
                  disabled={loading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
                >
                  {loading ? 'Processing...' : 'Organize'}
                </button>
              </div>
            </div>

            {/* Grid Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
              <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={pages.map(p => p.id)} 
                  strategy={rectSortingStrategy}
                >
                  <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-5xl mx-auto"
                    loading={<div className="col-span-full text-center py-12 text-gray-400">Loading PDF Preview...</div>}
                    error={<div className="col-span-full text-center py-12 text-red-500">Failed to load PDF file. Please ensure you are connected to internet for the worker to load.</div>}
                  >
                    {pages.map((page) => (
                      <SortablePage key={page.id} page={page} />
                    ))}
                  </Document>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
