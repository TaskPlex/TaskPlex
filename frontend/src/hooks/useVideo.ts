import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { VideoProcessingResponse } from '../services/api';

export const useCompressVideo = () => {
  return useMutation<VideoProcessingResponse, Error, { file: File; quality: string }>({
    mutationFn: async ({ file, quality }) => {
      return ApiService.compressVideo(file, quality);
    },
  });
};

export const useConvertVideo = () => {
  return useMutation<VideoProcessingResponse, Error, { file: File; outputFormat: string; quality: string }>({
    mutationFn: async ({ file, outputFormat, quality }) => {
      return ApiService.convertVideo(file, outputFormat, quality);
    },
  });
};

