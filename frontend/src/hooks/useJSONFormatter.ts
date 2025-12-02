import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { JSONFormatterResponse } from '../services/api';

export const useJSONFormatter = () => {
  return useMutation<
    JSONFormatterResponse,
    Error,
    { json: string; indentSize?: number }
  >({
    mutationFn: async ({ json, indentSize }) => {
      return ApiService.formatJSON(json, indentSize);
    },
  });
};



