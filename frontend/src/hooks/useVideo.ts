import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { VideoProcessingResponse, VideoToGifOptions, VideoExtractAudioOptions } from '../services/api';

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

export const useRotateVideo = () => {
  return useMutation<VideoProcessingResponse, Error, { file: File; angle: number }>({
    mutationFn: async ({ file, angle }) => {
      return ApiService.rotateVideo(file, angle);
    },
  });
};

export const useVideoToGif = () => {
  return useMutation<VideoProcessingResponse, Error, { file: File; options?: VideoToGifOptions }>({
    mutationFn: async ({ file, options }) => {
      return ApiService.videoToGif(file, options);
    },
  });
};

export const useExtractAudio = () => {
  return useMutation<
    VideoProcessingResponse,
    Error,
    { file: File; options?: VideoExtractAudioOptions }
  >({
    mutationFn: async ({ file, options }) => {
      return ApiService.extractAudio(file, options);
    },
  });
};

export const useMergeVideos = () => {
  return useMutation<VideoProcessingResponse, Error, { files: File[]; outputFormat: string; quality: string }>({
    mutationFn: async ({ files, outputFormat, quality }) => {
      return ApiService.mergeVideos(files, outputFormat, quality);
    },
  });
};

