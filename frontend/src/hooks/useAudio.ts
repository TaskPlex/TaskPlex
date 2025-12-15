import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { AudioProcessingResponse } from '../services/api';

export const useConvertAudio = () => {
  return useMutation<
    AudioProcessingResponse,
    Error,
    { file: File; outputFormat: string; quality: string; bitrate: string }
  >({
    mutationFn: async ({ file, outputFormat, quality, bitrate }) => {
      return ApiService.convertAudio(file, outputFormat, quality, bitrate);
    },
  });
};

export const useCompressAudio = () => {
  return useMutation<
    AudioProcessingResponse,
    Error,
    { file: File; quality: string; targetBitrate: string }
  >({
    mutationFn: async ({ file, quality, targetBitrate }) => {
      return ApiService.compressAudio(file, quality, targetBitrate);
    },
  });
};

export const useMergeAudio = () => {
  return useMutation<
    AudioProcessingResponse,
    Error,
    { files: File[]; outputFormat: string; quality: string; bitrate: string }
  >({
    mutationFn: async ({ files, outputFormat, quality, bitrate }) => {
      return ApiService.mergeAudio(files, outputFormat, quality, bitrate);
    },
  });
};

