import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { CodeFormatterResponse } from '../services/api';

export const useCodeFormatter = () => {
  return useMutation<
    CodeFormatterResponse,
    Error,
    { code: string; language?: string; indentSize?: number; indentChar?: string; wrapLineLength?: number }
  >({
    mutationFn: async ({ code, language, indentSize, indentChar, wrapLineLength }) => {
      return ApiService.formatCode(code, language, indentSize, indentChar, wrapLineLength);
    },
  });
};



