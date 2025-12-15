import type { IconName } from './icons';

export type ModuleCategory = 
  | 'media' 
  | 'document' 
  | 'developer' 
  | 'data' 
  | 'security' 
  | 'text' 
  | 'files' 
  | 'design' 
  | 'utility';

export type ModuleStatus = 'implemented' | 'placeholder';

export interface ModuleDefinition {
  id: string;
  path: string;
  icon: IconName;
  labelKey: string;
  descriptionKey: string;
  category: ModuleCategory;
  status: ModuleStatus;
  color: string; // Tailwind text color class
  isNew?: boolean;
}

/**
 * Complete list of all available modules in TaskPlex
 * Both implemented and placeholder modules
 */
export const MODULES: ModuleDefinition[] = [
  // ============================================
  // MEDIA - VIDEO (Implemented + Placeholder)
  // ============================================
  {
    id: 'video-compress',
    path: '/video/compress',
    icon: 'video-compress',
    labelKey: 'modules.video.compress.title',
    descriptionKey: 'modules.video.compress.description',
    category: 'media',
    status: 'implemented',
    color: 'text-purple-600',
  },
  {
    id: 'video-convert',
    path: '/video/convert',
    icon: 'video-convert',
    labelKey: 'modules.video.convert.title',
    descriptionKey: 'modules.video.convert.description',
    category: 'media',
    status: 'implemented',
    color: 'text-purple-600',
  },
  {
    id: 'video-extract-audio',
    path: '/video/extract-audio',
    icon: 'video-extract-audio',
    labelKey: 'modules.video.extractAudio.title',
    descriptionKey: 'modules.video.extractAudio.description',
    category: 'media',
    status: 'implemented',
    color: 'text-purple-600',
  },
  {
    id: 'video-merge',
    path: '/video/merge',
    icon: 'video-merge',
    labelKey: 'modules.video.merge.title',
    descriptionKey: 'modules.video.merge.description',
    category: 'media',
    status: 'implemented',
    color: 'text-purple-600',
  },
  {
    id: 'video-rotate',
    path: '/video/rotate',
    icon: 'rotate-cw',
    labelKey: 'modules.video.rotate.title',
    descriptionKey: 'modules.video.rotate.description',
    category: 'media',
    status: 'implemented',
    color: 'text-purple-600',
  },
  {
    id: 'video-to-gif',
    path: '/video/to-gif',
    icon: 'video-to-gif',
    labelKey: 'modules.video.toGif.title',
    descriptionKey: 'modules.video.toGif.description',
    category: 'media',
    status: 'implemented',
    color: 'text-purple-600',
  },

  // ============================================
  // MEDIA - AUDIO (Placeholder)
  // ============================================
  {
    id: 'audio-convert',
    path: '/audio/convert',
    icon: 'audio-convert',
    labelKey: 'modules.audio.convert.title',
    descriptionKey: 'modules.audio.convert.description',
    category: 'media',
    status: 'implemented',
    color: 'text-pink-600',
  },
  {
    id: 'audio-compress',
    path: '/audio/compress',
    icon: 'audio-compress',
    labelKey: 'modules.audio.compress.title',
    descriptionKey: 'modules.audio.compress.description',
    category: 'media',
    status: 'implemented',
    color: 'text-pink-600',
  },
  {
    id: 'audio-merge',
    path: '/audio/merge',
    icon: 'audio-merge',
    labelKey: 'modules.audio.merge.title',
    descriptionKey: 'modules.audio.merge.description',
    category: 'media',
    status: 'implemented',
    color: 'text-pink-600',
  },
  {
    id: 'audio-metadata',
    path: '/audio/metadata',
    icon: 'audio-metadata',
    labelKey: 'modules.audio.metadata.title',
    descriptionKey: 'modules.audio.metadata.description',
    category: 'media',
    status: 'placeholder',
    color: 'text-pink-600',
  },

  // ============================================
  // MEDIA - IMAGE (Implemented + Placeholder)
  // ============================================
  {
    id: 'image-compress',
    path: '/image/compress',
    icon: 'image-compress',
    labelKey: 'modules.image.compress.title',
    descriptionKey: 'modules.image.compress.description',
    category: 'media',
    status: 'implemented',
    color: 'text-blue-600',
  },
  {
    id: 'image-convert',
    path: '/image/convert',
    icon: 'image-convert',
    labelKey: 'modules.image.convert.title',
    descriptionKey: 'modules.image.convert.description',
    category: 'media',
    status: 'implemented',
    color: 'text-blue-600',
  },
  {
    id: 'image-resize',
    path: '/image/resize',
    icon: 'image-resize',
    labelKey: 'modules.image.resize.title',
    descriptionKey: 'modules.image.resize.description',
    category: 'media',
    status: 'implemented',
    color: 'text-blue-600',
  },
  {
    id: 'image-rotate',
    path: '/image/rotate',
    icon: 'rotate-cw',
    labelKey: 'modules.image.rotate.title',
    descriptionKey: 'modules.image.rotate.description',
    category: 'media',
    status: 'implemented',
    color: 'text-blue-600',
  },
  {
    id: 'image-flip',
    path: '/image/flip',
    icon: 'image-flip',
    labelKey: 'modules.image.flip.title',
    descriptionKey: 'modules.image.flip.description',
    category: 'media',
    status: 'placeholder',
    color: 'text-blue-500',
  },
  {
    id: 'image-filters',
    path: '/image/filters',
    icon: 'image-filters',
    labelKey: 'modules.image.filters.title',
    descriptionKey: 'modules.image.filters.description',
    category: 'media',
    status: 'implemented',
    color: 'text-blue-600',
    isNew: true,
  },
  {
    id: 'image-to-icon',
    path: '/image/to-icon',
    icon: 'image-to-icon',
    labelKey: 'modules.image.toIcon.title',
    descriptionKey: 'modules.image.toIcon.description',
    category: 'media',
    status: 'placeholder',
    color: 'text-blue-500',
  },
  {
    id: 'image-extract-colors',
    path: '/image/extract-colors',
    icon: 'image-extract-colors',
    labelKey: 'modules.image.extractColors.title',
    descriptionKey: 'modules.image.extractColors.description',
    category: 'media',
    status: 'implemented',
    color: 'text-blue-600',
  },
  {
    id: 'image-adjust',
    path: '/image/adjust',
    icon: 'image-adjust',
    labelKey: 'modules.image.adjust.title',
    descriptionKey: 'modules.image.adjust.description',
    category: 'media',
    status: 'implemented',
    color: 'text-blue-600',
  },
  {
    id: 'image-collage',
    path: '/image/collage',
    icon: 'image-collage',
    labelKey: 'modules.image.collage.title',
    descriptionKey: 'modules.image.collage.description',
    category: 'media',
    status: 'implemented',
    color: 'text-blue-600',
  },

  // ============================================
  // DOCUMENT - PDF (Implemented + Placeholder)
  // ============================================
  {
    id: 'pdf-compress',
    path: '/pdf/compress',
    icon: 'pdf-compress',
    labelKey: 'modules.pdf.compress.title',
    descriptionKey: 'modules.pdf.compress.description',
    category: 'document',
    status: 'implemented',
    color: 'text-red-600',
  },
  {
    id: 'pdf-merge',
    path: '/pdf/merge',
    icon: 'pdf-merge',
    labelKey: 'modules.pdf.merge.title',
    descriptionKey: 'modules.pdf.merge.description',
    category: 'document',
    status: 'implemented',
    color: 'text-red-600',
  },
  {
    id: 'pdf-split',
    path: '/pdf/split',
    icon: 'pdf-split',
    labelKey: 'modules.pdf.split.title',
    descriptionKey: 'modules.pdf.split.description',
    category: 'document',
    status: 'implemented',
    color: 'text-red-600',
  },
  {
    id: 'pdf-reorganize',
    path: '/pdf/reorganize',
    icon: 'pdf-reorganize',
    labelKey: 'modules.pdf.reorganize.title',
    descriptionKey: 'modules.pdf.reorganize.description',
    category: 'document',
    status: 'implemented',
    color: 'text-red-600',
  },
  {
    id: 'pdf-to-images',
    path: '/pdf/to-images',
    icon: 'pdf-to-images',
    labelKey: 'modules.pdf.toImages.title',
    descriptionKey: 'modules.pdf.toImages.description',
    category: 'document',
    status: 'placeholder',
    color: 'text-red-500',
  },
  {
    id: 'pdf-images-to-pdf',
    path: '/pdf/images-to-pdf',
    icon: 'pdf-images-to-pdf',
    labelKey: 'modules.pdf.imagesToPdf.title',
    descriptionKey: 'modules.pdf.imagesToPdf.description',
    category: 'document',
    status: 'placeholder',
    color: 'text-red-500',
  },
  {
    id: 'pdf-extract-text',
    path: '/pdf/extract-text',
    icon: 'pdf-extract-text',
    labelKey: 'modules.pdf.extractText.title',
    descriptionKey: 'modules.pdf.extractText.description',
    category: 'document',
    status: 'placeholder',
    color: 'text-red-500',
  },
  {
    id: 'pdf-password',
    path: '/pdf/password',
    icon: 'pdf-password',
    labelKey: 'modules.pdf.password.title',
    descriptionKey: 'modules.pdf.password.description',
    category: 'document',
    status: 'implemented',
    color: 'text-red-600',
  },
  {
    id: 'pdf-ocr',
    path: '/pdf/ocr',
    icon: 'pdf-ocr',
    labelKey: 'modules.pdf.ocr.title',
    descriptionKey: 'modules.pdf.ocr.description',
    category: 'document',
    status: 'implemented',
    color: 'text-red-600',
  },

  // ============================================
  // DEVELOPER TOOLS (Implemented + Placeholder)
  // ============================================
  {
    id: 'regex',
    path: '/dev/regex',
    icon: 'regex',
    labelKey: 'modules.dev.regex.title',
    descriptionKey: 'modules.dev.regex.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-yellow-600',
  },
  {
    id: 'units',
    path: '/dev/units',
    icon: 'units',
    labelKey: 'modules.dev.units.title',
    descriptionKey: 'modules.dev.units.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-green-600',
  },
  {
    id: 'json-formatter',
    path: '/dev/json-formatter',
    icon: 'json-formatter',
    labelKey: 'modules.dev.jsonFormatter.title',
    descriptionKey: 'modules.dev.jsonFormatter.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-green-600',
  },
  {
    id: 'json-minifier',
    path: '/dev/json-minifier',
    icon: 'json-minifier',
    labelKey: 'modules.dev.jsonMinifier.title',
    descriptionKey: 'modules.dev.jsonMinifier.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-green-600',
  },
  {
    id: 'xml-formatter',
    path: '/dev/xml-formatter',
    icon: 'xml-formatter',
    labelKey: 'modules.dev.xmlFormatter.title',
    descriptionKey: 'modules.dev.xmlFormatter.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-green-600',
  },
  {
    id: 'hash-generator',
    path: '/dev/hash-generator',
    icon: 'hash-generator',
    labelKey: 'modules.dev.hashGenerator.title',
    descriptionKey: 'modules.dev.hashGenerator.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-green-600',
    isNew: true,
  },
  {
    id: 'base64-encoder',
    path: '/dev/base64',
    icon: 'base64-encoder',
    labelKey: 'modules.dev.base64.title',
    descriptionKey: 'modules.dev.base64.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-green-600',
    isNew: true,
  },
  {
    id: 'base64-only-encode',
    path: '/dev/base64/encode',
    icon: 'base64-encoder',
    labelKey: 'modules.dev.base64Encode.title',
    descriptionKey: 'modules.dev.base64Encode.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-green-600',
    isNew: true,
  },
  {
    id: 'base64-only-decode',
    path: '/dev/base64/decode',
    icon: 'base64-encoder',
    labelKey: 'modules.dev.base64Decode.title',
    descriptionKey: 'modules.dev.base64Decode.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-green-600',
    isNew: true,
  },
  {
    id: 'url-encoder',
    path: '/dev/url-encoder',
    icon: 'url-encoder',
    labelKey: 'modules.dev.urlEncoder.title',
    descriptionKey: 'modules.dev.urlEncoder.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-yellow-600',
  },
  {
    id: 'uuid-generator',
    path: '/dev/uuid',
    icon: 'uuid-generator',
    labelKey: 'modules.dev.uuid.title',
    descriptionKey: 'modules.dev.uuid.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-yellow-600',
  },
  {
    id: 'password-generator',
    path: '/dev/password-generator',
    icon: 'password-generator',
    labelKey: 'modules.dev.passwordGenerator.title',
    descriptionKey: 'modules.dev.passwordGenerator.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-yellow-600',
  },
  {
    id: 'qr-generator',
    path: '/dev/qr-generator',
    icon: 'qr-generator',
    labelKey: 'modules.dev.qrGenerator.title',
    descriptionKey: 'modules.dev.qrGenerator.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-yellow-600',
  },
  {
    id: 'qr-reader',
    path: '/dev/qr-reader',
    icon: 'qr-reader',
    labelKey: 'modules.dev.qrReader.title',
    descriptionKey: 'modules.dev.qrReader.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-yellow-600',
  },
  {
    id: 'color-converter',
    path: '/dev/color-converter',
    icon: 'color-converter',
    labelKey: 'modules.dev.colorConverter.title',
    descriptionKey: 'modules.dev.colorConverter.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-yellow-600',
    isNew: true,
  },
  {
    id: 'lorem-ipsum',
    path: '/dev/lorem-ipsum',
    icon: 'lorem-ipsum',
    labelKey: 'modules.dev.loremIpsum.title',
    descriptionKey: 'modules.dev.loremIpsum.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-purple-600',
  },
  {
    id: 'code-formatter',
    path: '/dev/code-formatter',
    icon: 'code-formatter',
    labelKey: 'modules.dev.codeFormatter.title',
    descriptionKey: 'modules.dev.codeFormatter.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-green-600',
  },
  {
    id: 'css-minifier',
    path: '/dev/css-minifier',
    icon: 'css-minifier',
    labelKey: 'modules.dev.cssMinifier.title',
    descriptionKey: 'modules.dev.cssMinifier.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-green-600',
  },
  {
    id: 'js-minifier',
    path: '/dev/js-minifier',
    icon: 'js-minifier',
    labelKey: 'modules.dev.jsMinifier.title',
    descriptionKey: 'modules.dev.jsMinifier.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-green-600',
  },
  {
    id: 'code-minifier',
    path: '/dev/code-minifier',
    icon: 'code-minifier',
    labelKey: 'modules.dev.codeMinifier.title',
    descriptionKey: 'modules.dev.codeMinifier.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-green-600',
  },
  {
    id: 'html-formatter',
    path: '/dev/html-formatter',
    icon: 'file-code',
    labelKey: 'modules.dev.htmlFormatter.title',
    descriptionKey: 'modules.dev.htmlFormatter.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-green-600',
  },
  {
    id: 'html-minifier',
    path: '/dev/html-minifier',
    icon: 'html-minifier',
    labelKey: 'modules.dev.htmlMinifier.title',
    descriptionKey: 'modules.dev.htmlMinifier.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-green-600',
  },
  {
    id: 'css-formatter',
    path: '/dev/css-formatter',
    icon: 'palette',
    labelKey: 'modules.dev.cssFormatter.title',
    descriptionKey: 'modules.dev.cssFormatter.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-green-600',
  },
  {
    id: 'js-formatter',
    path: '/dev/js-formatter',
    icon: 'file-code',
    labelKey: 'modules.dev.jsFormatter.title',
    descriptionKey: 'modules.dev.jsFormatter.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-green-600',
  },
  {
    id: 'xml-minifier',
    path: '/dev/xml-minifier',
    icon: 'xml-minifier',
    labelKey: 'modules.dev.xmlMinifier.title',
    descriptionKey: 'modules.dev.xmlMinifier.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-green-600',
  },
  {
    id: 'html-validator',
    path: '/dev/html-validator',
    icon: 'html-validator',
    labelKey: 'modules.dev.htmlValidator.title',
    descriptionKey: 'modules.dev.htmlValidator.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-green-600',
  },
  {
    id: 'json-validator',
    path: '/dev/json-validator',
    icon: 'file-code',
    labelKey: 'modules.dev.jsonValidator.title',
    descriptionKey: 'modules.dev.jsonValidator.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-yellow-600',
  },
  {
    id: 'xml-validator',
    path: '/dev/xml-validator',
    icon: 'file-code',
    labelKey: 'modules.dev.xmlValidator.title',
    descriptionKey: 'modules.dev.xmlValidator.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-orange-600',
  },
  {
    id: 'js-validator',
    path: '/dev/js-validator',
    icon: 'file-code',
    labelKey: 'modules.dev.jsValidator.title',
    descriptionKey: 'modules.dev.jsValidator.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-yellow-600',
  },
  {
    id: 'py-validator',
    path: '/dev/py-validator',
    icon: 'file-code',
    labelKey: 'modules.dev.pyValidator.title',
    descriptionKey: 'modules.dev.pyValidator.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-blue-600',
  },
  {
    id: 'barcode-generator',
    path: '/dev/barcode-generator',
    icon: 'barcode-generator',
    labelKey: 'modules.dev.barcodeGenerator.title',
    descriptionKey: 'modules.dev.barcodeGenerator.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-yellow-600',
  },
  {
    id: 'number-converter',
    path: '/dev/number-converter',
    icon: 'hash-generator',
    labelKey: 'modules.dev.numberConverter.title',
    descriptionKey: 'modules.dev.numberConverter.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-yellow-600',
  },
  {
    id: 'fake-data-generator',
    path: '/dev/fake-data',
    icon: 'fake-data-generator',
    labelKey: 'modules.dev.fakeDataGenerator.title',
    descriptionKey: 'modules.dev.fakeDataGenerator.description',
    category: 'developer',
    status: 'implemented',
    color: 'text-yellow-600',
  },

  // ============================================
  // DATA & CONVERSION (Placeholder)
  // ============================================
  {
    id: 'csv-to-json',
    path: '/data/csv-to-json',
    icon: 'csv-to-json',
    labelKey: 'modules.data.csvToJson.title',
    descriptionKey: 'modules.data.csvToJson.description',
    category: 'data',
    status: 'implemented',
    color: 'text-teal-600',
  },
  {
    id: 'json-to-csv',
    path: '/data/json-to-csv',
    icon: 'json-to-csv',
    labelKey: 'modules.data.jsonToCsv.title',
    descriptionKey: 'modules.data.jsonToCsv.description',
    category: 'data',
    status: 'implemented',
    color: 'text-teal-600',
  },

  // ============================================
  // SECURITY (Placeholder)
  // ============================================
  {
    id: 'file-encryption',
    path: '/security/file-encryption',
    icon: 'file-encryption',
    labelKey: 'modules.security.fileEncryption.title',
    descriptionKey: 'modules.security.fileEncryption.description',
    category: 'security',
    status: 'placeholder',
    color: 'text-indigo-600',
  },
  {
    id: 'file-hash',
    path: '/security/file-hash',
    icon: 'file-hash',
    labelKey: 'modules.security.fileHash.title',
    descriptionKey: 'modules.security.fileHash.description',
    category: 'security',
    status: 'placeholder',
    color: 'text-indigo-600',
  },
  {
    id: 'password-checker',
    path: '/security/password-checker',
    icon: 'password-checker',
    labelKey: 'modules.security.passwordChecker.title',
    descriptionKey: 'modules.security.passwordChecker.description',
    category: 'security',
    status: 'implemented',
    color: 'text-indigo-600',
  },

  // ============================================
  // TEXT TOOLS (Placeholder)
  // ============================================
  {
    id: 'text-format',
    path: '/text/format',
    icon: 'text-format',
    labelKey: 'modules.text.textFormatter.title',
    descriptionKey: 'modules.text.textFormatter.description',
    category: 'text',
    status: 'implemented',
    color: 'text-orange-700',
    isNew: true,
  },
  {
    id: 'word-counter',
    path: '/text/word-counter',
    icon: 'word-counter',
    labelKey: 'modules.text.wordCounter.title',
    descriptionKey: 'modules.text.wordCounter.description',
    category: 'text',
    status: 'implemented',
    color: 'text-blue-600',
  },
  {
    id: 'case-converter',
    path: '/text/case-converter',
    icon: 'case-converter',
    labelKey: 'modules.text.caseConverter.title',
    descriptionKey: 'modules.text.caseConverter.description',
    category: 'text',
    status: 'implemented',
    color: 'text-orange-600',
  },
  {
    id: 'slug-generator',
    path: '/text/slug-generator',
    icon: 'slug-generator',
    labelKey: 'modules.text.slugGenerator.title',
    descriptionKey: 'modules.text.slugGenerator.description',
    category: 'text',
    status: 'placeholder',
    color: 'text-orange-600',
  },
  {
    id: 'keyword-extractor',
    path: '/text/keyword-extractor',
    icon: 'keyword-extractor',
    labelKey: 'modules.text.keywordExtractor.title',
    descriptionKey: 'modules.text.keywordExtractor.description',
    category: 'text',
    status: 'implemented',
    color: 'text-purple-600',
  },
  {
    id: 'accent-remover',
    path: '/text/accent-remover',
    icon: 'accent-remover',
    labelKey: 'modules.text.accentRemover.title',
    descriptionKey: 'modules.text.accentRemover.description',
    category: 'text',
    status: 'implemented',
    color: 'text-blue-600',
  },
  {
    id: 'email-extractor',
    path: '/text/email-extractor',
    icon: 'email-extractor',
    labelKey: 'modules.text.emailExtractor.title',
    descriptionKey: 'modules.text.emailExtractor.description',
    category: 'text',
    status: 'implemented',
    color: 'text-blue-600',
  },
  {
    id: 'url-extractor',
    path: '/text/url-extractor',
    icon: 'url-extractor',
    labelKey: 'modules.text.urlExtractor.title',
    descriptionKey: 'modules.text.urlExtractor.description',
    category: 'text',
    status: 'implemented',
    color: 'text-green-600',
  },

  // ============================================
  // FILE TOOLS (Placeholder)
  // ============================================
  {
    id: 'zip-compress',
    path: '/files/zip-compress',
    icon: 'zip-compress',
    labelKey: 'modules.files.zipCompress.title',
    descriptionKey: 'modules.files.zipCompress.description',
    category: 'files',
    status: 'placeholder',
    color: 'text-gray-600',
  },
  {
    id: 'zip-extract',
    path: '/files/zip-extract',
    icon: 'zip-extract',
    labelKey: 'modules.files.zipExtract.title',
    descriptionKey: 'modules.files.zipExtract.description',
    category: 'files',
    status: 'placeholder',
    color: 'text-gray-600',
  },
  {
    id: 'file-rename',
    path: '/files/batch-rename',
    icon: 'batch-rename',
    labelKey: 'modules.files.batchRename.title',
    descriptionKey: 'modules.files.batchRename.description',
    category: 'files',
    status: 'placeholder',
    color: 'text-gray-600',
  },
  {
    id: 'duplicate-finder',
    path: '/files/duplicate-finder',
    icon: 'duplicate-finder',
    labelKey: 'modules.files.duplicateFinder.title',
    descriptionKey: 'modules.files.duplicateFinder.description',
    category: 'files',
    status: 'placeholder',
    color: 'text-gray-600',
  },
  {
    id: 'rar-compress',
    path: '/files/rar-compress',
    icon: 'rar-compress',
    labelKey: 'modules.files.rarCompress.title',
    descriptionKey: 'modules.files.rarCompress.description',
    category: 'files',
    status: 'placeholder',
    color: 'text-gray-600',
  },
  {
    id: 'rar-extract',
    path: '/files/rar-extract',
    icon: 'rar-extract',
    labelKey: 'modules.files.rarExtract.title',
    descriptionKey: 'modules.files.rarExtract.description',
    category: 'files',
    status: 'placeholder',
    color: 'text-gray-600',
  },
  {
    id: '7z-compress',
    path: '/files/7z-compress',
    icon: '7z-compress',
    labelKey: 'modules.files.7zCompress.title',
    descriptionKey: 'modules.files.7zCompress.description',
    category: 'files',
    status: 'placeholder',
    color: 'text-gray-600',
  },
  {
    id: '7z-extract',
    path: '/files/7z-extract',
    icon: '7z-extract',
    labelKey: 'modules.files.7zExtract.title',
    descriptionKey: 'modules.files.7zExtract.description',
    category: 'files',
    status: 'placeholder',
    color: 'text-gray-600',
  },
  {
    id: 'file-compare',
    path: '/files/file-compare',
    icon: 'file-compare',
    labelKey: 'modules.files.fileCompare.title',
    descriptionKey: 'modules.files.fileCompare.description',
    category: 'files',
    status: 'placeholder',
    color: 'text-gray-600',
  },

  // ============================================
  // DESIGN TOOLS (Placeholder)
  // ============================================
  {
    id: 'palette-generator',
    path: '/design/palette-generator',
    icon: 'palette-generator',
    labelKey: 'modules.design.paletteGenerator.title',
    descriptionKey: 'modules.design.paletteGenerator.description',
    category: 'design',
    status: 'implemented',
    color: 'text-indigo-600',
  },
  {
    id: 'gradient-generator',
    path: '/design/gradient-generator',
    icon: 'gradient-generator',
    labelKey: 'modules.design.gradientGenerator.title',
    descriptionKey: 'modules.design.gradientGenerator.description',
    category: 'design',
    status: 'implemented',
    color: 'text-cyan-600',
  },
];

