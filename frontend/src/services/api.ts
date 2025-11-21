import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
});

// API Types
export interface VideoProcessingResponse {
  success: boolean;
  message: string;
  filename: string;
  download_url?: string;
  original_size?: number;
  processed_size?: number;
  compression_ratio?: number;
}

export interface PDFProcessingResponse {
  success: boolean;
  message: string;
  filename?: string;
  download_url?: string;
  filenames?: string[];
  download_urls?: string[];
  total_pages?: number;
  original_size?: number;
  processed_size?: number;
}

export interface ImageProcessingResponse {
  success: boolean;
  message: string;
  filename: string;
  download_url?: string;
  original_size?: number;
  processed_size?: number;
  compression_ratio?: number;
  dimensions?: { width: number; height: number };
}

export interface RegexMatch {
  match: string;
  start: number;
  end: number;
  groups: string[];
  named_groups: Record<string, string>;
}

export interface RegexResponse {
  success: boolean;
  matches: RegexMatch[];
  count: number;
  error?: string;
}

export interface UnitConversionResponse {
  success: boolean;
  converted_value: number;
  converted_unit: string;
  original_value?: number;
  original_unit?: string;
  conversion_formula?: string;
  message?: string;
  error?: string;
}

export const ApiService = {
  // Video
  compressVideo: async (file: File, quality: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', quality);
    const response = await api.post<VideoProcessingResponse>('/video/compress', formData);
    return response.data;
  },

  convertVideo: async (file: File, outputFormat: string, quality: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('output_format', outputFormat);
    formData.append('quality', quality);
    const response = await api.post<VideoProcessingResponse>('/video/convert', formData);
    return response.data;
  },

  // PDF
  compressPDF: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<PDFProcessingResponse>('/pdf/compress', formData);
    return response.data;
  },

  mergePDFs: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    const response = await api.post<PDFProcessingResponse>('/pdf/merge', formData);
    return response.data;
  },

  splitPDF: async (file: File, pages?: string, pageRanges?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (pages) formData.append('pages', pages);
    if (pageRanges) formData.append('page_ranges', pageRanges);
    const response = await api.post<PDFProcessingResponse>('/pdf/split', formData);
    return response.data;
  },

  reorganizePDF: async (file: File, pageOrder: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('page_order', pageOrder);
    const response = await api.post<PDFProcessingResponse>('/pdf/reorganize', formData);
    return response.data;
  },

  // Image
  compressImage: async (file: File, quality: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', quality);
    const response = await api.post<ImageProcessingResponse>('/image/compress', formData);
    return response.data;
  },

  convertImage: async (file: File, outputFormat: string, quality: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('output_format', outputFormat);
    formData.append('quality', quality);
    const response = await api.post<ImageProcessingResponse>('/image/convert', formData);
    return response.data;
  },

  // Regex
  testRegex: async (pattern: string, text: string, flags: string) => {
    const response = await api.post<RegexResponse>('/regex/validate', {
      pattern,
      text,
      flags
    });
    return response.data;
  },

  // Units
  convertUnits: async (value: number, fromUnit: string, toUnit: string) => {
    const response = await api.post<UnitConversionResponse>('/units/convert', {
      value,
      from_unit: fromUnit,
      to_unit: toUnit
    });
    return response.data;
  },
  
  // Helper for download URL
  getDownloadUrl: (path: string) => `http://localhost:8000${path}`
};
