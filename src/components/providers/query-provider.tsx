"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ApiError } from "@/lib/api-types";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              const apiError = error as ApiError;
              // Do not retry on 401 Unauthorized, 403 Forbidden, or 404 Not Found
              if (
                apiError?.status === 401 ||
                apiError?.status === 403 ||
                apiError?.status === 404
              ) {
                return false;
              }
              // Bound retry count to max 1 for client 4xx errors, max 2 for 5xx/network errors
              if (apiError?.status && apiError.status >= 400 && apiError.status < 500) {
                return failureCount < 1;
              }
              return failureCount < 2;
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
