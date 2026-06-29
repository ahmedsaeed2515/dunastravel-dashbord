import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { BookingDetail } from '../types';

export function useBookingDetail(referenceCode: string | undefined) {
  return useQuery({
    queryKey: ['admin-booking', referenceCode],
    queryFn: async () => {
      if (!referenceCode) return null;
      const data = await apiClient.get<any, BookingDetail>(`/admin/bookings/${referenceCode}`);
      return data;
    },
    enabled: !!referenceCode,
  });
}
