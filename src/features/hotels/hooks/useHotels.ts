"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hotelsApi } from "../api/hotelsApi";
import { HotelItem } from "../types";
import { toast } from "sonner";

export const HOTEL_KEYS = {
  all: ["hotels"] as const,
};

export function useHotels() {
  return useQuery({
    queryKey: HOTEL_KEYS.all,
    queryFn: () => hotelsApi.getHotels(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newHotel: Partial<HotelItem>) => hotelsApi.createHotel(newHotel),
    onSuccess: (saved) => {
      queryClient.setQueryData(HOTEL_KEYS.all, (old: HotelItem[] | undefined) => {
        return old ? [saved, ...old] : [saved];
      });
      toast.success("تم إضافة الفندق بنجاح");
    },
    onError: () => {
      toast.error("فشل في إضافة الفندق");
    }
  });
}

export function useUpdateHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<HotelItem> }) => hotelsApi.updateHotel(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(HOTEL_KEYS.all, (old: HotelItem[] | undefined) => {
        return old ? old.map(h => h.id === updated.id ? { ...h, ...updated } : h) : [updated];
      });
      toast.success("تم تحديث بيانات الفندق بنجاح");
    },
    onError: () => {
      toast.error("فشل في تحديث بيانات الفندق");
    }
  });
}

export function useDeleteHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hotelsApi.deleteHotel(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(HOTEL_KEYS.all, (old: HotelItem[] | undefined) => {
        return old ? old.filter(h => h.id !== id) : [];
      });
      toast.success("تم حذف الفندق بنجاح");
    },
    onError: () => {
      toast.error("فشل في حذف الفندق");
    }
  });
}
