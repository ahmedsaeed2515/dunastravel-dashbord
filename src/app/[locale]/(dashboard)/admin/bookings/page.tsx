import { Suspense } from "react";
import { BookingsTable } from "@/features/bookings/components/BookingsTable/BookingsTable";
import { TableSkeleton } from "@/components/shared/ui/Skeletons";
import { CreateBookingDrawer } from "@/features/bookings/components/Drawers/CreateBookingDrawer";
import { RequirePermission } from "@/components/shared/auth/RequirePermission";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata = {
  title: "Bookings Management - Dunas Travel Admin",
};

export default function BookingsPage() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title="Bookings Management"
        description="Monitor, update, and manage traveler reservations, payment statuses, passenger details, and itinerary schedules."
        actions={
          <RequirePermission action="manage" resource="bookings">
            <CreateBookingDrawer />
          </RequirePermission>
        }
      />

      <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
        <Suspense fallback={<TableSkeleton />}>
          <BookingsTable />
        </Suspense>
      </div>
    </div>
  );
}
