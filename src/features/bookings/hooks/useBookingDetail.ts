import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { BookingDetail } from '../types';

export function useBookingDetail(referenceCode: string | undefined) {
  return useQuery({
    queryKey: ['admin-booking', referenceCode],
    queryFn: async () => {
      if (!referenceCode) return null;
      return apiClient.get<unknown, BookingDetail>(`/admin/bookings/${referenceCode}`);
    },
    enabled: !!referenceCode,
  });
}
