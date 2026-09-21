"use client";

import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-types";
import { initDashboardSentry, captureDashboardException } from "@/lib/sentry";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initDashboardSentry();
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            const apiError = error as ApiError;
            // Auth errors (401/403) are handled gracefully by redirection logic
            if (apiError?.status === 401 || apiError?.status === 403) {
              return;
            }
            if (!apiError?.status || apiError.status >= 500) {
              captureDashboardException(error);
            }
            toast.error(apiError?.message || "Could not load the requested data.");
          },
        }),
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
              // HTTP responses are deterministic application errors. Retrying them
              // creates duplicate requests and hides the actionable error state.
              if (apiError?.status && apiError.status >= 400) {
                return false;
              }
              // A single retry is reserved for transient network failures only.
              return failureCount < 1;
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
