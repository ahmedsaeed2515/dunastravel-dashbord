import { apiClient } from "@/lib/axios";
import { HotelItem } from "../types";

export const initialHotelsData: HotelItem[] = [
  {
    id: "htl-eg-01",
    name: "Four Seasons Hotel Cairo at Nile Plaza",
    destination: "egypt",
    city: "Cairo",
    stars: 5,
    rating: 4.9,
    pricePerNight: 350,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    description: "إطلالة بانورامية ساحرة على نهر النيل وقلب القاهرة التاريخية مع خدمات كونسيرج فاخرة على مدار الساعة.",
    amenities: ["Spa & Wellness", "Nile View", "Fine Dining", "Infinity Pool"]
  },
  {
    id: "htl-eg-02",
    name: "Sofitel Legend Old Cataract Aswan",
    destination: "egypt",
    city: "Aswan",
    stars: 5,
    rating: 4.95,
    pricePerNight: 420,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
    description: "قصر تاريخي فخم على ضفاف النيل بأسوان استضاف أشهر ملوك العالم وأجاثا كريستي.",
    amenities: ["Historic Palace", "Royal Suite", "Sunset Terrace", "Luxury Spa"]
  },
  {
    id: "htl-tr-01",
    name: "Ciragan Palace Kempinski Istanbul",
    destination: "turkey",
    city: "Istanbul",
    stars: 5,
    rating: 4.9,
    pricePerNight: 500,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    description: "القصر العثماني الوحيد على مضيق البوسفور الذي يقدم تجربة إقامة ملكية استثنائية.",
    amenities: ["Bosphorus View", "Ottoman Cuisine", "Helipad", "Heated Pool"]
  },
  {
    id: "htl-jo-01",
    name: "Kempinski Hotel Ishtar Dead Sea",
    destination: "jordan",
    city: "Dead Sea",
    stars: 5,
    rating: 4.85,
    pricePerNight: 280,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
    description: "ملاذ استرخاء فاخر على شاطئ البحر الميت محاط بحدائق معلقة وبحيرات سباحة خاصة.",
    amenities: ["Private Beach", "Dead Sea Mud Spa", "9 Pools", "Fine Dining"]
  }
];

export const hotelsApi = {
  getHotels: async (): Promise<HotelItem[]> => {
    try {
      const res = await apiClient.get('/cms/blocks/hotels_catalog');
      if (res.data && Array.isArray(res.data)) return res.data;
      if (res.data?.content && Array.isArray(res.data.content)) return res.data.content;
      if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
    } catch {
      // Fallback
    }
    return initialHotelsData;
  },

  createHotel: async (hotel: Partial<HotelItem>): Promise<HotelItem> => {
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
    try {
      await apiClient.post('/cms/blocks/hotels_catalog', newHotel);
    } catch {}
    return newHotel;
  },

  updateHotel: async (id: string, hotel: Partial<HotelItem>): Promise<HotelItem> => {
    try {
      await apiClient.put(`/cms/blocks/hotels_catalog/${id}`, hotel);
    } catch {}
    return { ...hotel, id } as HotelItem;
  },

  deleteHotel: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/cms/blocks/hotels_catalog/${id}`);
    } catch {}
  }
};
