import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { JSONDataGeneratorResponse } from '../services/api';

interface UseJSONDataGeneratorParams {
  template: string;
  iterations: number;
}

export const useJSONDataGenerator = () => {
  return useMutation<JSONDataGeneratorResponse, Error, UseJSONDataGeneratorParams>({
    mutationFn: async ({ template, iterations }) => {
      return ApiService.generateJSONData(template, iterations);
    },
  });
};

