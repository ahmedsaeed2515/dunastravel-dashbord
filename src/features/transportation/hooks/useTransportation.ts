"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transportationApi } from "../api/transportationApi";
import { TransportVehicle } from "../types";
import { toast } from "sonner";

export const TRANSPORT_KEYS = {
  all: ["transportation_fleet"] as const,
};

export function useTransportation() {
  return useQuery({
    queryKey: TRANSPORT_KEYS.all,
    queryFn: () => transportationApi.getFleet(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newVeh: Partial<TransportVehicle>) => transportationApi.createVehicle(newVeh),
    onSuccess: (saved) => {
      queryClient.setQueryData(TRANSPORT_KEYS.all, (old: TransportVehicle[] | undefined) => {
        return old ? [saved, ...old] : [saved];
      });
      toast.success("تم إضافة المركبة إلى الأسطول بنجاح");
    },
    onError: () => {
      toast.error("فشل في إضافة المركبة");
    }
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TransportVehicle> }) => transportationApi.updateVehicle(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(TRANSPORT_KEYS.all, (old: TransportVehicle[] | undefined) => {
        return old ? old.map(v => v.id === updated.id ? { ...v, ...updated } : v) : [updated];
      });
      toast.success("تم تحديث بيانات المركبة بنجاح");
    },
    onError: () => {
      toast.error("فشل في تحديث بيانات المركبة");
    }
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transportationApi.deleteVehicle(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(TRANSPORT_KEYS.all, (old: TransportVehicle[] | undefined) => {
        return old ? old.filter(v => v.id !== id) : [];
      });
      toast.success("تم حذف المركبة من الأسطول بنجاح");
    },
    onError: () => {
      toast.error("فشل في حذف المركبة");
    }
  });
}
