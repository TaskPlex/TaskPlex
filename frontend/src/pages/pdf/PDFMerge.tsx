import React, { useState } from 'react';
import { Merge, Upload, Download, FileText, Plus, X } from 'lucide-react';
import { ApiService } from '../../services/api';
import { useMergePDFs } from '../../hooks/usePDF';

export const PDFMerge: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const { mutate, isPending: loading, data: result, error, reset } = useMergePDFs();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      reset();
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    reset();
  };

  const handleMerge = () => {
    if (files.length < 2) return;
    mutate({ files });
  };

  const errorMessage = error instanceof Error ? error.message : (result && !result.success ? result.message : null);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
          <Merge className="text-red-600" size={32} />
          Merge PDF
        </h1>
        <p className="text-gray-600">Combine multiple PDFs into one unified document.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {files.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 transition-colors relative group cursor-pointer">
            <input 
              type="file" 
              accept=".pdf" 
              multiple
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            />
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
              <Upload className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Select PDF files</h3>
            <p className="text-gray-500">or drop PDFs here</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button 
                    onClick={() => removeFile(index)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              
              <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center gap-2 text-gray-500 hover:text-red-600 hover:border-red-200">
                <input 
                  type="file" 
                  accept=".pdf" 
                  multiple
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <Plus size={20} />
                <span className="font-medium">Add more files</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                {errorMessage}
              </div>
            )}

            {!result || !result.success ? (
              <button
                onClick={handleMerge}
                disabled={loading || files.length < 2}
                className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-red-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? 'Merging PDFs...' : `Merge ${files.length} PDFs`}
              </button>
            ) : (
              <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center animate-in fade-in slide-in-from-bottom-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-red-900 mb-2">PDFs Merged!</h3>
                <p className="text-red-700 mb-6">Your files have been combined into one document.</p>
                
                {result.download_url && (
                  <a
                    href={ApiService.getDownloadUrl(result.download_url)}
                    download
                    className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-md"
                  >
                    Download Merged PDF
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
