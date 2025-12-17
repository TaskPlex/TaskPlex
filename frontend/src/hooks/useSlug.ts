import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { SlugResponse } from '../services/api';

export const useSlug = () => {
  return useMutation<SlugResponse, Error, { text: string }>({
    mutationFn: async ({ text }) => {
      return ApiService.generateSlug(text);
    },
  });
};

