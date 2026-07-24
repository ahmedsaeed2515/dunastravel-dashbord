"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { format } from "date-fns";
import { PlusCircle, BarChart2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { Link } from "@/i18n/routing";
import { adminRoutes } from "@/config/admin-routes";
import { useTranslations } from "next-intl";

export function DashboardHeader() {
  const { user } = usePermissions();
  const today = new Date();
  const tDashboard = useTranslations("dashboard");

  return (
    <PageHeader
      title={tDashboard("welcomeUser", { name: user?.name?.split(" ")[0] || "Executive" })}
      badge={user?.role || "ADMIN"}
      badgeVariant="gold"
      description={tDashboard("systemOperationalCenter", { date: format(today, "EEEE, MMMM do, yyyy") })}
      actions={
        <>
          <Link href={adminRoutes.bookings} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <BarChart2 className="me-1.5 h-4 w-4 text-muted-foreground" />
            {tDashboard("viewBookings")}
          </Link>
          <Link href={adminRoutes.tours} className={buttonVariants({ variant: "gold", size: "sm" })}>
            <PlusCircle className="me-1.5 h-4 w-4" />
            {tDashboard("manageTours")}
          </Link>
        </>
      }
    />
  );
}
