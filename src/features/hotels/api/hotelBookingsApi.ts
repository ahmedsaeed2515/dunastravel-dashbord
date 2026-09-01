import { apiClient } from '@/lib/axios';
import { HotelBooking, HotelBookingsQuery, PaginatedHotelBookings, HotelBookingStatus } from '../types';

export const hotelBookingsApi = {
  list: (query?: HotelBookingsQuery): Promise<PaginatedHotelBookings> =>
    apiClient.get<PaginatedHotelBookings, PaginatedHotelBookings>('/admin/hotels/bookings', { params: query }),
  updateStatus: (id: string, status: HotelBookingStatus, adminNotes?: string): Promise<HotelBooking> =>
    apiClient.patch<HotelBooking, HotelBooking>(`/admin/hotels/bookings/${id}/status`, { status, adminNotes }),
};
