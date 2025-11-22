import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { UnitConversionResponse } from '../services/api';

interface ConvertUnitsParams {
  value: number;
  fromUnit: string;
  toUnit: string;
}

export const useConvertUnits = () => {
  return useMutation<UnitConversionResponse, Error, ConvertUnitsParams>({
    mutationFn: ({ value, fromUnit, toUnit }) => 
      ApiService.convertUnits(value, fromUnit, toUnit),
  });
};



