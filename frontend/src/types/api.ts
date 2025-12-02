/**
 * API Response Types
 * Centralized type definitions for all API responses
 */

// Base response interface
export interface ApiResponse {
  success: boolean;
  message: string;
}

// Video Processing
export interface VideoProcessingResponse extends ApiResponse {
  filename: string;
  download_url?: string;
  original_size?: number;
  processed_size?: number;
  compression_ratio?: number;
}

// PDF Processing
export interface PDFProcessingResponse extends ApiResponse {
  filename?: string;
  download_url?: string;
  filenames?: string[];
  download_urls?: string[];
  total_pages?: number;
  original_size?: number;
  processed_size?: number;
}

// Image Processing
export interface ImageProcessingResponse extends ApiResponse {
  filename: string;
  download_url?: string;
  original_size?: number;
  processed_size?: number;
  compression_ratio?: number;
  dimensions?: ImageDimensions;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

// Regex
export interface RegexMatch {
  match: string;
  start: number;
  end: number;
  groups: string[];
  named_groups: Record<string, string>;
}

export interface RegexResponse extends ApiResponse {
  matches: RegexMatch[];
  count: number;
  error?: string;
}

// Unit Conversion
export interface UnitConversionResponse extends ApiResponse {
  converted_value: number;
  converted_unit: string;
  original_value?: number;
  original_unit?: string;
  conversion_formula?: string;
  error?: string;
}

// QR Code
export interface QRCodeResponse extends ApiResponse {
  qr_code_url?: string;
  filename?: string;
}

// Code Formatter
export interface CodeFormatterResponse extends ApiResponse {
  formatted_code?: string;
  original_length?: number;
  formatted_length?: number;
}

// CSS Minifier
export interface CSSMinifierResponse extends ApiResponse {
  minified_css?: string;
  original_size?: number;
  minified_size?: number;
  compression_ratio?: number;
}

// JS Minifier
export interface JSMinifierResponse extends ApiResponse {
  minified_js?: string;
  original_size?: number;
  minified_size?: number;
  compression_ratio?: number;
}

// JSON Formatter
export interface JSONFormatterResponse extends ApiResponse {
  result?: string;
  original_size?: number;
  result_size?: number;
  compression_ratio?: number;
}

// JSON Minifier
export interface JSONMinifierResponse extends ApiResponse {
  minified_json?: string;
  original_length?: number;
  minified_length?: number;
  compression_ratio?: number;
}

// XML Formatter
export interface XMLFormatterResponse extends ApiResponse {
  result?: string;
  original_size?: number;
  result_size?: number;
  compression_ratio?: number;
}

// Code Minifier
export interface CodeMinifierResponse extends ApiResponse {
  minified_code?: string;
  original_length?: number;
  minified_length?: number;
  compression_ratio?: number;
}

// HTML Formatter
export interface HTMLFormatterResponse extends ApiResponse {
  formatted_html?: string;
  original_length?: number;
  formatted_length?: number;
}

// HTML Minifier
export interface HTMLMinifierResponse extends ApiResponse {
  minified_html?: string;
  original_length?: number;
  minified_length?: number;
  compression_ratio?: number;
}

// CSS Formatter
export interface CSSFormatterResponse extends ApiResponse {
  formatted_css?: string;
  original_length?: number;
  formatted_length?: number;
}

// JS Formatter
export interface JSFormatterResponse extends ApiResponse {
  formatted_js?: string;
  original_length?: number;
  formatted_length?: number;
}

// XML Minifier
export interface XMLMinifierResponse extends ApiResponse {
  minified_xml?: string;
  original_length?: number;
  minified_length?: number;
  compression_ratio?: number;
}

// Generic file processing result (useful for UI components)
export interface ProcessingResult {
  success: boolean;
  message?: string;
  downloadUrl?: string;
  filename?: string;
  originalSize?: number;
  processedSize?: number;
  compressionRatio?: number;
}

// Helper function to convert API response to ProcessingResult
export function toProcessingResult(
  response: VideoProcessingResponse | ImageProcessingResponse | PDFProcessingResponse
): ProcessingResult {
  return {
    success: response.success,
    message: response.message,
    downloadUrl: response.download_url,
    filename: response.filename,
    originalSize: response.original_size,
    processedSize: response.processed_size,
    compressionRatio: 'compression_ratio' in response ? response.compression_ratio : undefined,
  };
}

