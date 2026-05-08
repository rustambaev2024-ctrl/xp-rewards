import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  variant?: "card" | "row" | "avatar" | "hero" | "table-row" | "chart" | "podium" | "store-grid";
  count?: number;
  columns?: number;
}

export function LoadingSkeleton({ variant = "row", count = 1, columns }: Props) {
  if (variant === "store-grid") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton variant="card" className="h-40" />
            <Skeleton variant="row" className="h-4 w-3/4" />
            <Skeleton variant="row" className="h-3 w-1/2" />
            <Skeleton variant="row" className="h-8 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "table-row") {
    return (
      <div className="divide-y divide-border rounded-2xl border border-border overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} variant="table-row" columns={columns} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant={variant} />
      ))}
    </div>
  );
}
