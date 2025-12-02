import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { HTMLMinifierResponse } from '../services/api';

export const useHTMLMinifier = () => {
  return useMutation<HTMLMinifierResponse, Error, { html: string }>({
    mutationFn: async ({ html }) => {
      return ApiService.minifyHTML(html);
    },
  });
};

