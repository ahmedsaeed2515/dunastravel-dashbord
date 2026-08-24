import { apiClient } from "@/lib/axios";
import { CurrencyRatesResponse, ConvertCurrencyPayload, ConvertCurrencyResponse } from "../types";

export const currencyApi = {
  getRates: async (): Promise<CurrencyRatesResponse> => {
    return apiClient.get<CurrencyRatesResponse, CurrencyRatesResponse>('/admin/currency/rates');
  },

  convert: async (params: ConvertCurrencyPayload): Promise<ConvertCurrencyResponse> => {
    return apiClient.get<ConvertCurrencyResponse, ConvertCurrencyResponse>('/admin/currency/convert', { params });
  }
};
