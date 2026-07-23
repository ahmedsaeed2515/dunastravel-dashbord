import { apiClient } from "@/lib/axios";
import { CurrencyRatesResponse, ConvertCurrencyPayload, ConvertCurrencyResponse } from "../types";

export const currencyApi = {
  getRates: async (): Promise<CurrencyRatesResponse> => {
    const response = await apiClient.get("/admin/currency/rates");
    return response as any;
  },

  convert: async (params: ConvertCurrencyPayload): Promise<ConvertCurrencyResponse> => {
    const response = await apiClient.get("/admin/currency/convert", { params });
    return response as any;
  }
};
