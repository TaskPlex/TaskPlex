import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, FileImage, Download, Upload, ArrowRight, ImageMinus } from 'lucide-react';
import { ApiService } from '../services/api';
import { useCompressImage, useConvertImage } from '../hooks/useImage';

export const ImageScreen: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [operation, setOperation] = useState<'compress' | 'convert'>('compress');
  const [quality, setQuality] = useState('medium');
  const [format, setFormat] = useState('png');

  const compressMutation = useCompressImage();
  const convertMutation = useConvertImage();

  const loading = compressMutation.isPending || convertMutation.isPending;
  const result = compressMutation.data || convertMutation.data;
  const error = compressMutation.error || convertMutation.error;

  useEffect(() => {
    compressMutation.reset();
    convertMutation.reset();
  }, [operation, file, compressMutation, convertMutation]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = () => {
    if (!file) return;
    
    if (operation === 'compress') {
      convertMutation.reset();
      compressMutation.mutate({ file, quality });
    } else {
      compressMutation.reset();
      convertMutation.mutate({ file, outputFormat: format, quality });
    }
  };

  const errorMessage = error instanceof Error ? error.message : (result && !result.success ? result.message : null);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ImageIcon className="w-8 h-8 text-blue-600" />
        Image Processing
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CONTROLS (Left) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3">Operation</label>
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              {(['compress', 'convert'] as const).map((op) => (
                <button
                  key={op}
                  onClick={() => setOperation(op)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    operation === op
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {op.charAt(0).toUpperCase() + op.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3">Image File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <FileImage className="w-6 h-6" />
                  <span className="font-medium truncate">{file.name}</span>
                </div>
              ) : (
                <div className="text-gray-500">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>Select an image</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3">Quality</label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                    quality === q
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {q.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {operation === 'convert' && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-3">Output Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {['png', 'jpeg', 'webp', 'gif', 'bmp', 'ico', 'tiff'].map(f => (
                  <option key={f} value={f}>{f.toUpperCase()}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
              !file || loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {loading ? 'Processing...' : `${operation === 'compress' ? 'Compress' : 'Convert'} Image`}
          </button>

          {errorMessage && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm">
              {errorMessage}
            </div>
          )}
        </div>

        {/* PREVIEW AREA (Right) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Original Image */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Original</h3>
              <div className="bg-gray-100 rounded-xl border border-gray-200 overflow-hidden aspect-square flex items-center justify-center relative">
                {previewUrl ? (
                  <img src={previewUrl} alt="Original" className="max-w-full max-h-full object-contain" />
                ) : (
                  <ImageMinus className="w-12 h-12 text-gray-300" />
                )}
                {file && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                )}
              </div>
            </div>

            {/* Processed Image */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center justify-between">
                Result
                {result && result.success && <span className="text-green-600 font-bold">Done!</span>}
              </h3>
              <div className="bg-gray-100 rounded-xl border border-gray-200 overflow-hidden aspect-square flex items-center justify-center relative">
                {result?.download_url ? (
                  <img 
                    src={ApiService.getDownloadUrl(result.download_url)} 
                    alt="Processed" 
                    className="max-w-full max-h-full object-contain" 
                  />
                ) : (
                  loading ? (
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="w-12 h-12 bg-gray-300 rounded-full mb-2"></div>
                      <div className="h-4 w-24 bg-gray-300 rounded"></div>
                    </div>
                  ) : (
                    <div className="text-gray-300 flex flex-col items-center">
                      <ArrowRight className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-sm">Waiting for process</span>
                    </div>
                  )
                )}
                {result?.processed_size && (
                  <div className="absolute bottom-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded font-bold shadow-sm">
                    {(result.processed_size / 1024).toFixed(1)} KB
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results & Download */}
          {result && result.success && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 bg-green-50 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-green-800 font-medium">{result.message}</p>
                  {result.compression_ratio && (
                    <p className="text-green-700 text-sm mt-1">
                      Reduced by <span className="font-bold">{result.compression_ratio.toFixed(1)}%</span>
                    </p>
                  )}
                </div>
                
                {result.download_url && (
                  <a
                    href={ApiService.getDownloadUrl(result.download_url)}
                    download={result.filename}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
                  >
                    <Download className="w-5 h-5" />
                    Download Image
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
