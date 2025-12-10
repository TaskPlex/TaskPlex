import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { NumberConversionResponse } from '../services/api';

interface UseNumberConverterParams {
  number: string;
  fromBase: 'binary' | 'decimal' | 'hexadecimal' | 'octal';
  toBase: 'binary' | 'decimal' | 'hexadecimal' | 'octal';
}

export const useNumberConverter = () => {
  return useMutation<NumberConversionResponse, Error, UseNumberConverterParams>({
    mutationFn: async ({ number, fromBase, toBase }) => {
      return ApiService.convertNumber(number, fromBase, toBase);
    },
  });
};

