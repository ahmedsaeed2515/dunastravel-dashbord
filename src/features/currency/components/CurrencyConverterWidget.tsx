"use client";

import { useState } from "react";
import { useExchangeRates } from "../hooks/useCurrency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Calculator, Loader2 } from "lucide-react";
import { QueryErrorState } from "@/components/shared/QueryErrorState";

export function CurrencyConverterWidget() {
  const { data: ratesData, isLoading, isError, refetch } = useExchangeRates();
  
  const [amount, setAmount] = useState<string>("1000");
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("EUR");
  
  // Calculate locally using the cached rates
  const calculateConversion = () => {
    const ratesMap = ratesData?.rates || (ratesData as any)?.data?.rates?.rates;
    if (!ratesMap) return "—";
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) return "—";
    
    const rawFrom = ratesMap[fromCurrency];
    const rawTo = ratesMap[toCurrency];
    const rateFrom = typeof rawFrom === "string" ? parseFloat(rawFrom) : Number(rawFrom);
    const rateTo = typeof rawTo === "string" ? parseFloat(rawTo) : Number(rawTo);
    
    if (!rateFrom || !rateTo || isNaN(rateFrom) || isNaN(rateTo)) return "—";
    
    const baseUsd = parsedAmount / rateFrom;
    const converted = baseUsd * rateTo;
    
    return converted.toFixed(2);
  };

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const ratesMap = ratesData?.rates || (ratesData as any)?.data?.rates?.rates;
  const availableCurrencies = ratesMap && typeof ratesMap === "object" ? Object.keys(ratesMap) : [];

  return (
    <Card className="shadow-lg border-primary/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md w-full max-w-sm">
      <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
          <Calculator className="h-4 w-4 text-primary" />
          Live Exchange Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <QueryErrorState message="تعذر تحميل أسعار الصرف من الخادم." onRetry={() => void refetch()} />
        ) : (
          <>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Amount</span>
                  <Input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    className="h-9 mt-1 text-sm font-medium"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1">From</span>
                  <Select value={fromCurrency} onValueChange={(val) => val && setFromCurrency(val)}>
                    <SelectTrigger className="h-9 mt-1 text-xs">
                      <SelectValue placeholder="USD" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCurrencies.map(c => (
                        <SelectItem key={`from-${c}`} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-center -my-2 relative z-10">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-7 w-7 rounded-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm"
                  onClick={handleSwap}
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground rotate-90" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Converted</span>
                  <div className="h-9 mt-1 flex items-center px-3 bg-gray-50 dark:bg-gray-900/50 rounded-md border border-gray-200 dark:border-gray-800">
                    <span className="text-lg font-bold font-mono text-gray-900 dark:text-white">
                      {calculateConversion()}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1">To</span>
                  <Select value={toCurrency} onValueChange={(val) => val && setToCurrency(val)}>
                    <SelectTrigger className="h-9 mt-1 text-xs">
                      <SelectValue placeholder="EUR" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCurrencies.map(c => (
                        <SelectItem key={`to-${c}`} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-center text-muted-foreground">
              Rates updated {ratesData?.timestamp ? new Date(ratesData.timestamp).toLocaleTimeString() : '—'}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
