import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { ColorConversionResponse } from '../types/api';

export const useConvertColor = () => {
  return useMutation<ColorConversionResponse, Error, { color: string }>({
    mutationFn: async ({ color }) => ApiService.convertColor(color),
  });
};

