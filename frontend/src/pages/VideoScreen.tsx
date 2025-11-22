import React, { useState, useEffect } from 'react';
import { Video, FileVideo, Download, Play, Upload } from 'lucide-react';
import { ApiService } from '../services/api';
import { useCompressVideo, useConvertVideo } from '../hooks/useVideo';

export const VideoScreen: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [operation, setOperation] = useState<'compress' | 'convert'>('compress');
  const [quality, setQuality] = useState('medium');
  const [format, setFormat] = useState('mp4');

  const compressMutation = useCompressVideo();
  const convertMutation = useConvertVideo();

  // Unified state
  const loading = compressMutation.isPending || convertMutation.isPending;
  const result = compressMutation.data || convertMutation.data;
  const error = compressMutation.error || convertMutation.error;

  // Reset mutations when operation changes or file changes
  useEffect(() => {
    compressMutation.reset();
    convertMutation.reset();
  }, [operation, file, compressMutation, convertMutation]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!file) return;
    
    // Reset previous results
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
        <Video className="w-8 h-8 text-purple-600" />
        Video Processing
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: CONTROLS */}
        <div className="space-y-6">
          {/* Operation Selector */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3">Operation</label>
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              {(['compress', 'convert'] as const).map((op) => (
                <button
                  key={op}
                  onClick={() => setOperation(op)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    operation === op
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {op.charAt(0).toUpperCase() + op.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* File Input */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3">Video File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors relative">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-purple-600">
                  <FileVideo className="w-6 h-6" />
                  <span className="font-medium truncate">{file.name}</span>
                </div>
              ) : (
                <div className="text-gray-500">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>Drag and drop or click to select</p>
                </div>
              )}
            </div>
          </div>

          {/* Quality Selector */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3">Quality</label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                    quality === q
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {q.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Format Selector (Convert only) */}
          {operation === 'convert' && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-3">Output Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {['mp4', 'avi', 'mov', 'mkv', 'webm'].map(f => (
                  <option key={f} value={f}>{f.toUpperCase()}</option>
                ))}
              </select>
            </div>
          )}

          {/* Process Button */}
          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
              !file || loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {loading ? 'Processing...' : `${operation === 'compress' ? 'Compress' : 'Convert'} Video`}
          </button>
          
          {errorMessage && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
              {errorMessage}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: RESULT & PREVIEW */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">Result</h2>
          
          {result && result.success ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in duration-500">
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4 relative group">
                 {result.download_url && (
                  <video 
                    src={ApiService.getDownloadUrl(result.download_url)} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                 )}
              </div>

              <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-4">
                <p className="text-green-800 font-medium">{result.message}</p>
                {result.compression_ratio && (
                   <p className="text-green-600 text-sm mt-1">
                     Compression: {result.compression_ratio.toFixed(1)}%
                   </p>
                )}
              </div>

              {result.download_url && (
                <a
                  href={ApiService.getDownloadUrl(result.download_url)}
                  download
                  className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download Result
                </a>
              )}
            </div>
          ) : (
            <div className="h-64 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400">
              <Play className="w-12 h-12 mb-2 opacity-20" />
              <p>Preview will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
