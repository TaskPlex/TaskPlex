import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { PDFProcessingResponse } from '../services/api';

export const useCompressPDF = () => {
  return useMutation<PDFProcessingResponse, Error, { file: File }>({
    mutationFn: async ({ file }) => {
      return ApiService.compressPDF(file);
    },
  });
};

export const useMergePDFs = () => {
  return useMutation<PDFProcessingResponse, Error, { files: File[] }>({
    mutationFn: async ({ files }) => {
      return ApiService.mergePDFs(files);
    },
  });
};

export const useSplitPDF = () => {
  return useMutation<PDFProcessingResponse, Error, { file: File; pages?: string; pageRanges?: string }>({
    mutationFn: async ({ file, pages, pageRanges }) => {
      return ApiService.splitPDF(file, pages, pageRanges);
    },
  });
};

export const useReorganizePDF = () => {
  return useMutation<PDFProcessingResponse, Error, { file: File; pageOrder: string }>({
    mutationFn: async ({ file, pageOrder }) => {
      return ApiService.reorganizePDF(file, pageOrder);
    },
  });
};

export const useOCRPDF = () => {
  return useMutation<PDFProcessingResponse, Error, { file: File; language?: string }>({
    mutationFn: async ({ file, language = 'eng' }) => {
      return ApiService.extractTextOCR(file, language);
    },
  });
};

export const usePDFToWord = () => {
  return useMutation<PDFProcessingResponse, Error, { file: File }>({
    mutationFn: async ({ file }) => ApiService.pdfToWord(file),
  });
};

export const useWordToPDF = () => {
  return useMutation<PDFProcessingResponse, Error, { file: File }>({
    mutationFn: async ({ file }) => ApiService.wordToPdf(file),
  });
};

export const usePasswordPDF = () => {
  return useMutation<
    PDFProcessingResponse,
    Error,
    { file: File; action: 'add' | 'remove'; password: string }
  >({
    mutationFn: async ({ file, action, password }) => {
      return ApiService.passwordPDF(file, action, password);
    },
  });
};

export const usePDFToImages = () => {
  return useMutation<
    PDFProcessingResponse,
    Error,
    { file: File; imageFormat?: string; dpi?: number }
  >({
    mutationFn: async ({ file, imageFormat = 'png', dpi = 150 }) => {
      return ApiService.pdfToImages(file, imageFormat, dpi);
    },
  });
};

export const useImagesToPDF = () => {
  return useMutation<
    PDFProcessingResponse,
    Error,
    { files: File[]; pageSize?: string }
  >({
    mutationFn: async ({ files, pageSize }) => {
      return ApiService.imagesToPDF(files, pageSize);
    },
  });
};

