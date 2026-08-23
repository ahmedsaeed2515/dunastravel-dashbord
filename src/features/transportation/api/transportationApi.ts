import { apiClient } from "@/lib/axios";
import { TransportVehicle } from "../types";

export const transportationApi = {
  getFleet: async (): Promise<TransportVehicle[]> => {
    try {
      const res: any = await apiClient.get('/admin/cms-blocks/transportation_fleet');
      if (res?.content && Array.isArray(res.content)) return res.content;
      if (res?.data?.content && Array.isArray(res.data.content)) return res.data.content;
      if (res?.data && Array.isArray(res.data)) return res.data;
      if (Array.isArray(res)) return res;
    } catch {
      // Return empty array on error
    }
    return [];
  },

  createVehicle: async (vehicle: Partial<TransportVehicle>): Promise<TransportVehicle> => {
    const current = await transportationApi.getFleet();
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
    const updated = [newVeh, ...current];
    await apiClient.put('/admin/cms-blocks/transportation_fleet', { content: updated });
    return newVeh;
  },

  updateVehicle: async (id: string, vehicle: Partial<TransportVehicle>): Promise<TransportVehicle> => {
    const current = await transportationApi.getFleet();
    const updated = current.map(v => v.id === id ? { ...v, ...vehicle } : v);
    await apiClient.put('/admin/cms-blocks/transportation_fleet', { content: updated });
    return { ...vehicle, id } as TransportVehicle;
  },

  deleteVehicle: async (id: string): Promise<void> => {
    const current = await transportationApi.getFleet();
    const updated = current.filter(v => v.id !== id);
    await apiClient.put('/admin/cms-blocks/transportation_fleet', { content: updated });
  }
};
