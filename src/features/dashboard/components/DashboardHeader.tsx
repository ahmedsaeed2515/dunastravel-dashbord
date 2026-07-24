"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { format } from "date-fns";
import { PlusCircle, CalendarDays, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { Link } from "@/i18n/routing";
import { adminRoutes } from "@/config/admin-routes";

export function DashboardHeader() {
  const { user } = usePermissions();
  const today = new Date();

  return (
    <PageHeader
      title={`Welcome back, ${user?.name?.split(" ")[0] || "Executive"}`}
      badge={user?.role || "ADMIN"}
      badgeVariant="gold"
      description={`System operational center for Dunas Travel tours, bookings, customer inquiries, and financial performance. Today is ${format(today, "EEEE, MMMM do, yyyy")}.`}
      actions={
        <>
          <Button variant="outline" size="sm" asChild>
            <Link href={adminRoutes.bookings}>
              <BarChart2 className="mr-1.5 h-4 w-4 text-muted-foreground" />
              View Bookings
            </Link>
          </Button>
          <Button size="sm" variant="gold" asChild>
            <Link href={adminRoutes.tours}>
              <PlusCircle className="mr-1.5 h-4 w-4" />
              Manage Tours
            </Link>
          </Button>
        </>
      }
    />
  );
}
