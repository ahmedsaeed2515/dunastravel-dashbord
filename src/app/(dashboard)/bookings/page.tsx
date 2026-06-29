import { BookingsTable } from "@/features/bookings/components/BookingsTable/BookingsTable";

export default function BookingsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
      </div>
      <BookingsTable />
    </div>
  );
}
