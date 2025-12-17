import axios, { AxiosError } from 'axios';
import type {
  VideoProcessingResponse,
  PDFProcessingResponse,
  ImageProcessingResponse,
  AudioProcessingResponse,
  AudioMetadataResponse,
  ColorExtractionResponse,
  ColorConversionResponse,
  VideoToGifOptions,
  VideoExtractAudioOptions,
  RegexResponse,
  UnitConversionResponse,
  QRCodeResponse,
  QRCodeReadResponse,
  NumberConversionResponse,
  JSONDataGeneratorResponse,
  CodeFormatterResponse,
  CSSMinifierResponse,
  JSMinifierResponse,
  JSONFormatterResponse,
  JSONMinifierResponse,
  XMLFormatterResponse,
  CodeMinifierResponse,
  HTMLFormatterResponse,
  HTMLValidationResponse,
  HTMLMinifierResponse,
  JSONValidationResponse,
  XMLValidationResponse,
  JSValidationResponse,
  PyValidationResponse,
  LoremIpsumResponse,
  WordCounterResponse,
  AccentRemoverResponse,
  CaseConverterResponse,
  CaseType,
  SlugResponse,
  KeywordExtractorResponse,
  EmailExtractorResponse,
  URLExtractorResponse,
  CSSFormatterResponse,
  JSFormatterResponse,
  XMLMinifierResponse,
  TextFormatResponse,
  HashResponse,
  FileHashResponse,
  EncryptionResponse,
  PasswordGenerateRequest,
  PasswordGenerateResponse,
  PasswordCheckRequest,
  PasswordCheckResponse,
  UUIDGenerateRequest,
  UUIDGenerateResponse,
  URLEncodeDecodeRequest,
  URLResponse,
  Base64Response,
  BarcodeResponse,
  PaletteScheme,
  PaletteGeneratorResponse,
  GradientType,
  GradientGeneratorResponse,
  CSVToJSONResponse,
  JSONToCSVResponse,
} from '../types/api';

