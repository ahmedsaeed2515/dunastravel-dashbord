import { apiClient } from "@/lib/axios";
import { TransportVehicle } from "../types";

export const initialFleetData: TransportVehicle[] = [
  {
    id: "veh-bus-01",
    name: "Mercedes-Benz Tourismo VIP Coach",
    category: "bus",
    seats: 48,
    doors: 2,
    rating: 4.95,
    pricePerDay: 450,
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    features: ["تكييف هوائي كامل", "واي فاي 5G مجاني", "مقاعد جلدية مريحة", "شاشات عرض ترفيهية", "ثلاجة ومشروبات", "سائق محترف متعدد اللغات"]
  },
  {
    id: "veh-van-01",
    name: "Mercedes-Benz Sprinter Executive",
    category: "van",
    seats: 14,
    doors: 2,
    rating: 4.9,
    pricePerDay: 280,
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80",
    features: ["مقاعد VIP قابلة للإمالة", "منافذ شحن USB", "واي فاي مجاني", "عازل صوت ممتاز", "إضاءة محيطية هادئة"]
  },
  {
    id: "veh-sedan-01",
    name: "Mercedes-Benz S-Class Maybach Edition",
    category: "luxury_sedan",
    seats: 4,
    doors: 4,
    rating: 5.0,
    pricePerDay: 350,
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
    features: ["خدمة VIP Chauffeur", "مقاعد مساج وتبريد", "شامبانيا وضيافة فاخرة", "نظام صوتي Burmester"]
  },
  {
    id: "veh-suv-01",
    name: "Toyota Land Cruiser V8 Safari 4x4",
    category: "suv",
    seats: 6,
    doors: 5,
    rating: 4.85,
    pricePerDay: 220,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    features: ["دفع رباعي للصحراء والسفاري", "قفص حماية معزز", "نظام تبريد صحراوي فائق", "جهاز ملاحة GPS واتصال بالأقمار الصناعية"]
  }
];

export const transportationApi = {
  getFleet: async (): Promise<TransportVehicle[]> => {
    try {
      const res = await apiClient.get('/cms/blocks/transportation_fleet');
      if (res.data && Array.isArray(res.data)) return res.data;
      if (res.data?.content && Array.isArray(res.data.content)) return res.data.content;
      if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
    } catch {
      // Fallback
    }
    return initialFleetData;
  },

  createVehicle: async (vehicle: Partial<TransportVehicle>): Promise<TransportVehicle> => {
    const newVeh: TransportVehicle = {
      id: `veh-${Date.now()}`,
      name: vehicle.name || 'New Fleet Vehicle',
      category: vehicle.category || 'bus',
      seats: vehicle.seats || 30,
      doors: vehicle.doors || 2,
      rating: vehicle.rating || 5.0,
      pricePerDay: vehicle.pricePerDay || 200,
      image: vehicle.image || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
      features: vehicle.features || ['تكييف هوائي', 'واي فاي', 'سائق محترف']
    };
    try {
      await apiClient.post('/cms/blocks/transportation_fleet', newVeh);
    } catch {}
    return newVeh;
  },

  updateVehicle: async (id: string, vehicle: Partial<TransportVehicle>): Promise<TransportVehicle> => {
    try {
      await apiClient.put(`/cms/blocks/transportation_fleet/${id}`, vehicle);
    } catch {}
    return { ...vehicle, id } as TransportVehicle;
  },

  deleteVehicle: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/cms/blocks/transportation_fleet/${id}`);
    } catch {}
  }
};
