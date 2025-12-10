import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { QRCodeReadResponse } from '../services/api';

export const useQRCodeReader = () => {
  return useMutation<QRCodeReadResponse, Error, File>({
    mutationFn: async (file: File) => {
      return ApiService.readQRCode(file);
    },
  });
};

