import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingsApi } from "../api/bookingsApi";
import {
  BookingQueryFilters,
  UpdateBookingPayload,
  UpdateBookingStatusPayload,
  UpsertPassengersPayload,
  AssignBookingPayload,
  BulkUpdateBookingsPayload,
} from "../types";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-types";

export function useBookings(filters: BookingQueryFilters) {
  return useQuery({
    queryKey: queryKeys.bookings.list(filters as Record<string, unknown>),
    queryFn: () => bookingsApi.getBookings(filters),
    refetchInterval: 30000,
  });
}

export function useBooking(referenceCode: string) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(referenceCode),
    queryFn: () => bookingsApi.getBookingByReferenceCode(referenceCode),
    enabled: Boolean(referenceCode),
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ referenceCode, data }: { referenceCode: string; data: UpdateBookingPayload }) =>
      bookingsApi.updateBooking(referenceCode, data),
    onSuccess: (_, variables) => {
      toast.success("Booking updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.referenceCode) });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to update booking");
    },
  });
}

export function useCreateManualBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      tourId: string;
      userId: string;
      passengers: unknown[];
      manualAmountUsd?: number;
    }) => bookingsApi.createManualBooking(data),
    onSuccess: () => {
      toast.success("Manual booking created successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to create manual booking");
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      referenceCode,
      data,
    }: {
      referenceCode: string;
      data: UpdateBookingStatusPayload;
    }) => bookingsApi.updateBookingStatus(referenceCode, data),
    onSuccess: (_, variables) => {
      toast.success("Booking status updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.referenceCode) });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to update booking status");
    },
  });
}

export function useUpsertPassengers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      referenceCode,
      data,
    }: {
      referenceCode: string;
      data: UpsertPassengersPayload;
    }) => bookingsApi.upsertPassengers(referenceCode, data),
    onSuccess: (_, variables) => {
      toast.success("Passengers updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.referenceCode) });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to update passengers");
    },
  });
}

export function useAssignBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      referenceCode,
      data,
    }: {
      referenceCode: string;
      data: AssignBookingPayload;
    }) => bookingsApi.assignBooking(referenceCode, data),
    onSuccess: (_, variables) => {
      toast.success("Booking assignment updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.referenceCode) });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to assign booking");
    },
  });
}

export function useBulkUpdateBookings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkUpdateBookingsPayload) => bookingsApi.bulkUpdateBookings(data),
    onSuccess: (data) => {
      toast.success(`Updated ${data.count} bookings successfully`);
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to bulk update bookings");
    },
  });
}

export function useSoftDeleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (referenceCode: string) => bookingsApi.softDeleteBooking(referenceCode),
    onSuccess: () => {
      toast.success("Booking deleted successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to delete booking");
    },
  });
}

export function useRestoreBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (referenceCode: string) => bookingsApi.restoreBooking(referenceCode),
    onSuccess: (_, referenceCode) => {
      toast.success("Booking restored successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(referenceCode) });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to restore booking");
    },
  });
}

export function useAddPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ referenceCode, data }: { referenceCode: string; data: unknown }) =>
      bookingsApi.addPayment(referenceCode, data),
    onSuccess: (_, variables) => {
      toast.success("Payment added successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.referenceCode) });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to add payment");
    },
  });
}

export function useAddNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ referenceCode, data }: { referenceCode: string; data: unknown }) =>
      bookingsApi.addNote(referenceCode, data),
    onSuccess: (_, variables) => {
      toast.success("Note added successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.referenceCode) });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to add note");
    },
  });
}

export function useAddAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ referenceCode, data }: { referenceCode: string; data: { file: File; documentType?: string } }) =>
      bookingsApi.addAttachment(referenceCode, data),
    onSuccess: (_, variables) => {
      toast.success("Attachment uploaded successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.referenceCode) });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to upload attachment");
    },
  });
}
