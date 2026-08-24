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

  if (isLoading || !bookings) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Recent Operations Bookings Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-primary" /> Operations Bookings Feed
          </CardTitle>
          <p className="text-xs text-muted-foreground">Recent customer reservations and payment state</p>
        </div>

        <Link href={`/${locale}/admin/bookings`}>
          <Button variant="outline" size="xs" className="text-xs">View All Bookings</Button>
        </Link>
      </CardHeader>

      <CardContent>
        {bookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">No recent bookings recorded.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Tour</TableHead>
                <TableHead>Travel Date</TableHead>
                <TableHead>Travelers</TableHead>
                <TableHead>Total (USD)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs font-bold text-primary">
                    <Link href={`/${locale}/admin/bookings/${b.referenceCode}`} className="hover:underline">
                      {b.referenceCode}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-semibold">{b.customerName}</div>
                    <div className="text-[10px] text-muted-foreground">{b.customerEmail}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-medium truncate max-w-[200px]">
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
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="View Booking Details">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
