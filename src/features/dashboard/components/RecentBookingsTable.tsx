"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { RecentBookingItem } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Eye } from "lucide-react";

interface RecentBookingsTableProps {
  bookings?: RecentBookingItem[];
  isLoading?: boolean;
}

export function RecentBookingsTable({ bookings, isLoading }: RecentBookingsTableProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";

  if (isLoading || !bookings) {
    return (
      <Card className="shadow-xs border border-border/80 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">{isAr ? "جاري تحميل الحجوزات..." : "Recent Operations Bookings Loading..."}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const getTourTitle = (b: RecentBookingItem) => {
    if (!b.tourTitleJsonb) return b.tourSlug;
    if (typeof b.tourTitleJsonb === "string") return b.tourTitleJsonb;
    return b.tourTitleJsonb[locale] || b.tourTitleJsonb["ar"] || b.tourTitleJsonb["en"] || b.tourSlug;
  };

  return (
    <Card className="shadow-xs border border-border/80 rounded-2xl bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <CalendarCheck className="w-4 h-4 text-amber-500" /> 
            {isAr ? "أحدث الحجوزات والعمليات" : "Operations Bookings Feed"}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAr ? "سجل الحجوزات الواردة وحالة الدفع للعملاء" : "Recent customer reservations and payment state"}
          </p>
        </div>

        <Link href={`/${locale}/admin/bookings`}>
          <Button variant="outline" size="sm" className="text-xs font-bold border-border hover:border-amber-500/40">
            {isAr ? "عرض كل الحجوزات ←" : "View All Bookings →"}
          </Button>
        </Link>
      </CardHeader>

      <CardContent>
        {bookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground font-medium">
            {isAr ? "لا توجد حجوزات مسجلة مؤخراً." : "No recent bookings recorded."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60">
                  <TableHead className="text-xs font-bold">{isAr ? "رقم المرجع" : "Reference"}</TableHead>
                  <TableHead className="text-xs font-bold">{isAr ? "العميل" : "Customer"}</TableHead>
                  <TableHead className="text-xs font-bold">{isAr ? "الرحلة" : "Tour"}</TableHead>
                  <TableHead className="text-xs font-bold">{isAr ? "تاريخ الوصول" : "Travel Date"}</TableHead>
                  <TableHead className="text-xs font-bold text-center">{isAr ? "المسافرين" : "Travelers"}</TableHead>
                  <TableHead className="text-xs font-bold">{isAr ? "المبلغ (USD)" : "Total (USD)"}</TableHead>
                  <TableHead className="text-xs font-bold">{isAr ? "الحالة" : "Status"}</TableHead>
                  <TableHead className="text-xs font-bold text-end">{isAr ? "التفاصيل" : "Action"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id} className="border-border/40 hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                      <Link href={`/${locale}/admin/bookings/${b.referenceCode}`} className="hover:underline">
                        {b.referenceCode}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-bold text-foreground">{b.customerName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{b.customerEmail}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-foreground truncate max-w-[220px]" title={getTourTitle(b)}>
                        {getTourTitle(b)}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {b.arrivalDate ? new Date(b.arrivalDate).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') : "—"}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-center font-mono">{b.travelersCount}</TableCell>
                    <TableCell className="text-xs font-mono font-black text-foreground">${Number(b.totalAmountUsd || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                    <TableCell className="text-end">
                      <Link href={`/${locale}/admin/bookings/${b.referenceCode}`}>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-amber-500" title={isAr ? "عرض التفاصيل" : "View Booking Details"}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
