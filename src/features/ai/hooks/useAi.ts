import { useMutation } from "@tanstack/react-query";
import { aiApi } from "../api/aiApi";
import { toast } from "sonner";

export function useGenerateItinerary() {
  return useMutation({
    mutationFn: aiApi.generateItinerary,
    onSuccess: () => {
      toast.success("AI Itinerary generated successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to generate AI itinerary.");
    },
  });
}

export function useAnalyzeCustomer() {
  return useMutation({
    mutationFn: aiApi.analyzeCustomer,
    onSuccess: () => {
      toast.success("Customer profile analyzed by AI.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to analyze customer.");
    },
  });
}
