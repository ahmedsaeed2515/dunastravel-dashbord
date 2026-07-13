import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingsApi } from "../api/bookingsApi";
import { BookingQueryFilters, UpdateBookingPayload, UpdateBookingStatusPayload, UpsertPassengersPayload, AssignBookingPayload, BulkUpdateBookingsPayload } from "../types";
import { toast } from "sonner";

export function useBookings(filters: BookingQueryFilters) {
  return useQuery({
    queryKey: ["bookings", filters],
    queryFn: () => bookingsApi.getBookings(filters),
    refetchInterval: 30000,
  });
}

export function useBooking(referenceCode: string) {
  return useQuery({
    queryKey: ["bookings", referenceCode],
    queryFn: () => bookingsApi.getBookingByReferenceCode(referenceCode),
    enabled: !!referenceCode,
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ referenceCode, data }: { referenceCode: string, data: UpdateBookingPayload }) => bookingsApi.updateBooking(referenceCode, data),
    onSuccess: (data, variables) => {
      toast.success("Booking updated successfully");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", variables.referenceCode] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update booking");
    },
  });
}

export function useCreateManualBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { tourId: string, userId: string, passengers: any[], manualAmountUsd?: number }) => bookingsApi.createManualBooking(data),
    onSuccess: () => {
      toast.success("Manual booking created successfully");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to create manual booking");
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ referenceCode, data }: { referenceCode: string, data: UpdateBookingStatusPayload }) => bookingsApi.updateBookingStatus(referenceCode, data),
    onSuccess: (data, variables) => {
      toast.success("Booking status updated");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", variables.referenceCode] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update booking status");
    },
  });
}

export function useUpsertPassengers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ referenceCode, data }: { referenceCode: string, data: UpsertPassengersPayload }) => bookingsApi.upsertPassengers(referenceCode, data),
    onSuccess: (_, variables) => {
      toast.success("Passengers updated successfully");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", variables.referenceCode] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update passengers");
    },
  });
}

export function useAssignBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ referenceCode, data }: { referenceCode: string, data: AssignBookingPayload }) => bookingsApi.assignBooking(referenceCode, data),
    onSuccess: (_, variables) => {
      toast.success("Booking assignment updated");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", variables.referenceCode] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to assign booking");
    },
  });
}

export function useBulkUpdateBookings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkUpdateBookingsPayload) => bookingsApi.bulkUpdateBookings(data),
    onSuccess: (data) => {
      toast.success(`Updated ${data.count} bookings successfully`);
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to bulk update bookings");
    },
  });
}

export function useSoftDeleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (referenceCode: string) => bookingsApi.softDeleteBooking(referenceCode),
    onSuccess: () => {
      toast.success("Booking deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete booking");
    },
  });
}

export function useRestoreBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (referenceCode: string) => bookingsApi.restoreBooking(referenceCode),
    onSuccess: (data, referenceCode) => {
      toast.success("Booking restored successfully");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", referenceCode] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to restore booking");
    },
  });
}

export function useAddPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ referenceCode, data }: { referenceCode: string, data: any }) => bookingsApi.addPayment(referenceCode, data),
    onSuccess: (_, variables) => {
      toast.success("Payment added successfully");
      queryClient.invalidateQueries({ queryKey: ["bookings", variables.referenceCode] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to add payment");
    },
  });
}

export function useAddNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ referenceCode, data }: { referenceCode: string, data: any }) => bookingsApi.addNote(referenceCode, data),
    onSuccess: (_, variables) => {
      toast.success("Note added successfully");
      queryClient.invalidateQueries({ queryKey: ["bookings", variables.referenceCode] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to add note");
    },
  });
}

export function useAddAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ referenceCode, data }: { referenceCode: string, data: any }) => bookingsApi.addAttachment(referenceCode, data),
    onSuccess: (_, variables) => {
      toast.success("Attachment uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["bookings", variables.referenceCode] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to upload attachment");
    },
  });
}
