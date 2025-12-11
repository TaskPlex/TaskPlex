import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { GradientGeneratorResponse, GradientType } from '../services/api';

export const useGradientGenerator = () => {
  return useMutation<
    GradientGeneratorResponse,
    Error,
    { colors: string[]; type: GradientType; width: number; height: number; angle: number; stops?: number[] }
  >({
    mutationFn: async ({ colors, type, width, height, angle, stops }) => {
      return ApiService.generateGradient(colors, type, width, height, angle, stops);
    },
  });
};

