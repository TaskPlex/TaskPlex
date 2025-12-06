import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { TextFormatResponse } from '../types/api';

export const useFormatText = () => {
  return useMutation<TextFormatResponse, Error, { text: string }>({
    mutationFn: async ({ text }) => ApiService.formatText(text),
  });
};


