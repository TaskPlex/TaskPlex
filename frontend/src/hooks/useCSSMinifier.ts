import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { CSSMinifierResponse } from '../services/api';

export const useCSSMinifier = () => {
  return useMutation<CSSMinifierResponse, Error, { css: string }>({
    mutationFn: async ({ css }) => {
      return ApiService.minifyCSS(css);
    },
  });
};



