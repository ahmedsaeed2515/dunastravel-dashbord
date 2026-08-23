"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { RecentBookingItem } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Eye, ArrowUpRight, ChevronRight, ChevronLeft } from "lucide-react";
import { adminRoutes } from "@/config/admin-routes";

interface RecentBookingsTableProps {
  bookings?: RecentBookingItem[];
  isLoading?: boolean;
}

export function RecentBookingsTable({ bookings, isLoading }: RecentBookingsTableProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";
  const t = useTranslations("dashboard");

  if (isLoading || !bookings) {
    return (
      <Card className="shadow-xs border border-border/80 rounded-2xl bg-card p-6">
        <div className="h-5 w-48 bg-muted rounded-md mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-muted/60 rounded-xl animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  const getTourTitle = (b: RecentBookingItem) => {
    if (!b.tourTitleJsonb) return b.tourSlug;
    if (typeof b.tourTitleJsonb === "string") return b.tourTitleJsonb;
    return b.tourTitleJsonb[locale] || b.tourTitleJsonb["en"] || b.tourTitleJsonb["ar"] || b.tourSlug;
  };

  const formatCurrency = (val: string | number) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(val || 0));

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "—";
      return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(d);
    } catch {
      return "—";
    }
  };

  return (
    <Card className="shadow-xs border border-border/80 rounded-2xl bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3 px-5 sm:px-6 pt-5">
        <div>
          <CardTitle className="text-base font-extrabold flex items-center gap-2 text-foreground">
            <CalendarCheck className="w-4 h-4 text-amber-500 stroke-[2.2]" /> 
            {t("recentBookings")}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("recentBookingsSubtitle")}
          </p>
        </div>

        <Link href={adminRoutes.bookings}>
          <Button variant="outline" size="sm" className="text-xs font-bold border-border hover:border-amber-500/40 gap-1">
            <span>{t("viewAllBookings")}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="px-3 sm:px-6 pb-5">
        {bookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground font-medium">
            {t("recentBookingsDescription")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60">
                  <TableHead className="text-xs font-bold">{t("reference")}</TableHead>
                  <TableHead className="text-xs font-bold">{t("customer")}</TableHead>
                  <TableHead className="text-xs font-bold">{t("tour")}</TableHead>
                  <TableHead className="text-xs font-bold">{t("travelDate")}</TableHead>
                  <TableHead className="text-xs font-bold text-center">{t("travelers")}</TableHead>
                  <TableHead className="text-xs font-bold">{t("amount")}</TableHead>
                  <TableHead className="text-xs font-bold">{t("status")}</TableHead>
                  <TableHead className="text-xs font-bold text-end">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id} className="border-border/40 hover:bg-muted/30 transition-colors group">
                    <TableCell className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                      <Link href={`${adminRoutes.bookings}/${b.referenceCode}`} className="hover:underline">
                        {b.referenceCode}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-bold text-foreground">{b.customerName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[150px]">{b.customerEmail}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-foreground truncate max-w-[200px]" title={getTourTitle(b)}>
                        {getTourTitle(b)}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {formatDate(b.arrivalDate)}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-center font-mono">{b.travelersCount}</TableCell>
                    <TableCell className="text-xs font-mono font-black text-foreground whitespace-nowrap">
                      {formatCurrency(b.totalAmountUsd)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                    <TableCell className="text-end">
                      <Link href={`${adminRoutes.bookings}/${b.referenceCode}`}>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 cursor-pointer" title={t("viewDetails")}>
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
