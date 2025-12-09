import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type {
  PasswordGenerateRequest,
  PasswordGenerateResponse,
  PasswordCheckRequest,
  PasswordCheckResponse,
} from '../types/api';

export const useGeneratePassword = () => {
  return useMutation<PasswordGenerateResponse, Error, PasswordGenerateRequest>({
    mutationFn: async (payload) => {
      return ApiService.generatePassword(payload);
    },
  });
};

export const useCheckPassword = () => {
  return useMutation<PasswordCheckResponse, Error, PasswordCheckRequest>({
    mutationFn: async (payload) => {
      return ApiService.checkPassword(payload);
    },
  });
};

