import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { JSMinifierResponse } from '../services/api';

export const useJSMinifier = () => {
  return useMutation<JSMinifierResponse, Error, { javascript: string }>({
    mutationFn: async ({ javascript }) => {
      return ApiService.minifyJS(javascript);
    },
  });
};



