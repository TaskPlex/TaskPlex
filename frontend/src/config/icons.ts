import {
  // Media - Video
  Video, Minimize2, Play, Scissors, Merge, RotateCw, Subtitles, ImageIcon, Film, Gauge,
  // Media - Audio
  Music, Volume2, AudioWaveform, Split, Volume, VolumeX,
  // Media - Image
  Image, Crop, RotateCcw, FlipHorizontal, Palette, Eraser, Droplets,
  FileImage, Maximize2, Circle, ImagePlus, Grid3x3, Sparkles,
  // Documents - PDF
  FileText, FileSearch, Stamp, Lock, FileSignature, FileEdit,
  FileCheck, RefreshCw, FilePlus2, FileSpreadsheet, Scan,
  // Developer Tools
  Code, Code2, Braces, Hash, Binary, Key, QrCode, Eye, Palette as PaletteIcon,
  FileJson, FileCode, FileType, Link, Regex, Type,
  // Data & Conversion
  Database, Table, FileSpreadsheet as FileExcel, BarChart, Calculator, DollarSign, Calendar, Clock,
  // Security
  Lock as LockIcon, ShieldCheck, KeyRound, FileType as FileKey, AlertTriangle,
  // Text Tools
  FileText as TextIcon, CaseSensitive, Hash as HashIcon, Diff,
  Mail, Phone, ArrowDownUp, Shuffle, Smile,
  // File Tools
  FolderArchive, FolderOpen, FileCog, Files, Search, FolderClock, HardDrive, Trash2, FolderTree, Info,
  // Design Tools
  ImageIcon as Favicon, Palette as ColorPalette, Layers, Shapes, Sparkles as SparklesIcon,
  Award, GitBranch,
  // Utility
  Ruler, Settings, LayoutDashboard,
  Star, ChevronLeft, ChevronRight, Menu
} from 'lucide-react';

export const iconMap = {
  // Media - Video
  'video': Video,
  'video-compress': Minimize2,
  'video-convert': Play,
  'video-extract-audio': Music,
  'video-trim': Scissors,
  'video-merge': Merge,
  'video-rotate': RotateCw,
  'video-add-subtitles': Subtitles,
  'video-extract-frames': ImageIcon,
  'video-to-gif': Film,
  'video-change-speed': Gauge,
  
  // Media - Audio
  'audio': Music,
  'audio-convert': AudioWaveform,
  'audio-compress': Volume2,
  'audio-trim': Scissors,
  'audio-merge': Merge,
  'audio-normalize': Volume,
  'audio-fade': Volume2,
  'audio-silence-remove': VolumeX,
  'audio-metadata': Info,
  
  // Media - Image
  'image': Image,
  'image-compress': Minimize2,
  'image-convert': FileImage,
  'image-resize': Maximize2,
  'image-crop': Crop,
  'image-rotate': RotateCcw,
  'image-flip': FlipHorizontal,
  'image-adjust': Palette,
  'image-filters': Sparkles,
  'image-merge': ImagePlus,
  'image-add-text': Type,
  'image-add-shapes': Shapes,
  'image-remove-bg': Eraser,
  'image-face-detect': Smile,
  'image-collage': Grid3x3,
  'image-to-icon': Circle,
  'image-webp': FileImage,
  'image-extract-colors': Droplets,
  'image-gif-create': Film,
  'image-gif-split': Split,
  'image-favicon': Favicon,
  'image-watermark': Stamp,
  
  // Documents - PDF
  'pdf': FileText,
  'pdf-compress': Minimize2,
  'pdf-merge': Merge,
  'pdf-split': Scissors,
  'pdf-reorganize': RefreshCw,
  'pdf-to-images': ImageIcon,
  'pdf-images-to-pdf': FilePlus2,
  'pdf-extract-text': FileSearch,
  'pdf-search-replace': FileEdit,
  'pdf-watermark': Stamp,
  'pdf-password': Lock,
  'pdf-signature': FileSignature,
  'pdf-annotate': FileEdit,
  'pdf-resize': Maximize2,
  'pdf-to-word': FileText,
  'pdf-word-to-pdf': FileText,
  'pdf-ocr': Scan,
  
  // Developer Tools
  'regex': Regex,
  'json-formatter': Braces,
  'json-validator': FileCheck,
  'xml-formatter': Code,
  'code-formatter': Code2,
  'hash-generator': Hash,
  'base64-encoder': Binary,
  'url-encoder': Link,
  'uuid-generator': Key,
  'password-generator': KeyRound,
  'text-diff': Diff,
  'char-counter': Type,
  'qr-generator': QrCode,
  'qr-reader': Eye,
  'barcode-generator': Binary,
  'color-converter': PaletteIcon,
  'css-formatter': Palette,
  'css-minifier': FileCode,
  'js-formatter': FileCode,
  'js-minifier': FileJson,
  'code-minifier': FileCode,
  'html-minifier': FileText,
  'json-minifier': FileJson,
  'xml-minifier': FileType,
  'html-validator': FileCode,
  'lorem-ipsum': FileText,
  'fake-data-generator': Database,
  'palette': Palette,
  'file-code': FileCode,
  'minimize-2': Minimize2,
  
  // Data & Conversion
  'csv-to-json': Database,
  'json-to-csv': Table,
  'csv-to-excel': FileExcel,
  'csv-editor': Table,
  'excel-to-pdf': FileSpreadsheet,
  'chart-generator': BarChart,
  'calculator': Calculator,
  'currency-converter': DollarSign,
  'calendar-generator': Calendar,
  'date-calculator': Clock,
  
  // Security
  'file-encryption': LockIcon,
  'key-generator': Key,
  'password-checker': ShieldCheck,
  'certificate-generator': FileKey,
  'security-analyzer': AlertTriangle,
  'file-hash': Hash,
  
  // Text Tools
  'word-counter': TextIcon,
  'spell-checker': FileCheck,
  'text-summarizer': FileText,
  'keyword-extractor': HashIcon,
  'case-converter': CaseSensitive,
  'accent-remover': Type,
  'slug-generator': Link,
  'language-detector': Type,
  'text-translator': Type,
  'text-diff-compare': Diff,
  'email-extractor': Mail,
  'url-extractor': Link,
  'phone-extractor': Phone,
  'text-reverser': ArrowDownUp,
  'text-randomizer': Shuffle,
  
  // File Tools
  'zip-compress': FolderArchive,
  'zip-extract': FolderOpen,
  'rar-compress': FolderArchive,
  'rar-extract': FolderOpen,
  '7z-compress': FolderArchive,
  '7z-extract': FolderOpen,
  'tar-compress': FolderArchive,
  'tar-extract': FolderOpen,
  'file-manager': Files,
  'file-search': Search,
  'file-compare': Diff,
  'duplicate-finder': Files,
  'batch-rename': FileCog,
  'file-organizer': FolderClock,
  'disk-analyzer': HardDrive,
  'file-cleaner': Trash2,
  'folder-tree': FolderTree,
  
  // Design Tools
  'favicon-generator': Favicon,
  'palette-generator': ColorPalette,
  'gradient-generator': Layers,
  'pattern-generator': Shapes,
  'logo-generator': SparklesIcon,
  'badge-generator': Award,
  'diagram-creator': GitBranch,
  
  // Utility
  'units': Ruler,
  'settings': Settings,
  'dashboard': LayoutDashboard,
  'star': Star,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'menu': Menu,
} as const;

export type IconName = keyof typeof iconMap;

export function getIcon(iconName: IconName) {
  return iconMap[iconName] || FileText;
}
