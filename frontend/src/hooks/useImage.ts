import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { ColorExtractionResponse, ImageProcessingResponse } from '../services/api';

export const useCompressImage = () => {
  return useMutation<ImageProcessingResponse, Error, { file: File; quality: string }>({
    mutationFn: async ({ file, quality }) => {
      return ApiService.compressImage(file, quality);
    },
  });
};

export const useConvertImage = () => {
  return useMutation<ImageProcessingResponse, Error, { file: File; outputFormat: string; quality: string }>({
    mutationFn: async ({ file, outputFormat, quality }) => {
      return ApiService.convertImage(file, outputFormat, quality);
    },
  });
};

export const useRotateImage = () => {
  return useMutation<ImageProcessingResponse, Error, { file: File; angle: number }>({
    mutationFn: async ({ file, angle }) => {
      return ApiService.rotateImage(file, angle);
    },
  });
};

export const useExtractColors = () => {
  return useMutation<ColorExtractionResponse, Error, { file: File; maxColors?: number }>({
    mutationFn: async ({ file, maxColors = 6 }) => {
      return ApiService.extractColors(file, maxColors);
    },
  });
};

export const useAdjustImage = () => {
  return useMutation<
    ImageProcessingResponse,
    Error,
    { file: File; brightness: number; contrast: number; saturation: number }
  >({
    mutationFn: async ({ file, brightness, contrast, saturation }) => {
      return ApiService.adjustImage(file, brightness, contrast, saturation);
    },
  });
};

export const useFilterImage = () => {
  return useMutation<ImageProcessingResponse, Error, { file: File; filter: string }>({
    mutationFn: async ({ file, filter }) => ApiService.filterImage(file, filter),
  });
};

export const useResizeImage = () => {
  return useMutation<
    ImageProcessingResponse,
    Error,
    { file: File; width?: number; height?: number; maintainAspectRatio: boolean; resample: string }
  >({
    mutationFn: async ({ file, width, height, maintainAspectRatio, resample }) => {
      return ApiService.resizeImage(file, width, height, maintainAspectRatio, resample);
    },
  });
};

