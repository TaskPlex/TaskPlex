import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { CSSFormatterResponse } from '../services/api';

export const useCSSFormatter = () => {
  return useMutation<
    CSSFormatterResponse,
    Error,
    { css: string; indentSize?: number; indentChar?: string }
  >({
    mutationFn: async ({ css, indentSize, indentChar }) => {
      return ApiService.formatCSS(css, indentSize, indentChar);
    },
  });
};

