import { apiClient } from "@/lib/axios";
import { GenerateItineraryPayload, AiItineraryResponse, AiCustomerInsights } from "../types";

export const aiApi = {
  generateItinerary: async (payload: GenerateItineraryPayload): Promise<AiItineraryResponse> => {
    const { data } = await apiClient.post("/admin/ai/itinerary/generate", payload);
    return data;
  },

  analyzeCustomer: async (customerId: string): Promise<AiCustomerInsights> => {
    const { data } = await apiClient.post(`/admin/ai/customer/${customerId}/analyze`);
    return data;
  }
};
