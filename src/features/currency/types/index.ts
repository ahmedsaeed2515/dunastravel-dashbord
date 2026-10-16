export interface CurrencyRateDetail {
  code: string;
  rateToBase: string;
  lastUpdated: string;
  provider: string;
  isStale: boolean;
}

export interface CurrencyMetaInfo {
  ecbEurUsdRate: string;
  ecbUsdEurRate: string;
  source: string;
  provider: string;
  rateDate: string;
  isStale: boolean;
  status: string;
  lastUpdated: string;
}

export interface CurrencyRatesResponse {
  base: string;
  rates: Record<string, string | number>;
  details?: CurrencyRateDetail[];
  meta?: CurrencyMetaInfo;
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
