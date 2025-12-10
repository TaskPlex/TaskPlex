import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { UUIDGenerateRequest, UUIDGenerateResponse } from '../types/api';

export const useGenerateUUIDs = () => {
  return useMutation<UUIDGenerateResponse, Error, UUIDGenerateRequest>({
    mutationFn: async (payload) => {
      return ApiService.generateUUIDs(payload);
    },
  });
};

