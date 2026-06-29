import { ToursTable } from "@/features/tours/components/ToursTable/ToursTable";

export default function ToursPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-serif">Tours & Travel Products</h2>
      </div>
      <ToursTable />
    </div>
  );
}
