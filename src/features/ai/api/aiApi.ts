import { apiClient } from "@/lib/axios";
import { GenerateItineraryPayload, AiItineraryResponse, AiCustomerInsights } from "../types";

export const aiApi = {
  generateItinerary: async (payload: GenerateItineraryPayload): Promise<AiItineraryResponse> => {
    const response = await apiClient.post("/admin/ai/itinerary/generate", payload);
    return response as any;
  },

  analyzeCustomer: async (customerId: string): Promise<AiCustomerInsights> => {
    const response = await apiClient.post(`/admin/ai/customer/${customerId}/analyze`);
    return response as any;
  }
};
