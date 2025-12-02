import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { XMLMinifierResponse } from '../services/api';

export const useXMLMinifier = () => {
  return useMutation<XMLMinifierResponse, Error, { xml: string }>({
    mutationFn: async ({ xml }) => {
      return ApiService.minifyXML(xml);
    },
  });
};

