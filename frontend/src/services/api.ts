import axios from 'axios';
import type {
  VideoProcessingResponse,
  PDFProcessingResponse,
  ImageProcessingResponse,
  RegexResponse,
  UnitConversionResponse,
  QRCodeResponse,
  CodeFormatterResponse,
  CSSMinifierResponse,
  JSMinifierResponse,
  JSONFormatterResponse,
  JSONMinifierResponse,
  XMLFormatterResponse,
  CodeMinifierResponse,
  HTMLFormatterResponse,
  HTMLMinifierResponse,
  CSSFormatterResponse,
  JSFormatterResponse,
  XMLMinifierResponse,
} from '../types/api';

// Re-export types for backwards compatibility
export type {
  VideoProcessingResponse,
  PDFProcessingResponse,
  ImageProcessingResponse,
  RegexMatch,
  RegexResponse,
  UnitConversionResponse,
  QRCodeResponse,
  CodeFormatterResponse,
  CSSMinifierResponse,
  JSMinifierResponse,
  JSONFormatterResponse,
  JSONMinifierResponse,
  XMLFormatterResponse,
  CodeMinifierResponse,
  HTMLFormatterResponse,
  HTMLMinifierResponse,
  CSSFormatterResponse,
  JSFormatterResponse,
  XMLMinifierResponse,
} from '../types/api';

// API URL from environment variable with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Base URL for downloads (without /api/v1)
const BASE_URL = API_URL.replace('/api/v1', '');

const api = axios.create({
  baseURL: API_URL,
  // No timeout for file uploads - let the request complete naturally
  // Don't set Content-Type header here - let axios set it automatically
  // This is important for multipart/form-data (file uploads)
});

// Type for async task response
interface TaskResponse {
  task_id: string;
}

export const ApiService = {
  // Video - Synchronous (existing, for backwards compatibility)
  compressVideo: async (file: File, quality: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', quality);
    const response = await api.post<VideoProcessingResponse>('/video/compress', formData);
    return response.data;
  },

  // Video - Asynchronous with SSE progress tracking
  compressVideoAsync: async (file: File, quality: string, signal?: AbortSignal) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', quality);
    const response = await api.post<TaskResponse>('/video/compress/async', formData, { signal });
    return response.data;
  },

  convertVideoAsync: async (file: File, outputFormat: string, quality: string, signal?: AbortSignal) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('output_format', outputFormat);
    formData.append('quality', quality);
    const response = await api.post<TaskResponse>('/video/convert/async', formData, { signal });
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

  extractTextOCR: async (file: File, language: string = 'eng') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    const response = await api.post<PDFProcessingResponse>('/pdf/ocr', formData);
    return response.data;
  },

  extractTextOCRAsync: async (file: File, language: string = 'eng', signal?: AbortSignal) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    const response = await api.post<TaskResponse>('/pdf/ocr/async', formData, { signal });
    return response.data;
  },

  passwordPDF: async (file: File, action: 'add' | 'remove', password: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', action);
    formData.append('password', password);
    const response = await api.post<PDFProcessingResponse>('/pdf/password', formData);
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

  // QR Code
  generateQRCode: async (data: string, size?: number, border?: number, errorCorrection?: string) => {
    const response = await api.post<QRCodeResponse>('/qrcode/generate', {
      data,
      size,
      border,
      error_correction: errorCorrection
    });
    return response.data;
  },

  // Code Formatter
  formatCode: async (code: string, language?: string, indentSize?: number, indentChar?: string, wrapLineLength?: number) => {
    const response = await api.post<CodeFormatterResponse>('/code-formatter/format', {
      code,
      language: language || 'auto',
      indent_size: indentSize || 2,
      indent_char: indentChar || ' ',
      wrap_line_length: wrapLineLength || 80
    });
    return response.data;
  },

  // CSS Minifier
  minifyCSS: async (css: string) => {
    const response = await api.post<CSSMinifierResponse>('/css-minifier/minify', {
      css
    });
    return response.data;
  },

  // JS Minifier
  minifyJS: async (javascript: string) => {
    const response = await api.post<JSMinifierResponse>('/js-minifier/minify', {
      javascript
    });
    return response.data;
  },

  // JSON Formatter
  formatJSON: async (json: string, indentSize?: number) => {
    const response = await api.post<JSONFormatterResponse>('/json-formatter/format', {
      json,
      indent_size: indentSize || 2
    });
    return response.data;
  },

  // JSON Minifier
  minifyJSON: async (json: string) => {
    const response = await api.post<JSONMinifierResponse>('/json-minifier/minify', {
      json
    });
    return response.data;
  },

  // XML Formatter
  formatXML: async (xml: string, indentSize?: number) => {
    const response = await api.post<XMLFormatterResponse>('/xml-formatter/format', {
      xml,
      indent_size: indentSize || 2
    });
    return response.data;
  },

  // Code Minifier
  minifyCode: async (code: string, language: string = 'auto') => {
    const response = await api.post<CodeMinifierResponse>('/code-minifier/minify', {
      code,
      language
    });
    return response.data;
  },

  // HTML Formatter
  formatHTML: async (html: string, indentSize: number = 2, indentChar: string = ' ') => {
    const response = await api.post<HTMLFormatterResponse>('/html-formatter/format', {
      html,
      indent_size: indentSize,
      indent_char: indentChar
    });
    return response.data;
  },

  // HTML Minifier
  minifyHTML: async (html: string) => {
    const response = await api.post<HTMLMinifierResponse>('/html-minifier/minify', {
      html
    });
    return response.data;
  },

  // CSS Formatter
  formatCSS: async (css: string, indentSize: number = 2, indentChar: string = ' ') => {
    const response = await api.post<CSSFormatterResponse>('/css-formatter/format', {
      css,
      indent_size: indentSize,
      indent_char: indentChar
    });
    return response.data;
  },

  // JS Formatter
  formatJS: async (javascript: string, indentSize: number = 2, indentChar: string = ' ', wrapLineLength: number = 80) => {
    const response = await api.post<JSFormatterResponse>('/js-formatter/format', {
      javascript,
      indent_size: indentSize,
      indent_char: indentChar,
      wrap_line_length: wrapLineLength
    });
    return response.data;
  },

  // XML Minifier
  minifyXML: async (xml: string) => {
    const response = await api.post<XMLMinifierResponse>('/xml-minifier/minify', {
      xml
    });
    return response.data;
  },
  
  // Helper for download URL
  getDownloadUrl: (path: string) => `${BASE_URL}${path}`
};
