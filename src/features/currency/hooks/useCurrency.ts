import { useQuery } from "@tanstack/react-query";
import { currencyApi } from "../api/currencyApi";
import { ConvertCurrencyPayload } from "../types";

export function useExchangeRates() {
  return useQuery({
    queryKey: ["exchangeRates"],
    queryFn: currencyApi.getRates,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useConvertCurrency(params: ConvertCurrencyPayload, enabled: boolean = true) {
  return useQuery({
    queryKey: ["convertCurrency", params.amount, params.from, params.to],
    queryFn: () => currencyApi.convert(params),
    enabled: enabled && params.amount > 0 && !!params.from && !!params.to,
    staleTime: 1000 * 60 * 60,
  });
}
