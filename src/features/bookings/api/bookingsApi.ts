import { apiClient } from "@/lib/axios";
import { Booking, BookingQueryFilters, UpdateBookingPayload, UpdateBookingStatusPayload, UpsertPassengersPayload, AssignBookingPayload, BulkUpdateBookingsPayload, CreateManualBookingPayload } from "../types";
import { PaginatedResponse } from "@/lib/api-types";
import { requirePaginated } from "@/lib/api-response";

export const bookingsApi = {
  getBookings: async (filters: BookingQueryFilters): Promise<PaginatedResponse<Booking>> => {
    const response = await apiClient.get<PaginatedResponse<Booking>>("/admin/bookings", { params: filters });
    return requirePaginated(response, "bookings");
  },

  getBookingByReferenceCode: async (referenceCode: string): Promise<Booking> => {
    const response = await apiClient.get<Booking>(`/admin/bookings/${referenceCode}`);
    return response as any;
  },

  createManualBooking: async (data: CreateManualBookingPayload): Promise<Booking> => {
    const response = await apiClient.post<Booking>(`/admin/bookings`, data, {
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    });
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
  },

  restoreBooking: async (referenceCode: string): Promise<Booking> => {
    const response = await apiClient.post<Booking>(`/admin/bookings/${referenceCode}/restore`);
    return response as any;
  },

  addPayment: async (referenceCode: string, data: any): Promise<any> => {
    const response = await apiClient.post(`/admin/bookings/${referenceCode}/payments`, data);
    return response as any;
  },

  addNote: async (referenceCode: string, data: any): Promise<any> => {
    const response = await apiClient.post(`/admin/bookings/${referenceCode}/notes`, data);
    return response as any;
  },

  addAttachment: async (referenceCode: string, data: any): Promise<any> => {
    const formData = new FormData();
    formData.append("file", data.file);
    if (data.documentType) formData.append("documentType", data.documentType);

    const response = await apiClient.post(`/admin/bookings/${referenceCode}/attachments`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response as any;
  }
};
