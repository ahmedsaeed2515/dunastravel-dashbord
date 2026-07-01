export interface GenerateItineraryPayload {
  destinations: string[];
  days: number;
  budgetUsd?: number;
  pax?: number;
  preferences?: string;
}

export interface AiItineraryDay {
  dayNumber: number;
  location: string;
  morning: string;
  afternoon: string;
  evening: string;
  hotelRecommendation?: string;
}

export interface AiItineraryResponse {
  title: string;
  description: string;
  days: AiItineraryDay[];
}

export interface AiCustomerInsights {
  summary: string;
  suggestedDestinations: string[];
  salesStrategy: string;
  churnRisk: "Low" | "Medium" | "High" | string;
}
