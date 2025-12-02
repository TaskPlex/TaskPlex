import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { XMLFormatterResponse } from '../services/api';

export const useXMLFormatter = () => {
  return useMutation<
    XMLFormatterResponse,
    Error,
    { xml: string; indentSize?: number }
  >({
    mutationFn: async ({ xml, indentSize }) => {
      return ApiService.formatXML(xml, indentSize);
    },
  });
};



