import { apiClient } from "@/lib/axios";
import { Booking, BookingQueryFilters, UpdateBookingPayload, UpdateBookingStatusPayload, UpsertPassengersPayload, AssignBookingPayload, BulkUpdateBookingsPayload } from "../types";
import { PaginatedResponse } from "@/lib/api-types";

export const bookingsApi = {
  getBookings: async (filters: BookingQueryFilters): Promise<PaginatedResponse<Booking>> => {
    const response = await apiClient.get<PaginatedResponse<Booking>>("/admin/bookings", { params: filters });
    return response as any;
  },

  getBookingByReferenceCode: async (referenceCode: string): Promise<Booking> => {
    const response = await apiClient.get<Booking>(`/admin/bookings/${referenceCode}`);
    return response as any;
  },

  updateBooking: async (referenceCode: string, data: UpdateBookingPayload): Promise<Booking> => {
    const response = await apiClient.patch<Booking>(`/admin/bookings/${referenceCode}`, data);
    return response as any;
  },

  updateBookingStatus: async (referenceCode: string, data: UpdateBookingStatusPayload): Promise<Booking> => {
    const response = await apiClient.patch<Booking>(`/admin/bookings/${referenceCode}/status`, data);
    return response as any;
  },

  upsertPassengers: async (referenceCode: string, data: UpsertPassengersPayload): Promise<void> => {
    await apiClient.patch(`/admin/bookings/${referenceCode}/passengers`, data);
  },

  assignBooking: async (referenceCode: string, data: AssignBookingPayload): Promise<Booking> => {
    const response = await apiClient.patch<Booking>(`/admin/bookings/${referenceCode}/assign`, data);
    return response as any;
  },

  softDeleteBooking: async (referenceCode: string): Promise<void> => {
    await apiClient.delete(`/admin/bookings/${referenceCode}`);
  },

  bulkUpdateBookings: async (data: BulkUpdateBookingsPayload): Promise<{ count: number }> => {
    const response = await apiClient.patch<{ count: number }>("/admin/bookings/bulk/update", data);
    return response as any;
  },

  exportBookingsCsv: async (filters: BookingQueryFilters): Promise<Blob> => {
    const response = await apiClient.get("/admin/bookings/export/csv", { 
      params: filters,
      responseType: 'blob' 
    });
    return response as any;
  }
};
