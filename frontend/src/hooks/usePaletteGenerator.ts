import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { PaletteGeneratorResponse, PaletteScheme } from '../services/api';

export const usePaletteGenerator = () => {
  return useMutation<PaletteGeneratorResponse, Error, { baseColor: string; scheme: PaletteScheme; count: number }>({
    mutationFn: async ({ baseColor, scheme, count }) => {
      return ApiService.generatePalette(baseColor, scheme, count);
    },
  });
};

