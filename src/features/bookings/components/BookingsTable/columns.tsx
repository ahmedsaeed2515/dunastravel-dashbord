"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BookingRowActions } from './BookingRowActions';
import { Booking } from "../../types";
import { StatusBadge } from "@/components/shared/ui/StatusBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { User, Calendar, Users } from "lucide-react";

const getLangFlag = (lang?: string | null) => {
  switch ((lang || "").toLowerCase()) {
    case "es": return "🇪🇸";
    case "pt": return "🇧🇷";
    case "it": return "🇮🇹";
    case "en": return "🇬🇧";
    case "ar": return "🇪🇬";
    default: return "🌐";
  }
};

const formatDateSafe = (dateStr?: string | Date | null, fmt = "MMM do, yyyy") => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return format(d, fmt);
  } catch {
    return "—";
  }
};

export function getColumns(
  onView: (booking: Booking) => void,
  onEdit: (booking: Booking) => void,
  onDelete: (booking: Booking) => void,
  tBookings: (key: string) => string,
  tCommon: (key: string) => string
): ColumnDef<Booking>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "referenceCode",
      header: tBookings("bookingId"),
      cell: ({ row }) => {
        const b = row.original;
        const flag = getLangFlag(b.language);
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-medium dir-ltr">
              <span title={`Language: ${b.language || 'en'}`} className="text-sm">{flag}</span>
              <button
                type="button"
                onClick={() => onView(b)}
                className="font-semibold text-primary hover:underline cursor-pointer text-start"
                title="View booking details"
              >
                {b.referenceCode}
              </button>
            </div>
            {b.bookingType && b.bookingType !== "BOOKING" && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 w-fit">
                {b.bookingType}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "customer",
      header: tBookings("customer"),
      cell: ({ row }) => {
        const b = row.original;
        const name = b.billingInfo?.fullName || b.user?.name || "—";
        const email = b.billingInfo?.email || b.user?.email;
        const location = [b.billingInfo?.city, b.billingInfo?.country].filter(Boolean).join(", ");
        return (
          <div className="flex flex-col gap-0.5 max-w-[180px]">
            <div className="font-medium text-foreground flex items-center gap-1 truncate" title={name}>
              <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{name}</span>
            </div>
            {location && (
              <span className="text-xs text-muted-foreground truncate" title={location}>
                📍 {location}
              </span>
            )}
            {email && (
              <span className="text-[11px] text-muted-foreground/80 truncate dir-ltr" title={email}>
                {email}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "tourSlug",
      header: tBookings("tour"),
      cell: ({ row }) => {
        const b = row.original;
        const tourTitle = b.tourNameEn || b.tourSlug || "—";
        return (
          <div className="flex flex-col gap-1 max-w-[220px]">
            <div className="font-medium text-foreground truncate" title={tourTitle}>
              {tourTitle}
            </div>
            {b.transportChoice && (
              <div className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium w-fit">
                <span>{b.transportChoice.toLowerCase().includes("train") ? "🚄" : "🚌"}</span>
                <span>{b.transportChoice.toLowerCase().includes("train") ? "High-Speed Rail" : "Coach"}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "travelDates",
      header: tBookings("travelDate"),
      cell: ({ row }) => {
        const b = row.original;
        const paxCount = b.passengerCount || (Number(b.adults || 1) + Number(b.children || 0) + Number(b.infants || 0));
        return (
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span>{formatDateSafe(b.arrivalDate)}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-3 h-3 shrink-0" />
              <span>{paxCount} {tBookings("guests")}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: tCommon("status"),
      cell: ({ row }) => {
        const b = row.original;
        const status = b.status || "PENDING";
        return (
          <div className="flex flex-col gap-1">
            <StatusBadge status={status} />
            {b.invoiceNumber && (
              <span className="text-[10px] text-muted-foreground font-mono dir-ltr truncate">
                #{b.invoiceNumber}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "totalAmount",
      header: tCommon("amount"),
      cell: ({ row }) => {
        const b = row.original;
        const rawAmount = b.totalAmount;
        const amount = typeof rawAmount === "number" ? rawAmount : parseFloat(String(rawAmount || "0"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: b.currency || "USD",
        }).format(isNaN(amount) ? 0 : amount);
        const paidNum = b.paidAmount ? parseFloat(String(b.paidAmount)) : 0;
        const totalNum = isNaN(amount) ? 0 : amount;
        const balanceDue = Math.max(0, totalNum - paidNum);
        return (
          <div className="flex flex-col gap-0.5">
            {totalNum > 0 ? (
              <span className="font-semibold text-foreground dir-ltr inline-block">{formatted}</span>
            ) : (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 w-fit">
                On Request
              </span>
            )}
            {paidNum > 0 && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium dir-ltr">
                Paid: {new Intl.NumberFormat("en-US", { style: "currency", currency: b.currency || "USD" }).format(paidNum)}
              </span>
            )}
            {balanceDue > 0 && paidNum > 0 && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium dir-ltr">
                Due: {new Intl.NumberFormat("en-US", { style: "currency", currency: b.currency || "USD" }).format(balanceDue)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: tCommon("createdAt"),
      cell: ({ row }) => {
        const val = row.getValue("createdAt");
        return <div className="text-xs text-muted-foreground whitespace-nowrap">{formatDateSafe(val as string)}</div>;
      },
      meta: { className: "hidden xl:table-cell" }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <BookingRowActions
            booking={row.original}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      },
    },
  ];
}

