import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { RegexResponse } from '../services/api';

interface UseRegexParams {
  pattern: string;
  text: string;
  flags: string;
}

export const useRegex = () => {
  return useMutation<RegexResponse, Error, UseRegexParams>({
    mutationFn: async ({ pattern, text, flags }) => {
      // If pattern or text is empty, we could resolve with empty result or throw.
      // But typically UI handles the call logic.
      return ApiService.testRegex(pattern, text, flags);
    },
  });
};

