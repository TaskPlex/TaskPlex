import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { HTMLValidationResponse } from '../services/api';

export const useHTMLValidator = () => {
  return useMutation<HTMLValidationResponse, Error, { html: string }>({
    mutationFn: async ({ html }) => {
      return ApiService.validateHTML(html);
    },
  });
};

