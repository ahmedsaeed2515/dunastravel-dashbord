import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { toursApi } from '../api/toursApi';
import type { TransportPricingModel } from '@/types/dunas-suite';

const messageFor = (error: unknown, fallback: string) => {
  const candidate = error as { message?: string } | undefined;
  return candidate?.message || fallback;
};

/**
 * Get transport pricing for a specific tour
 * @param tourSlug - The tour/slug
 */
export function useTourTransportPricing(tourSlug: string) {
  return useQuery({
    queryKey: ['tour-transport-pricing', tourSlug],
    queryFn: () => toursApi.getTourTransportPricing(tourSlug),
    enabled: !!tourSlug,
  });
}

/**
 * Create transport pricing for a tour
 */
export function useCreateTransportPricing(tourSlug?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tourSlug: slug, payload }: { tourSlug?: string; payload: TransportPricingModel }) =>
      toursApi.upsertTourTransportPricing(slug || tourSlug || '', payload),
    onSuccess: () => {
      toast.success('Transport pricing created');
      queryClient.invalidateQueries({ queryKey: ['tour-transport-pricing'] });
    },
    onError: (error) => toast.error(messageFor(error, 'Could not create transport pricing')),
  });
}

/**
 * Update transport pricing for a tour
 */
export function useUpdateTransportPricing(tourSlug?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tourSlug: slug, payload }: { tourSlug?: string; id?: string; payload: Partial<TransportPricingModel> }) => {
      return toursApi.upsertTourTransportPricing(slug || tourSlug || '', payload as any);
    },
    onSuccess: () => {
      toast.success('Transport pricing updated');
      queryClient.invalidateQueries({ queryKey: ['tour-transport-pricing'] });
    },
    onError: (error) => toast.error(messageFor(error, 'Could not update transport pricing')),
  });
}

/**
 * Delete transport pricing entry
 */
export function useDeleteTransportPricing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toursApi.deleteTourTransportPricing(id),
    onSuccess: () => {
      toast.success('Transport pricing deleted');
      queryClient.invalidateQueries({ queryKey: ['tour-transport-pricing'] });
    },
    onError: (error) => toast.error(messageFor(error, 'Could not delete transport pricing')),
  });
}