// Re-export types for backwards compatibility
export type {
  VideoProcessingResponse,
  PDFProcessingResponse,
  ImageProcessingResponse,
  AudioProcessingResponse,
  AudioMetadataResponse,
  RegexMatch,
  RegexResponse,
  UnitConversionResponse,
  QRCodeResponse,
  QRCodeReadResponse,
  CodeFormatterResponse,
  CSSMinifierResponse,
  JSMinifierResponse,
  JSONFormatterResponse,
  JSONMinifierResponse,
  XMLFormatterResponse,
  CodeMinifierResponse,
  HTMLFormatterResponse,
  HTMLValidationResponse,
  HTMLMinifierResponse,
  JSONValidationResponse,
  XMLValidationResponse,
  JSValidationResponse,
  PyValidationResponse,
  LoremIpsumResponse,
  WordCounterRequest,
  WordCounterResponse,
  AccentRemoverRequest,
  AccentRemoverResponse,
  CaseConverterRequest,
  CaseConverterResponse,
  CaseType,
  SlugRequest,
  SlugResponse,
  TextExtractorRequest,
  KeywordExtractorResponse,
  EmailExtractorResponse,
  URLExtractorResponse,
  CSSFormatterResponse,
  JSFormatterResponse,
  XMLMinifierResponse,
  ColorExtractionResponse,
  ColorConversionResponse,
  VideoToGifOptions,
  VideoExtractAudioOptions,
  TextFormatResponse,
  HashResponse,
  FileHashResponse,
  EncryptionResponse,
  PasswordGenerateRequest,
  PasswordGenerateResponse,
  PasswordCheckRequest,
  PasswordCheckResponse,
  UUIDGenerateRequest,
  UUIDGenerateResponse,
  URLEncodeDecodeRequest,
  URLResponse,
  Base64Response,
  BarcodeRequest,
  BarcodeResponse,
  NumberConversionResponse,
  JSONDataGeneratorResponse,
  PaletteScheme,
  PaletteColorInfo,
  PaletteGeneratorRequest,
  PaletteGeneratorResponse,
  GradientType,
  GradientGeneratorRequest,
  GradientGeneratorResponse,
  CSVToJSONResponse,
  JSONToCSVResponse,
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

  rotateVideo: async (file: File, angle: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('angle', angle.toString());
    const response = await api.post<VideoProcessingResponse>('/video/rotate', formData);
    return response.data;
  },

  videoToGif: async (file: File, options: VideoToGifOptions = {}) => {
    const formData = new FormData();
    formData.append('file', file);

    if (options.start_time !== undefined) {
      formData.append('start_time', options.start_time.toString());
    }
    if (options.duration !== undefined) {
      formData.append('duration', options.duration.toString());
    }
    if (options.width !== undefined) {
      formData.append('width', options.width.toString());
    }
    if (options.fps !== undefined) {
      formData.append('fps', options.fps.toString());
    }
    if (options.loop !== undefined) {
      formData.append('loop', options.loop ? 'true' : 'false');
    }

    const response = await api.post<VideoProcessingResponse>('/video/to-gif', formData);
    return response.data;
  },

  extractAudio: async (file: File, options: VideoExtractAudioOptions = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    if (options.output_format) formData.append('output_format', options.output_format);
    if (options.bitrate) formData.append('bitrate', options.bitrate);
    const response = await api.post<VideoProcessingResponse>('/video/extract-audio', formData);
    return response.data;
  },

  mergeVideos: async (files: File[], outputFormat: string = 'mp4', quality: string = 'medium', mergeMode: 'fast' | 'quality' = 'quality') => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('output_format', outputFormat);
    formData.append('quality', quality);
    formData.append('merge_mode', mergeMode);
    const response = await api.post<VideoProcessingResponse>('/video/merge', formData);
    return response.data;
  },

  mergeVideosAsync: async (files: File[], outputFormat: string = 'mp4', quality: string = 'medium', mergeMode: 'fast' | 'quality' = 'quality', signal?: AbortSignal) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('output_format', outputFormat);
    formData.append('quality', quality);
    formData.append('merge_mode', mergeMode);
    const response = await api.post<TaskResponse>('/video/merge/async', formData, { signal });
    return response.data;
  },

  // PDF
  compressPDF: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<PDFProcessingResponse>('/pdf/compress', formData);
    return response.data;
  },

  pdfToWord: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<PDFProcessingResponse>('/pdf/to-word', formData);
    return response.data;
  },

  wordToPdf: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<PDFProcessingResponse>('/pdf/word-to-pdf', formData);
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

  pdfToImages: async (file: File, imageFormat: string = 'png', dpi: number = 150) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('image_format', imageFormat);
    formData.append('dpi', dpi.toString());
    const response = await api.post<PDFProcessingResponse>('/pdf/to-images', formData);
    return response.data;
  },

  imagesToPDF: async (files: File[], pageSize?: string) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (pageSize) formData.append('page_size', pageSize);
    const response = await api.post<PDFProcessingResponse>('/pdf/images-to-pdf', formData);
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

  rotateImage: async (file: File, angle: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('angle', angle.toString());
    const response = await api.post<ImageProcessingResponse>('/image/rotate', formData);
    return response.data;
  },

  flipImage: async (file: File, direction: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('direction', direction);
    const response = await api.post<ImageProcessingResponse>('/image/flip', formData);
    return response.data;
  },

  extractColors: async (file: File, maxColors: number = 6) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('max_colors', maxColors.toString());
    const response = await api.post<ColorExtractionResponse>('/image/extract-colors', formData);
    return response.data;
  },

  adjustImage: async (
    file: File,
    brightness: number = 1.0,
    contrast: number = 1.0,
    saturation: number = 1.0
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('brightness', brightness.toString());
    formData.append('contrast', contrast.toString());
    formData.append('saturation', saturation.toString());
    const response = await api.post<ImageProcessingResponse>('/image/adjust', formData);
    return response.data;
  },

  resizeImage: async (
    file: File,
    width?: number,
    height?: number,
    maintainAspectRatio: boolean = true,
    resample: string = 'lanczos'
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    if (width !== undefined && width !== null) {
      formData.append('width', width.toString());
    }
    if (height !== undefined && height !== null) {
      formData.append('height', height.toString());
    }
    formData.append('maintain_aspect_ratio', maintainAspectRatio.toString());
    formData.append('resample', resample);
    const response = await api.post<ImageProcessingResponse>('/image/resize', formData);
    return response.data;
  },

  filterImage: async (file: File, filter: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filter_name', filter);
    const response = await api.post<ImageProcessingResponse>('/image/filters', formData);
    return response.data;
  },

  createCollage: async (files: File[], rows: number, cols: number, imageOrder: number[]) => {
    const formData = new FormData();
    // Append all files with the same key 'files' for FastAPI to accept as list
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('rows', rows.toString());
    formData.append('cols', cols.toString());
    formData.append('image_order', imageOrder.join(','));
    const response = await api.post<ImageProcessingResponse>('/image/collage', formData);
    return response.data;
  },

  createIcon: async (file: File, size: number = 256) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('size', size.toString());
    const response = await api.post<ImageProcessingResponse>('/image/to-icon', formData);
    return response.data;
  },

  // Audio
  convertAudio: async (file: File, outputFormat: string, quality: string = 'medium', bitrate: string = '192k') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('output_format', outputFormat);
    formData.append('quality', quality);
    formData.append('bitrate', bitrate);
    const response = await api.post<AudioProcessingResponse>('/audio/convert', formData);
    return response.data;
  },

  compressAudio: async (file: File, quality: string = 'medium', targetBitrate: string = '128k') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', quality);
    formData.append('target_bitrate', targetBitrate);
    const response = await api.post<AudioProcessingResponse>('/audio/compress', formData);
    return response.data;
  },

  mergeAudio: async (files: File[], outputFormat: string = 'mp3', quality: string = 'medium', bitrate: string = '192k') => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('output_format', outputFormat);
    formData.append('quality', quality);
    formData.append('bitrate', bitrate);
    const response = await api.post<AudioProcessingResponse>('/audio/merge', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAudioMetadata: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<AudioMetadataResponse>('/audio/metadata', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

  // QR Code Reader
  readQRCode: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<QRCodeReadResponse>('/qrcode/read', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Number Converter
  convertNumber: async (
    number: string,
    fromBase: 'binary' | 'decimal' | 'hexadecimal' | 'octal',
    toBase: 'binary' | 'decimal' | 'hexadecimal' | 'octal'
  ) => {
    const response = await api.post<NumberConversionResponse>('/number-converter/convert', {
      number,
      from_base: fromBase,
      to_base: toBase,
    });
    return response.data;
  },

  // JSON Data Generator
  generateJSONData: async (template: string, iterations: number) => {
    const response = await api.post<JSONDataGeneratorResponse>('/json-data-generator/generate', {
      template,
      iterations,
    });
    return response.data;
  },

  // Barcode Generator
  generateBarcode: async (data: string, barcodeType?: string, width?: number, height?: number, addChecksum?: boolean) => {
    const response = await api.post<BarcodeResponse>('/barcode/generate', {
      data,
      barcode_type: barcodeType || 'code128',
      width: width !== undefined ? width : 1.0,
      height: height !== undefined ? height : 50.0,
      add_checksum: addChecksum !== undefined ? addChecksum : true,
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

  // HTML Validator
  validateHTML: async (html: string) => {
    const response = await api.post<HTMLValidationResponse>('/html-validator/validate', {
      html,
    });
    return response.data;
  },

  // JSON Validator
  validateJSON: async (json: string) => {
    const response = await api.post<JSONValidationResponse>('/json-validator/validate', {
      json,
    });
    return response.data;
  },

  // XML Validator
  validateXML: async (xml: string) => {
    const response = await api.post<XMLValidationResponse>('/xml-validator/validate', {
      xml,
    });
    return response.data;
  },

  // JavaScript Validator
  validateJavaScript: async (javascript: string) => {
    const response = await api.post<JSValidationResponse>('/js-validator/validate', {
      javascript,
    });
    return response.data;
  },

  // Python Validator
  validatePython: async (python: string) => {
    const response = await api.post<PyValidationResponse>('/py-validator/validate', {
      python,
    });
    return response.data;
  },

  // Lorem Ipsum Generator
  generateLoremIpsum: async (type: 'paragraphs' | 'words' | 'sentences', count: number, startWithLorem?: boolean) => {
    const response = await api.post<LoremIpsumResponse>('/lorem-ipsum/generate', {
      type,
      count,
      start_with_lorem: startWithLorem,
    });
    return response.data;
  },

  // Word Counter
  countWords: async (text: string) => {
    const response = await api.post<WordCounterResponse>('/word-counter/count', {
      text,
    });
    return response.data;
  },

  // Accent Remover
  removeAccents: async (text: string) => {
    const response = await api.post<AccentRemoverResponse>('/accent-remover/remove', {
      text,
    });
    return response.data;
  },

  // Case Converter
  convertCase: async (text: string, caseType: CaseType) => {
    const response = await api.post<CaseConverterResponse>('/case-converter/convert', {
      text,
      case_type: caseType,
    });
    return response.data;
  },

  // Slug Generator
  generateSlug: async (text: string) => {
    const response = await api.post<SlugResponse>('/slug-generator/generate', {
      text,
    });
    return response.data;
  },

  // Text Extractors
  extractKeywords: async (text: string) => {
    const response = await api.post<KeywordExtractorResponse>('/text-extractor/keywords', {
      text,
    });
    return response.data;
  },

  extractEmails: async (text: string) => {
    const response = await api.post<EmailExtractorResponse>('/text-extractor/emails', {
      text,
    });
    return response.data;
  },

  extractURLs: async (text: string) => {
    const response = await api.post<URLExtractorResponse>('/text-extractor/urls', {
      text,
    });
    return response.data;
  },

  // Palette Generator
  generatePalette: async (baseColor: string, scheme: PaletteScheme, count: number) => {
    const response = await api.post<PaletteGeneratorResponse>('/palette-generator/generate', {
      base_color: baseColor,
      scheme,
      count,
    });
    return response.data;
  },

  // Gradient Generator
  generateGradient: async (
    colors: string[],
    type: GradientType,
    width: number,
    height: number,
    angle: number,
    stops?: number[]
  ) => {
    const response = await api.post<GradientGeneratorResponse>('/gradient-generator/generate', {
      colors,
      type,
      width,
      height,
      angle,
      stops,
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

  // Text Formatter (literal newline conversion)
  formatText: async (text: string) => {
    const response = await api.post<TextFormatResponse>('/text/format', {
      text,
    });
    return response.data;
  },

  // Hash Generator
  generateHash: async (
    text: string,
    algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512' = 'sha256',
    uppercase = false,
    salt?: string
  ) => {
    const response = await api.post<HashResponse>('/hash/generate', {
      text,
      algorithm,
      uppercase,
      ...(salt ? { salt } : {}),
    });
    return response.data;
  },

  // Password tools
  generatePassword: async (payload: PasswordGenerateRequest) => {
    const response = await api.post<PasswordGenerateResponse>('/password/generate', payload);
    return response.data;
  },

  checkPassword: async (payload: PasswordCheckRequest) => {
    const response = await api.post<PasswordCheckResponse>('/password/check', payload);
    return response.data;
  },

  // File Hash
  hashFile: async (
    file: File,
    algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512' = 'sha256',
    uppercase: boolean = false
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('algorithm', algorithm);
    formData.append('uppercase', uppercase.toString());
    const response = await api.post<FileHashResponse>('/security/file-hash', formData);
    return response.data;
  },

  // File Encryption
  encryptFile: async (file: File, password: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', password);
      const response = await api.post<EncryptionResponse>('/security/encrypt', formData);
      return response.data;
    } catch (error) {
      // Extract error message from HTTP response
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
        if (axiosError.response?.data?.detail) {
          throw new Error(axiosError.response.data.detail);
        }
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }
      throw error;
    }
  },

  decryptFile: async (file: File, password: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', password);
      const response = await api.post<EncryptionResponse>('/security/decrypt', formData);
      return response.data;
    } catch (error) {
      // Extract error message from HTTP response
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
        if (axiosError.response?.data?.detail) {
          throw new Error(axiosError.response.data.detail);
        }
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }
      throw error;
    }
  },

  // UUID Generator
  generateUUIDs: async (payload: UUIDGenerateRequest = {}) => {
    const response = await api.post<UUIDGenerateResponse>('/uuid/generate', payload);
    return response.data;
  },

  // URL Encoder / Decoder
  encodeURL: async (text: string) => {
    const response = await api.post<URLResponse>('/url/encode', { text } satisfies URLEncodeDecodeRequest);
    return response.data;
  },
  decodeURL: async (text: string) => {
    const response = await api.post<URLResponse>('/url/decode', { text } satisfies URLEncodeDecodeRequest);
    return response.data;
  },

  // Base64
  encodeBase64: async (text: string) => {
    const response = await api.post<Base64Response>('/base64/encode', { text });
    return response.data;
  },
  decodeBase64: async (text: string) => {
    const response = await api.post<Base64Response>('/base64/decode', { text });
    return response.data;
  },
 
  // Color Converter
  convertColor: async (color: string) => {
    const response = await api.post<ColorConversionResponse>('/color/convert', {
      color,
    });
    return response.data;
  },
  
  // CSV Converter
  csvToJSON: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<CSVToJSONResponse>('/csv-converter/csv-to-json', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  jsonToCSV: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<JSONToCSVResponse>('/csv-converter/json-to-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Helper for download URL
  getDownloadUrl: (path: string) => `${BASE_URL}${path}`,
  
  // Task cancellation
  cancelTask: async (taskId: string) => {
    const response = await api.post(`/tasks/${taskId}/cancel`);
    return response.data;
  }
};
