import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { ImageProcessingResponse } from '../services/api';

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

