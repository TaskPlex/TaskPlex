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

