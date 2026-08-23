import { apiClient } from "@/lib/axios";
import { HotelItem } from "../types";

export const hotelsApi = {
  getHotels: async (): Promise<HotelItem[]> => {
    try {
      const res: any = await apiClient.get('/admin/cms-blocks/hotels_catalog');
      if (res?.content && Array.isArray(res.content)) return res.content;
      if (res?.data?.content && Array.isArray(res.data.content)) return res.data.content;
      if (res?.data && Array.isArray(res.data)) return res.data;
      if (Array.isArray(res)) return res;
    } catch {
      // Return empty array on error
    }
    return [];
  },

  createHotel: async (hotel: Partial<HotelItem>): Promise<HotelItem> => {
    const current = await hotelsApi.getHotels();
    const newHotel: HotelItem = {
      id: `htl-${Date.now()}`,
      name: hotel.name || 'New Luxury Hotel',
      destination: hotel.destination || 'egypt',
      city: hotel.city || 'Cairo',
      stars: hotel.stars || 5,
      rating: hotel.rating || 5.0,
      pricePerNight: hotel.pricePerNight || 200,
      image: hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      description: hotel.description || '',
      amenities: hotel.amenities || []
    };
    const updated = [newHotel, ...current];
    await apiClient.put('/admin/cms-blocks/hotels_catalog', { content: updated });
    return newHotel;
  },

  updateHotel: async (id: string, hotel: Partial<HotelItem>): Promise<HotelItem> => {
    const current = await hotelsApi.getHotels();
    const updated = current.map(h => h.id === id ? { ...h, ...hotel } : h);
    await apiClient.put('/admin/cms-blocks/hotels_catalog', { content: updated });
    return { ...hotel, id } as HotelItem;
  },

  deleteHotel: async (id: string): Promise<void> => {
    const current = await hotelsApi.getHotels();
    const updated = current.filter(h => h.id !== id);
    await apiClient.put('/admin/cms-blocks/hotels_catalog', { content: updated });
  }
};
