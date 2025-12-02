import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { JSFormatterResponse } from '../services/api';

export const useJSFormatter = () => {
  return useMutation<
    JSFormatterResponse,
    Error,
    { javascript: string; indentSize?: number; indentChar?: string; wrapLineLength?: number }
  >({
    mutationFn: async ({ javascript, indentSize, indentChar, wrapLineLength }) => {
      return ApiService.formatJS(javascript, indentSize, indentChar, wrapLineLength);
    },
  });
};

