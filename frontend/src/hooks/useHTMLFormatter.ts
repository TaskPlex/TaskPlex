import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { HTMLFormatterResponse } from '../services/api';

export const useHTMLFormatter = () => {
  return useMutation<
    HTMLFormatterResponse,
    Error,
    { html: string; indentSize?: number; indentChar?: string }
  >({
    mutationFn: async ({ html, indentSize, indentChar }) => {
      return ApiService.formatHTML(html, indentSize, indentChar);
    },
  });
};

