import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return <Skeleton className="h-32 w-full rounded-xl" />;
}

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
