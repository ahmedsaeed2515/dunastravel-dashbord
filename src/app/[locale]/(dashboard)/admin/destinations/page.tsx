"use client";

import { useParams } from "next/navigation";
import { MapPin, Package, CalendarCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { Card } from "@/components/ui/card";
import { useDestinationsReport } from "@/features/dashboard/hooks/useReports";

export default function DestinationsPage() {
  const params = useParams();
  const isAr = params?.locale === "ar";
  const query = useDestinationsReport();

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={isAr ? "الوجهات السياحية" : "Tour Destinations"}
        description={isAr ? "الوجهات مستخرجة مباشرة من الرحلات الموجودة في قاعدة البيانات." : "Destinations are derived directly from tours in the database."}
        badge={query.data?.length}
      />

      {query.isError ? (
        <QueryErrorState message={isAr ? "تعذر تحميل الوجهات من الباك إند." : "Destinations could not be loaded from the backend."} onRetry={() => void query.refetch()} />
      ) : query.isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">{isAr ? "جاري تحميل الوجهات..." : "Loading destinations..."}</div>
      ) : !query.data?.length ? (
        <div className="rounded-2xl border bg-card py-16 text-center text-sm text-muted-foreground">{isAr ? "لا توجد وجهات في الرحلات المسجلة." : "No destinations exist in stored tours."}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {query.data.map((destination) => (
            <Card key={`${destination.city ?? ""}|${destination.country ?? ""}`} className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-amber-500/10 p-2.5 text-amber-500"><MapPin className="h-5 w-5" /></span>
                <div>
                  <h2 className="font-bold text-foreground">{destination.location}</h2>
                  <p className="text-xs text-muted-foreground">{destination.country ?? destination.city}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-muted/40 p-3"><Package className="mb-1 h-4 w-4 text-sky-500" /><strong>{destination.tourCount}</strong><p className="text-xs text-muted-foreground">{isAr ? "رحلة" : "Tours"}</p></div>
                <div className="rounded-xl bg-muted/40 p-3"><CalendarCheck className="mb-1 h-4 w-4 text-emerald-500" /><strong>{destination.bookingCount}</strong><p className="text-xs text-muted-foreground">{isAr ? "حجز" : "Bookings"}</p></div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
