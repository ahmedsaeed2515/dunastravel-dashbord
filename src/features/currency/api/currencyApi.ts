import { apiClient } from "@/lib/axios";
import { CurrencyRatesResponse, ConvertCurrencyPayload, ConvertCurrencyResponse } from "../types";

export const currencyApi = {
  getRates: async (): Promise<CurrencyRatesResponse> => {
    const { data } = await apiClient.get("/admin/currency/rates");
    return data;
  },

  convert: async (params: ConvertCurrencyPayload): Promise<ConvertCurrencyResponse> => {
    const { data } = await apiClient.get("/admin/currency/convert", { params });
    return data;
  }
};
