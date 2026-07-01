export interface CurrencyRatesResponse {
  base: string;
  rates: Record<string, number>;
  timestamp: string;
}

export interface ConvertCurrencyPayload {
  amount: number;
  from: string;
  to: string;
}

export interface ConvertCurrencyResponse {
  originalAmount: number;
  from: string;
  to: string;
  convertedAmount: number;
}
