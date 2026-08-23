"use client";

import { useState } from "react";
import { HotelItem } from "../types";
import { useDeleteHotel } from "../hooks/useHotels";
import { CreateHotelDialog } from "./CreateHotelDialog";
import { Star, MapPin, Edit, Trash2, Hotel, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HotelsGridProps {
  hotels: HotelItem[];
  isLoading: boolean;
}

export function HotelsGrid({ hotels, isLoading }: HotelsGridProps) {
  const deleteHotel = useDeleteHotel();
  const [search, setSearch] = useState("");
  const [selectedDest, setSelectedDest] = useState("all");
  const [hotelToEdit, setHotelToEdit] = useState<HotelItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const destinations = Array.from(new Set(hotels.map((hotel) => hotel.destination).filter(Boolean))).sort();

  const filtered = hotels.filter(h => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) || 
                        h.city.toLowerCase().includes(search.toLowerCase());
    const matchDest = selectedDest === "all" || h.destination === selectedDest;
    return matchSearch && matchDest;
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف فندق "${name}"؟`)) {
      await deleteHotel.mutateAsync(id);
    }
  };

  const handleOpenEdit = (h: HotelItem) => {
    setHotelToEdit(h);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card border border-border/80 rounded-2xl p-4 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث باسم الفندق أو المدينة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pr-10 pl-4 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground whitespace-nowrap">الوجهة:</span>
          <select
            value={selectedDest}
            onChange={(e) => setSelectedDest(e.target.value)}
            className="bg-background border border-border rounded-xl px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-amber-500/50 w-full sm:w-auto font-medium"
          >
            <option value="all">كل الوجهات ({hotels.length})</option>
            {destinations.map((destination) => (
              <option key={destination} value={destination}>{destination}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Cards */}
      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          جاري تحميل بيانات الفنادق المعتمدة...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border rounded-2xl p-8">
          <Hotel className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">لا توجد فنادق مطابقة</h3>
          <p className="text-xs text-muted-foreground mt-1">جرب تغيير شروط البحث أو قم بإضافة فندق جديد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((hotel) => (
            <div 
              key={hotel.id}
              className="group bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="h-44 bg-muted relative overflow-hidden">
                  {hotel.image ? <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><Hotel className="h-10 w-10" /></div>}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md">
                    <Star size={11} className="fill-slate-950" />
                    <span>{hotel.stars} نجوم</span>
                  </div>
                  <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-950/80 text-amber-400 border border-amber-500/30 backdrop-blur-sm uppercase">
                    {hotel.destination}
                  </span>
                </div>

                <div className="p-4 space-y-2.5">
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                    <MapPin size={13} />
                    <span>{hotel.city}, {hotel.destination}</span>
                  </div>

                  <h3 className="font-bold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">
                    {hotel.name}
                  </h3>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xs text-muted-foreground">سعر الليلة من</span>
                    <span className="text-base font-black text-amber-500">${hotel.pricePerNight} <span className="text-[10px] font-normal text-muted-foreground">USD</span></span>
                  </div>

                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {hotel.description}
                  </p>
                </div>
              </div>

              <div className="p-3.5 border-t border-border/70 flex items-center justify-between bg-muted/20">
                <span className="text-[10px] font-mono text-muted-foreground">{hotel.id}</span>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-lg hover:bg-amber-500/10 hover:text-amber-500"
                    onClick={() => handleOpenEdit(hotel)}
                    title="تعديل"
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                    onClick={() => handleDelete(hotel.id, hotel.name)}
                    title="حذف"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {isEditOpen && hotelToEdit && (
        <CreateHotelDialog 
          hotelToEdit={hotelToEdit} 
          open={isEditOpen} 
          onOpenChange={(op) => {
            setIsEditOpen(op);
            if (!op) setHotelToEdit(null);
          }} 
        />
      )}
    </div>
  );
}
