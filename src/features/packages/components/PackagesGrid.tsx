"use client";

import { useState } from "react";
import { TravelPackage } from "../types";
import { useDeletePackage } from "../hooks/usePackages";
import { CreatePackageDialog } from "./CreatePackageDialog";
import { Package as PackageIcon, Calendar, DollarSign, Edit, Trash2, Search, Flame, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PackagesGridProps {
  packages: TravelPackage[];
  isLoading: boolean;
}

export function PackagesGrid({ packages, isLoading }: PackagesGridProps) {
  const deletePkg = useDeletePackage();
  const [search, setSearch] = useState("");
  const [packageToEdit, setPackageToEdit] = useState<TravelPackage | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const filtered = packages.filter(p => {
    return p.title.toLowerCase().includes(search.toLowerCase()) || 
           p.destination.toLowerCase().includes(search.toLowerCase());
  });

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`هل أنت متأكد من حذف باكدج "${title}"؟`)) {
      await deletePkg.mutateAsync(id);
    }
  };

  const handleOpenEdit = (p: TravelPackage) => {
    setPackageToEdit(p);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-card border border-border/80 rounded-2xl p-4 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث باسم الباكدج أو الوجهة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pr-10 pl-4 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          جاري تحميل باكدجات Dunas Travel...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border rounded-2xl p-8">
          <PackageIcon className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">لا توجد باكدجات مطابقة</h3>
          <p className="text-xs text-muted-foreground mt-1">جرب تغيير شروط البحث أو قم بإضافة باكدج سياحي جديد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div 
              key={item.id}
              className="group bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="h-48 bg-muted relative overflow-hidden">
                  <img 
                    src={item.image || 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80'} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-950/80 backdrop-blur-sm text-blue-300 border border-blue-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md">
                    <MapPin size={10} />
                    <span>{item.destination}</span>
                  </div>
                  {item.popular && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-red-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                      <Flame size={11} />
                      <span>الأكثر طلباً 🔥</span>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                      <Calendar size={13} className="text-blue-400" />
                      <span>{item.duration}</span>
                    </div>

                    <span className="text-base font-black text-amber-500">
                      ${item.price}
                    </span>
                  </div>

                  <h3 className="font-bold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3.5 border-t border-border/70 flex items-center justify-between bg-muted/20">
                <span className="text-[10px] font-mono text-muted-foreground">{item.id}</span>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-lg hover:bg-blue-500/10 hover:text-blue-400"
                    onClick={() => handleOpenEdit(item)}
                    title="تعديل"
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                    onClick={() => handleDelete(item.id, item.title)}
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
      {isEditOpen && packageToEdit && (
        <CreatePackageDialog 
          packageToEdit={packageToEdit} 
          open={isEditOpen} 
          onOpenChange={(op) => {
            setIsEditOpen(op);
            if (!op) setPackageToEdit(null);
          }} 
        />
      )}
    </div>
  );
}
