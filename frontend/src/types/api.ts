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

export interface VideoToGifOptions {
  start_time?: number;
  duration?: number;
  width?: number;
  fps?: number;
  loop?: boolean;
}

export interface VideoExtractAudioOptions {
  output_format?: 'mp3' | 'wav' | 'flac' | 'ogg';
  bitrate?: string;
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

// Audio Processing
export interface AudioProcessingResponse extends ApiResponse {
  filename: string;
  download_url?: string;
  original_size?: number;
  processed_size?: number;
  compression_ratio?: number;
}

export interface AudioMetadataResponse extends ApiResponse {
  filename: string;
  metadata?: Record<string, string>;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ColorInfo {
  hex: string;
  ratio: number;
}

export interface ColorFormats {
  hex: string;
  rgb: string;
  hsl: string;
  cmyk: string;
}

export interface ColorComponents {
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  l: number;
  c: number;
  m: number;
  y: number;
  k: number;
}

export interface ColorExtractionResponse extends ApiResponse {
  filename: string;
  colors: ColorInfo[];
}

export interface CollageRequest {
  files: File[];
  rows: number;
  cols: number;
  imageOrder: number[];
}

export interface ColorConversionResponse extends ApiResponse {
  input_format: string;
  normalized_hex: string;
  formats: ColorFormats;
  components: ColorComponents;
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

// Barcode
export interface BarcodeRequest {
  data: string;
  barcode_type?: 'ean13' | 'ean8' | 'upca' | 'upce' | 'code128' | 'code39' | 'isbn13' | 'isbn10';
  width?: number;
  height?: number;
  add_checksum?: boolean;
}

export interface BarcodeResponse extends ApiResponse {
  barcode_url?: string;
  filename?: string;
}

// QR Code Reader
export interface QRCodeReadResponse extends ApiResponse {
  data?: string;
  qr_type?: string;
}

// Number Converter
export interface NumberConversionRequest {
  number: string;
  from_base: 'binary' | 'decimal' | 'hexadecimal' | 'octal';
  to_base: 'binary' | 'decimal' | 'hexadecimal' | 'octal';
}

export interface NumberConversionResponse extends ApiResponse {
  original_number?: string;
  original_base?: string;
  converted_number?: string;
  converted_base?: string;
}

// JSON Data Generator
export interface JSONDataGeneratorRequest {
  template: string;
  iterations: number;
}

export interface JSONDataGeneratorResponse extends ApiResponse {
  generated_data?: Record<string, unknown>[];
  count?: number;
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

export interface HTMLErrorDetail {
  message: string;
  line?: number;
  column?: number;
  context?: string;
}

export interface HTMLValidationResponse extends ApiResponse {
  valid: boolean;
  errors: HTMLErrorDetail[];
  warnings?: string[];
}

// JSON Validator
export interface JSONErrorDetail {
  message: string;
  line?: number;
  column?: number;
}

export interface JSONValidationResponse extends ApiResponse {
  valid: boolean;
  errors: JSONErrorDetail[];
}

// XML Validator
export interface XMLErrorDetail {
  message: string;
  line?: number;
  column?: number;
}

export interface XMLValidationResponse extends ApiResponse {
  valid: boolean;
  errors: XMLErrorDetail[];
}

// JavaScript Validator
export interface JSErrorDetail {
  message: string;
  line?: number;
  column?: number;
}

export interface JSValidationResponse extends ApiResponse {
  valid: boolean;
  errors: JSErrorDetail[];
}

// Python Validator
export interface PyErrorDetail {
  message: string;
  line?: number;
  column?: number;
}

export interface PyValidationResponse extends ApiResponse {
  valid: boolean;
  errors: PyErrorDetail[];
}

// Lorem Ipsum Generator
export type LoremIpsumType = 'paragraphs' | 'words' | 'sentences';

export interface LoremIpsumRequest {
  type: LoremIpsumType;
  count: number;
  start_with_lorem?: boolean;
}

export interface LoremIpsumResponse extends ApiResponse {
  text?: string;
  type?: string;
  count?: number;
}

// Word Counter
export interface WordCounterRequest {
  text: string;
}

export interface WordCounterResponse extends ApiResponse {
  word_count?: number;
  character_count?: number;
  character_count_no_spaces?: number;
  sentence_count?: number;
  paragraph_count?: number;
  line_count?: number;
}

// Accent Remover
export interface AccentRemoverRequest {
  text: string;
}

export interface AccentRemoverResponse extends ApiResponse {
  original_text?: string;
  result_text?: string;
  removed_count?: number;
}

// Case Converter
export type CaseType = 'lowercase' | 'uppercase' | 'title_case' | 'sentence_case' | 'camel_case' | 'pascal_case' | 'snake_case' | 'kebab_case';

export interface CaseConverterRequest {
  text: string;
  case_type: CaseType;
}

export interface CaseConverterResponse extends ApiResponse {
  original_text?: string;
  result_text?: string;
  case_type?: string;
}

// Slug Generator
export interface SlugRequest {
  text: string;
}

export interface SlugResponse extends ApiResponse {
  original_text?: string;
  slug?: string;
}

// Text Extractors
export interface TextExtractorRequest {
  text: string;
}

export interface KeywordExtractorResponse extends ApiResponse {
  keywords?: string[];
  count?: number;
}

export interface EmailExtractorResponse extends ApiResponse {
  emails?: string[];
  count?: number;
}

export interface URLExtractorResponse extends ApiResponse {
  urls?: string[];
  count?: number;
}

// Palette Generator
export type PaletteScheme = 'monochromatic' | 'complementary' | 'triadic' | 'analogous' | 'split_complementary' | 'tetradic';

export interface PaletteColorInfo {
  hex: string;
  rgb: string;
  hsl: string;
  name?: string;
}

export interface PaletteGeneratorRequest {
  base_color: string;
  scheme?: PaletteScheme;
  count?: number;
}

export interface PaletteGeneratorResponse extends ApiResponse {
  colors?: PaletteColorInfo[];
  scheme?: string;
  base_color?: string;
}

// Gradient Generator
export type GradientType = 'linear' | 'radial' | 'conic';

export interface GradientGeneratorRequest {
  colors: string[];
  type?: GradientType;
  width?: number;
  height?: number;
  angle?: number;
  stops?: number[];
}

export interface GradientGeneratorResponse extends ApiResponse {
  filename?: string;
  download_url?: string;
  css_code?: string;
  svg_code?: string;
  width?: number;
  height?: number;
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

// Text Formatter
export interface TextFormatResponse extends ApiResponse {
  formatted_text?: string;
  original_length?: number;
  formatted_length?: number;
}

export interface HashResponse extends ApiResponse {
  algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512';
  hex_digest: string;
  base64_digest: string;
  salt_used?: string | null;
}

// File Hash
export interface FileHashResponse extends ApiResponse {
  filename: string;
  algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512';
  hex_digest: string;
  base64_digest: string;
  file_size?: number;
}

// File Encryption
export interface EncryptionResponse extends ApiResponse {
  filename: string;
  download_url?: string;
  original_size?: number;
  processed_size?: number;
}

export interface PasswordGenerateRequest {
  length?: number;
  include_lowercase?: boolean;
  include_uppercase?: boolean;
  include_digits?: boolean;
  include_symbols?: boolean;
  exclude_ambiguous?: boolean;
}

export interface PasswordGenerateResponse extends ApiResponse {
  password: string;
}

export interface PasswordCheckRequest {
  password: string;
}

export interface PasswordCheckResponse extends ApiResponse {
  score: number;
  strength: string;
  length: number;
  has_lowercase: boolean;
  has_uppercase: boolean;
  has_digits: boolean;
  has_symbols: boolean;
  suggestions: string[];
  entropy: number;
}

export interface UUIDGenerateRequest {
  version?: 'v4';
  count?: number;
}

export interface UUIDGenerateResponse extends ApiResponse {
  uuids: string[];
}

export interface URLEncodeDecodeRequest {
  text: string;
}

export interface URLResponse extends ApiResponse {
  result: string;
}

export interface Base64Response extends ApiResponse {
  result: string;
}

// CSV Converter
export interface CSVToJSONResponse extends ApiResponse {
  json_data: string;
  download_url?: string | null;
  filename?: string | null;
  rows_count: number;
}

export interface JSONToCSVResponse extends ApiResponse {
  csv_data: string;
  download_url?: string | null;
  filename?: string | null;
  rows_count: number;
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

