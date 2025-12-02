import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { CodeMinifierResponse } from '../services/api';

export const useCodeMinifier = () => {
  return useMutation<CodeMinifierResponse, Error, { code: string; language?: string }>({
    mutationFn: async ({ code, language }) => {
      return ApiService.minifyCode(code, language || 'auto');
    },
  });
};

