import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { hotelsApi } from '../api/hotelsApi';
import { HotelPayload, HotelsQuery } from '../types';

const messageFor = (error: unknown, fallback: string) => {
  const candidate = error as { message?: string } | undefined;
  return candidate?.message || fallback;
};

export function useHotels(query: HotelsQuery) {
  return useQuery({ queryKey: ['hotels', query], queryFn: () => hotelsApi.list(query) });
}

export function useCreateHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: HotelPayload) => hotelsApi.create(payload),
    onSuccess: () => { toast.success('Hotel created'); queryClient.invalidateQueries({ queryKey: ['hotels'] }); },
    onError: (error) => toast.error(messageFor(error, 'Could not create hotel')),
  });
}

export function useUpdateHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: HotelPayload }) => hotelsApi.update(id, payload),
    onSuccess: () => { toast.success('Hotel updated'); queryClient.invalidateQueries({ queryKey: ['hotels'] }); },
    onError: (error) => toast.error(messageFor(error, 'Could not update hotel')),
  });
}

export function useDeleteHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hotelsApi.remove(id),
    onSuccess: () => {
      toast.success('Hotel deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
    onError: (error) => toast.error(messageFor(error, 'Could not delete hotel')),
  });
}

export function useHotelLifecycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'publish' | 'unpublish' | 'archive' | 'unarchive' | 'restore' }) =>
      hotelsApi[action](id),
    onMutate: async ({ id, action }) => {
      await queryClient.cancelQueries({ queryKey: ['hotels'] });
      queryClient.setQueriesData({ queryKey: ['hotels'] }, (old: any) => {
        if (!old) return old;
        const updateItem = (item: any) => {
          if (item.id !== id) return item;
          if (action === 'publish' || action === 'unarchive' || action === 'restore') {
            return { ...item, status: 'PUBLISHED', isActive: true };
          }
          if (action === 'archive') {
            return { ...item, status: 'ARCHIVED', isActive: false };
          }
          if (action === 'unpublish') {
            return { ...item, status: 'DRAFT', isActive: false };
          }
          return item;
        };

        if (Array.isArray(old)) return old.map(updateItem);
        if (Array.isArray(old.data)) return { ...old, data: old.data.map(updateItem) };
        if (Array.isArray(old.items)) return { ...old, items: old.items.map(updateItem) };
        return old;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
    onError: (error) => toast.error(messageFor(error, 'Could not update hotel lifecycle')),
  });
}
