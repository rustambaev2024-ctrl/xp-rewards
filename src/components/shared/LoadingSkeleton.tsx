import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton({ variant = "row", count = 1 }: { variant?: "card" | "row" | "avatar"; count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant={variant} />
      ))}
    </div>
  );
}