/**
 * Category definitions for filtering
 */
export const CATEGORIES = [
  { id: 'all' as const, labelKey: 'categories.all' },
  { id: 'media' as const, labelKey: 'categories.media' },
  { id: 'document' as const, labelKey: 'categories.document' },
  { id: 'developer' as const, labelKey: 'categories.developer' },
  { id: 'data' as const, labelKey: 'categories.data' },
  { id: 'security' as const, labelKey: 'categories.security' },
  { id: 'text' as const, labelKey: 'categories.text' },
  { id: 'files' as const, labelKey: 'categories.files' },
  { id: 'design' as const, labelKey: 'categories.design' },
  { id: 'utility' as const, labelKey: 'categories.utility' },
];

/**
 * Helper function to get a module by ID
 */
export function getModuleById(id: string): ModuleDefinition | undefined {
  return MODULES.find(module => module.id === id);
}

/**
 * Helper function to get modules by category
 */
export function getModulesByCategory(category: ModuleCategory): ModuleDefinition[] {
  return MODULES.filter(module => module.category === category);
}

/**
 * Helper function to get only implemented modules
 */
export function getImplementedModules(): ModuleDefinition[] {
  return MODULES.filter(module => module.status === 'implemented');
}

/**
 * Helper function to get only placeholder modules
 */
export function getPlaceholderModules(): ModuleDefinition[] {
  return MODULES.filter(module => module.status === 'placeholder');
}

/**
 * Helper function to get all modules (for favorites/sidebar)
 */
export function getAllModules(): ModuleDefinition[] {
  return MODULES;
}

