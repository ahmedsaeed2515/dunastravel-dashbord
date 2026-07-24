"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { format } from "date-fns";
import { PlusCircle, BarChart2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
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
          <Link href={adminRoutes.bookings} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <BarChart2 className="mr-1.5 h-4 w-4 text-muted-foreground" />
            View Bookings
          </Link>
          <Link href={adminRoutes.tours} className={buttonVariants({ variant: "gold", size: "sm" })}>
            <PlusCircle className="mr-1.5 h-4 w-4" />
            Manage Tours
          </Link>
        </>
      }
    />
  );
}
