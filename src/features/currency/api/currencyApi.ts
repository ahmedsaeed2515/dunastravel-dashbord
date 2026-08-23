import { apiClient } from "@/lib/axios";
import { CurrencyRatesResponse, ConvertCurrencyPayload, ConvertCurrencyResponse } from "../types";

export const currencyApi = {
  getRates: async (): Promise<CurrencyRatesResponse> => {
    const response: any = await apiClient.get("/admin/currency/rates");
    
    // Safely unwrap nested response:
    // payload structure: { success: true, data: { base: "USD", rates: { base: "USD", rates: { USD: "1.000000" } } } }
    const root = response?.data?.rates ? response.data : response;
    const ratesObject = root?.rates?.rates || root?.rates;
    const base = root?.base || root?.rates?.base;
    const timestamp = root?.timestamp || root?.rates?.timestamp;
    if (!ratesObject || typeof ratesObject !== "object" || !base || !timestamp) throw new Error("Invalid currency rates response");

    const rates: Record<string, number> = {};
    if (ratesObject && typeof ratesObject === "object") {
      Object.keys(ratesObject).forEach((code) => {
        const val = ratesObject[code];
        const parsed = typeof val === "string" ? parseFloat(val) : Number(val);
        if (!Number.isFinite(parsed)) throw new Error(`Invalid currency rate for ${code}`);
        rates[code] = parsed;
      });
    }

    return {
      base,
      rates,
      timestamp,
    };
  },

  convert: async (params: ConvertCurrencyPayload): Promise<ConvertCurrencyResponse> => {
    const response: any = await apiClient.get("/admin/currency/convert", { params });
    return response?.data || response;
  }
};
