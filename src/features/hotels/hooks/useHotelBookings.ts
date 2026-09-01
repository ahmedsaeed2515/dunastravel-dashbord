"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { hotelBookingsApi } from "../api/hotelBookingsApi";
import { HotelBookingStatus, HotelBookingsQuery } from "../types";

export function useHotelBookings(query?: HotelBookingsQuery) {
  return useQuery({
    queryKey: ["hotel-bookings", query],
    queryFn: () => hotelBookingsApi.list(query),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useUpdateHotelBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      adminNotes,
    }: {
      id: string;
      status: HotelBookingStatus;
      adminNotes?: string;
    }) => hotelBookingsApi.updateStatus(id, status, adminNotes),
    onSuccess: (data) => {
      toast.success(`تم تحديث حالة الحجز ${data.referenceCode} بنجاح ✨`);
      queryClient.invalidateQueries({ queryKey: ["hotel-bookings"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "فشل في تحديث حالة الحجز"
      );
    },
  });
}
