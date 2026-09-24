import { apiClient } from "@/lib/axios";
import { AddAttachmentPayload, AddNotePayload, Booking, BookingAttachment, BookingNote, BookingQueryFilters, ManualBookingPayload, UpdateBookingPayload, UpdateBookingStatusPayload, UpsertPassengersPayload, AssignBookingPayload, BulkUpdateBookingsPayload } from "../types";
import { PaginatedResponse } from "@/lib/api-types";

export const bookingsApi = {
  getBookings: async (filters: BookingQueryFilters): Promise<PaginatedResponse<Booking>> => {
    return apiClient.get<PaginatedResponse<Booking>, PaginatedResponse<Booking>>("/admin/bookings", { params: filters });
  },

  getBookingByReferenceCode: async (referenceCode: string): Promise<Booking> => {
    return apiClient.get<Booking, Booking>(`/admin/bookings/${referenceCode}`);
  },

  createManualBooking: async (data: ManualBookingPayload, idempotencyKey: string): Promise<Booking> => {
    return apiClient.post<Booking, Booking>(`/admin/bookings`, data, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
  },

  updateBooking: async (referenceCode: string, data: UpdateBookingPayload): Promise<Booking> => {
    return apiClient.patch<Booking, Booking>(`/admin/bookings/${referenceCode}`, data);
  },

  updateBookingStatus: async (referenceCode: string, data: UpdateBookingStatusPayload): Promise<Booking> => {
    return apiClient.patch<Booking, Booking>(`/admin/bookings/${referenceCode}/status`, data);
  },

  upsertPassengers: async (referenceCode: string, data: UpsertPassengersPayload): Promise<void> => {
    await apiClient.patch(`/admin/bookings/${referenceCode}/passengers`, data);
  },

  assignBooking: async (referenceCode: string, data: AssignBookingPayload): Promise<Booking> => {
    return apiClient.patch<Booking, Booking>(`/admin/bookings/${referenceCode}/assign`, data);
  },

  softDeleteBooking: async (referenceCode: string): Promise<void> => {
    await apiClient.delete(`/admin/bookings/${referenceCode}`);
  },

  bulkUpdateBookings: async (data: BulkUpdateBookingsPayload): Promise<{ count: number }> => {
    return apiClient.patch<{ count: number }, { count: number }>("/admin/bookings/bulk/update", data);
  },

  exportBookingsCsv: async (filters: BookingQueryFilters): Promise<Blob> => {
    const csv = await apiClient.get<string, string>("/admin/bookings/export/csv", { params: filters });
    return new Blob([csv], { type: 'text/csv;charset=utf-8' });
  },

  restoreBooking: async (referenceCode: string): Promise<Booking> => {
    return apiClient.post<Booking, Booking>(`/admin/bookings/${referenceCode}/restore`);
  },

  addNote: async (referenceCode: string, data: AddNotePayload): Promise<BookingNote> => {
    return apiClient.post<BookingNote, BookingNote>(`/admin/bookings/${referenceCode}/notes`, data);
  },

  addAttachment: async (referenceCode: string, data: AddAttachmentPayload): Promise<BookingAttachment> => {
    return apiClient.post<BookingAttachment, BookingAttachment>(`/admin/bookings/${referenceCode}/attachments`, data);
  },

  recordManualPayment: async (referenceCode: string, data: { amount: number; method?: string; transactionId?: string; notes?: string }): Promise<any> => {
    return apiClient.post(`/admin/bookings/${referenceCode}/payments`, data);
  },

  cancelWithRefund: async (referenceCode: string, data?: { reason?: string }): Promise<any> => {
    return apiClient.post(`/admin/bookings/${referenceCode}/refund-and-cancel`, data || {});
  },

  getBookingInvoice: async (bookingReferenceOrId: string): Promise<any> => {
    return apiClient.get<any, any>(`/admin/invoices/${encodeURIComponent(bookingReferenceOrId)}`);
  }
};
