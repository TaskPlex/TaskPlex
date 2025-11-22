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

