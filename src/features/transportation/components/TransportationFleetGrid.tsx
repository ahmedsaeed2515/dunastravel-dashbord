"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { TransportVehicle } from "../types";
import { useDeleteVehicle } from "../hooks/useTransportation";
import { CreateTransportDialog } from "./CreateTransportDialog";
import { Bus, Users, ShieldCheck, Edit, Trash2, Search, Star, DollarSign, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TransportationFleetGridProps {
  fleet: TransportVehicle[];
  isLoading: boolean;
}

export function TransportationFleetGrid({ fleet, isLoading }: TransportationFleetGridProps) {
  const params = useParams();
  const isAr = params?.locale === "ar";

  const deleteVeh = useDeleteVehicle();
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [vehicleToEdit, setVehicleToEdit] = useState<TransportVehicle | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const filtered = fleet.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === "all" || v.category === selectedCat;
    return matchSearch && matchCat;
  });

  const handleDelete = async (id: string, name: string) => {
    const confirmMsg = isAr
      ? `هل أنت متأكد من حذف مركبة "${name}" من الأسطول؟`
      : `Are you sure you want to delete "${name}" from the fleet?`;
    if (confirm(confirmMsg)) {
      await deleteVeh.mutateAsync(id);
    }
  };

  const handleOpenEdit = (v: TransportVehicle) => {
    setVehicleToEdit(v);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card border border-border/80 rounded-2xl p-4 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={isAr ? "بحث باسم أو فئة المركبة..." : "Search by vehicle name or category..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-xl ps-10 pe-4 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground whitespace-nowrap">{isAr ? "الفئة:" : "Category:"}</span>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-background border border-border rounded-xl px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-purple-500/50 w-full sm:w-auto font-medium cursor-pointer"
          >
            <option value="all">{isAr ? `كل الفئات (${fleet.length})` : `All Categories (${fleet.length})`}</option>
            <option value="bus">{isAr ? "حافلات سياحية (Bus)" : "Tour Coaches (Bus)"}</option>
            <option value="van">{isAr ? "ميني باص فان (Van)" : "Executive Vans (Van)"}</option>
            <option value="luxury_sedan">{isAr ? "سيدان فاخرة (Sedan)" : "Luxury Sedan (Sedan)"}</option>
            <option value="suv">{isAr ? "دفع رباعي سفاري (SUV)" : "Safari 4x4 (SUV)"}</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground text-sm font-medium">
          {isAr ? "جاري تحميل بيانات أسطول Dunas Travel..." : "Loading Dunas Travel luxury fleet..."}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border/80 rounded-2xl p-8 space-y-2">
          <Bus className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">
            {isAr ? "لا توجد مركبات مطابقة" : "No matching vehicles found"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isAr ? "جرب تغيير شروط البحث أو قم بإضافة مركبة جديدة للأسطول." : "Try adjusting your search criteria or add a new fleet vehicle."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div 
              key={item.id}
              className="group bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="h-44 bg-muted relative overflow-hidden bg-slate-900">
                  {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><Bus className="h-10 w-10" /></div>}
                  <div className="absolute top-3 end-3 flex items-center gap-1 bg-slate-950/80 backdrop-blur-sm text-purple-300 border border-purple-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md uppercase font-mono">
                    {item.category}
                  </div>
                  <div className="absolute bottom-3 start-3 flex items-center gap-1 bg-slate-950/80 backdrop-blur-sm text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    <span className="font-mono">{item.rating}</span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <Users size={14} className="text-purple-400" />
                      <span>{isAr ? `${item.seats} مقعد` : `${item.seats} Seats`}</span>
                      <span className="text-border">•</span>
                      <span>{isAr ? `${item.doors} أبواب` : `${item.doors} Doors`}</span>
                    </div>

                    <span className="text-base font-black text-amber-500 font-mono">
                      ${item.pricePerDay} <span className="text-[10px] font-normal text-muted-foreground font-sans">{isAr ? "/ يوم" : "/ day"}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-foreground text-sm leading-snug group-hover:text-purple-400 transition-colors">
                    {item.name}
                  </h3>

                  {/* Features Badges */}
                  {item.features && item.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.features.slice(0, 3).map((f, i) => (
                        <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-secondary/80 text-muted-foreground border border-border/60">
                          {f}
                        </span>
                      ))}
                      {item.features.length > 3 && (
                        <span className="text-[10px] text-muted-foreground self-center font-mono">+{item.features.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3.5 border-t border-border/70 flex items-center justify-between bg-muted/20">
                <span className="text-[10px] font-mono text-muted-foreground">{item.id}</span>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-lg hover:bg-purple-500/10 hover:text-purple-400"
                    onClick={() => handleOpenEdit(item)}
                    title={isAr ? "تعديل المركبة" : "Edit Vehicle"}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                    onClick={() => handleDelete(item.id, item.name)}
                    title={isAr ? "حذف المركبة" : "Delete Vehicle"}
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
      {isEditOpen && vehicleToEdit && (
        <CreateTransportDialog 
          vehicleToEdit={vehicleToEdit} 
          open={isEditOpen} 
          onOpenChange={(op) => {
            setIsEditOpen(op);
            if (!op) setVehicleToEdit(null);
          }} 
        />
      )}
    </div>
  );
}
