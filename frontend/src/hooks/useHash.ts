import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { HashResponse } from '../types/api';

type Algorithm = 'md5' | 'sha1' | 'sha256' | 'sha512';

export const useHash = () => {
  return useMutation<
    HashResponse,
    Error,
    { text: string; algorithm?: Algorithm; uppercase?: boolean; salt?: string }
  >({
    mutationFn: async ({ text, algorithm = 'sha256', uppercase = false, salt }) =>
      ApiService.generateHash(text, algorithm, uppercase, salt),
  });
};

