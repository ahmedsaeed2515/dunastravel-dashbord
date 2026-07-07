import { Suspense } from "react";
import { BookingsTable } from "@/features/bookings/components/BookingsTable/BookingsTable";
import { TableSkeleton } from "@/components/shared/ui/Skeletons";
import { CreateBookingDrawer } from "@/features/bookings/components/Drawers/CreateBookingDrawer";
import { RequirePermission } from "@/components/shared/auth/RequirePermission";

export const metadata = {
  title: "Bookings Management - Dunas Travel",
};

export default function BookingsPage() {
  return (
    <div className="p-8 pb-16 max-w-[1600px] mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Bookings Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage all reservations, payments, and customer journeys.
          </p>
        </div>
        
        <RequirePermission action="manage" resource="bookings">
          <CreateBookingDrawer />
        </RequirePermission>
      </div>

      <div className="bg-background rounded-xl shadow-sm border p-4">
        <Suspense fallback={<TableSkeleton />}>
          <BookingsTable />
        </Suspense>
      </div>
    </div>
  );
}
