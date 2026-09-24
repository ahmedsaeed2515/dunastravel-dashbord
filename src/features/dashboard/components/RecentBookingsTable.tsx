"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { RecentBookingItem } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Eye, Calendar, Users, Compass } from "lucide-react";

interface RecentBookingsTableProps {
  bookings?: RecentBookingItem[];
  isLoading?: boolean;
}

export function RecentBookingsTable({ bookings, isLoading }: RecentBookingsTableProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const isAr = locale === "ar";

  if (isLoading) {
    return (
      <Card className="shadow-sm p-6">
        <CardHeader className="p-0">
          <CardTitle className="text-base">{isAr ? "جاري تحميل الحجوزات الأخيرة..." : "Recent Operations Bookings Loading..."}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const bookingList = bookings ?? [];

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-6">
        <div className="space-y-1">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-primary shrink-0" />
            <span>{isAr ? "أحدث الحجوزات والعمليات" : "Operations Bookings Feed"}</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">{isAr ? "متابعة فورية لأحدث حجوزات العملاء وحالة الدفع" : "Recent customer reservations and payment state"}</p>
        </div>

        <Link href={`/${locale}/admin/bookings`} className="w-full sm:w-auto">
          <Button variant="outline" size="xs" className="w-full sm:w-auto text-xs font-bold shrink-0">{isAr ? "عرض كافة الحجوزات 📋" : "View All Bookings"}</Button>
        </Link>
      </CardHeader>

      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
        {bookingList.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">{isAr ? "لا توجد حجوزات مسجلة حديثاً." : "No recent bookings recorded."}</div>
        ) : (
          <>
            {/* Mobile View: Cards Layout for Small Screens (< 640px) */}
            <div className="space-y-3 block sm:hidden">
              {bookingList.map((b) => (
                <div key={b.id} className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-3 shadow-xs hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                    <Link href={`/${locale}/admin/bookings/${b.referenceCode}`} className="font-mono text-xs font-bold text-primary hover:underline bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                      {b.referenceCode}
                    </Link>
                    <StatusBadge status={b.status} />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-bold text-foreground">{b.customerName}</div>
                    <div className="text-[11px] text-muted-foreground break-all">{b.customerEmail}</div>
                  </div>

                  <div className="text-xs font-medium text-muted-foreground flex items-start gap-1.5 bg-background/60 p-2 rounded-lg border border-border/40">
                    <Compass className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground font-semibold line-clamp-2 leading-relaxed">
                      {b.tourTitleJsonb?.[locale] || b.tourTitleJsonb?.en || b.tourSlug}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs border-t border-border/40 flex-wrap gap-2">
                    <div className="flex items-center gap-3 text-muted-foreground text-[11px] font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
                        {b.arrivalDate ? new Date(b.arrivalDate).toLocaleDateString() : "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-muted-foreground shrink-0" />
                        {b.travelersCount} {isAr ? "مسافر" : "pax"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-foreground text-sm">${b.totalAmountUsd}</span>
                      <Link href={`/${locale}/admin/bookings/${b.referenceCode}`}>
                        <Button size="icon-xs" variant="outline" className="h-8 w-8 rounded-lg shrink-0" title={isAr ? "عرض التفاصيل" : "View Details"}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop & Tablet View: Table with Horizontal Scroll Support */}
            <div className="hidden sm:block w-full overflow-x-auto custom-scrollbar">
              <Table className="min-w-170">
                <TableHeader>
                  <TableRow>
                    <TableHead>{isAr ? "المرجع" : "Reference"}</TableHead>
                    <TableHead>{isAr ? "العميل" : "Customer"}</TableHead>
                    <TableHead>{isAr ? "الرحلة" : "Tour"}</TableHead>
                    <TableHead>{isAr ? "تاريخ السفر" : "Travel Date"}</TableHead>
                    <TableHead>{isAr ? "المسافرون" : "Travelers"}</TableHead>
                    <TableHead>{isAr ? "الإجمالي" : "Total (USD)"}</TableHead>
                    <TableHead>{isAr ? "الحالة" : "Status"}</TableHead>
                    <TableHead className="text-right">{isAr ? "الإجراء" : "Action"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookingList.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        <Link href={`/${locale}/admin/bookings/${b.referenceCode}`} className="hover:underline">
                          {b.referenceCode}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-semibold">{b.customerName}</div>
                        <div className="text-[10px] text-muted-foreground break-all">{b.customerEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium truncate max-w-50">
                          {b.tourTitleJsonb?.[locale] || b.tourTitleJsonb?.en || b.tourSlug}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {b.arrivalDate ? new Date(b.arrivalDate).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-center">{b.travelersCount}</TableCell>
                      <TableCell className="text-xs font-mono font-bold">${b.totalAmountUsd}</TableCell>
                      <TableCell>
                        <StatusBadge status={b.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/${locale}/admin/bookings/${b.referenceCode}`}>
                          <Button size="icon" variant="ghost" className="h-7 w-7" title={isAr ? "عرض تفاصيل الحجز" : "View Booking Details"}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

