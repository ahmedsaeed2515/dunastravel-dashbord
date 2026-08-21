"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useDataContext } from '@/context/DataContext';
import { HotelModel, RoomType, LanguageCode } from '@/types/dunas-suite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Hotel,
  Plus,
  Star,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Wifi,
  Tv,
  Waves,
  Utensils,
  Globe,
  DollarSign,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

export const HotelsManager: React.FC = React.memo(() => {
  const { hotels, destinations, addHotel, updateHotel, deleteHotel } = useDataContext();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [editingHotel, setEditingHotel] = useState<HotelModel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const filteredHotels = useMemo(() => {
    return hotels.filter(h => {
      if (searchQuery && !h.name.toLowerCase().includes(searchQuery.toLowerCase()) && !h.city.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [hotels, searchQuery]);

  const handleOpenNew = useCallback(() => {
    setEditingHotel(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((hotel: HotelModel) => {
    setEditingHotel(hotel);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string, name: string) => {
    if (confirm(`هل أنت تأكد من حذف الفندق "${name}"؟`)) {
      deleteHotel(id);
      toast.success('تم حذف الفندق بنجاح.');
    }
  }, [deleteHotel]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/80 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Hotel className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-foreground">
              إدارة الفنادق والإقامة (Hotels Suite)
            </h2>
            <p className="text-xs text-muted-foreground">
              دليل الفنادق المعتمدة في رحلات Dunas Travel مع المرافق والأسعار والترجمات.
            </p>
          </div>
        </div>

        <Button onClick={handleOpenNew} className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 shadow-sm gap-2">
          <Plus className="w-4 h-4" /> إضافة فندق جديد
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute right-3 top-3 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو المدينة..."
            className="rounded-2xl pe-9 text-xs"
          />
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredHotels.map(hotel => (
          <div
            key={hotel.id}
            className="group rounded-3xl border border-border/80 bg-card hover:border-emerald-500/40 transition-all duration-300 overflow-hidden shadow-xs hover:shadow-md flex flex-col sm:flex-row"
          >
            {/* Image */}
            <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden bg-slate-900">
              <img
                src={hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800'}
                alt={hotel.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 shadow-xs">
                  {hotel.status}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="p-5 sm:w-3/5 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {hotel.city} • {hotel.destination.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-0.5 text-xs text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {hotel.stars} نجوم ({hotel.rating})
                  </span>
                </div>

                <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-emerald-500 transition-colors">
                  {hotel.name}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {hotel.description}
                </p>
              </div>

              {/* Price & Amenities */}
              <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground block">السعر الليلة تبدأ من</span>
                  <span className="font-bold text-emerald-500 text-sm">${hotel.pricePerNight}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button size="icon-sm" variant="ghost" onClick={() => handleOpenEdit(hotel)} className="hover:bg-emerald-500/10 hover:text-emerald-500">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(hotel.id, hotel.name)} className="hover:bg-destructive/10 text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hotel Add/Edit Modal */}
      {isModalOpen && (
        <HotelFormModal
          hotel={editingHotel}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
});

HotelsManager.displayName = 'HotelsManager';

interface HotelFormModalProps {
  hotel: HotelModel | null;
  isOpen: boolean;
  onClose: () => void;
}

const HotelFormModal: React.FC<HotelFormModalProps> = ({ hotel, isOpen, onClose }) => {
  const { destinations, addHotel, updateHotel } = useDataContext();
  const [formData, setFormData] = useState<Partial<HotelModel>>({});

  React.useEffect(() => {
    if (hotel) {
      setFormData(JSON.parse(JSON.stringify(hotel)));
    } else {
      setFormData({
        name: '',
        destination: 'egypt',
        city: 'Cairo',
        stars: 5,
        rating: 4.8,
        pricePerNight: 200,
        status: 'ACTIVE',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800',
        gallery: [],
        description: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        amenities: ['wifi', 'pool', 'restaurant'],
        roomTypes: [{ id: 'r1', name: 'Standard Room', price: 200, mealPlan: 'Bed & Breakfast', maxOccupancy: 2 }],
        policies: { checkIn: '14:00', checkOut: '12:00', cancellation: 'إلغاء مجاني', childPolicy: 'الأطفال مجاناً' },
        translations: { ar: {}, en: {}, es: {}, pt: {}, it: {} },
      });
    }
  }, [hotel, isOpen]);

  const handleSave = () => {
    if (!formData.name || !formData.city) {
      toast.error('يرجى ملء كافة بيانات الفندق الأساسية');
      return;
    }

    const payload: HotelModel = {
      id: formData.id || `hotel-${Date.now()}`,
      name: formData.name,
      destination: formData.destination || 'egypt',
      city: formData.city,
      stars: Number(formData.stars) || 5,
      rating: Number(formData.rating) || 4.8,
      pricePerNight: Number(formData.pricePerNight) || 100,
      status: formData.status || 'ACTIVE',
      image: formData.image || '',
      gallery: formData.gallery || [],
      description: formData.description || '',
      address: formData.address || '',
      mapUrl: formData.mapUrl || '',
      phone: formData.phone || '',
      email: formData.email || '',
      website: formData.website || '',
      amenities: formData.amenities || [],
      roomTypes: formData.roomTypes || [],
      policies: formData.policies || { checkIn: '14:00', checkOut: '12:00', cancellation: '', childPolicy: '' },
      translations: formData.translations || { ar: {}, en: {}, es: {}, pt: {}, it: {} },
    };

    if (hotel) {
      updateHotel(payload);
      toast.success('تم تحديث بيانات الفندق بنجاح!');
    } else {
      addHotel(payload);
      toast.success('تمت إضافة الفندق الجديد بنجاح!');
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border border-border/80 rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-heading">
            {hotel ? 'تعديل بيانات الفندق' : 'إضافة فندق جديد'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            أدخل تفاصيل الفندق، النجوم، الغرف وسياسات الإقامة.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold">اسم الفندق (Hotel Name) *</label>
            <Input
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: فندق ماريوت مينا هاوس"
              className="rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold">الوجهة *</label>
              <select
                value={formData.destination || 'egypt'}
                onChange={e => setFormData({ ...formData, destination: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border bg-background text-xs font-semibold"
              >
                {destinations.map(d => (
                  <option key={d.id} value={d.id}>{d.flag} {d.nameAr}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold">المدينة (City) *</label>
              <Input
                value={formData.city || ''}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder="Cairo, Luxor..."
                className="rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold">عدد النجوم (Stars)</label>
              <Input
                type="number"
                value={formData.stars || 5}
                onChange={e => setFormData({ ...formData, stars: parseInt(e.target.value) })}
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold">السعر المبدئي لليلة ($)</label>
              <Input
                type="number"
                value={formData.pricePerNight || 100}
                onChange={e => setFormData({ ...formData, pricePerNight: parseFloat(e.target.value) })}
                className="rounded-xl text-xs font-bold text-emerald-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold">صورة الفندق الرئيسية (Image URL)</label>
              <Input
                value={formData.image || ''}
                onChange={e => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
                className="rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold">وصف الفندق</label>
            <Textarea
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="اكتب وصفاً للفندق..."
              className="rounded-xl text-xs"
            />
          </div>
        </div>

        <DialogFooter className="border-t border-border/60 pt-4">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs">إلغاء</Button>
          <Button onClick={handleSave} className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-5">
            حفظ الفندق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
