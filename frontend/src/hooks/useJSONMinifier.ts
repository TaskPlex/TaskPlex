import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { JSONMinifierResponse } from '../services/api';

export const useJSONMinifier = () => {
  return useMutation<JSONMinifierResponse, Error, { json: string }>({
    mutationFn: async ({ json }) => {
      return ApiService.minifyJSON(json);
    },
  });
};

