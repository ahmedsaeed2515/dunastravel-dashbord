"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { packagesApi } from "../api/packagesApi";
import { TravelPackage } from "../types";
import { toast } from "sonner";

export const PACKAGE_KEYS = {
  all: ["travel_packages"] as const,
};

export function usePackages() {
  return useQuery({
    queryKey: PACKAGE_KEYS.all,
    queryFn: () => packagesApi.getPackages(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreatePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newPkg: Partial<TravelPackage>) => packagesApi.createPackage(newPkg),
    onSuccess: (saved) => {
      queryClient.setQueryData(PACKAGE_KEYS.all, (old: TravelPackage[] | undefined) => {
        return old ? [saved, ...old] : [saved];
      });
      toast.success("تم إضافة الباكدج بنجاح");
    },
    onError: () => {
      toast.error("فشل في إضافة الباكدج");
    }
  });
}

export function useUpdatePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TravelPackage> }) => packagesApi.updatePackage(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(PACKAGE_KEYS.all, (old: TravelPackage[] | undefined) => {
        return old ? old.map(p => p.id === updated.id ? { ...p, ...updated } : p) : [updated];
      });
      toast.success("تم تحديث بيانات الباكدج بنجاح");
    },
    onError: () => {
      toast.error("فشل في تحديث الباكدج");
    }
  });
}

export function useDeletePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => packagesApi.deletePackage(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(PACKAGE_KEYS.all, (old: TravelPackage[] | undefined) => {
        return old ? old.filter(p => p.id !== id) : [];
      });
      toast.success("تم حذف الباكدج بنجاح");
    },
    onError: () => {
      toast.error("فشل في حذف الباكدج");
    }
  });
}
