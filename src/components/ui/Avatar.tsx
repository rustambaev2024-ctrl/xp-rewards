import { cn } from "@/lib/utils";

interface Props {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-base", xl: "h-20 w-20 text-xl" };

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ name, src, size = "md", className }: Props) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || ""}
        className={cn("rounded-full object-cover ring-2 ring-border", sizes[size], className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-xp to-coin font-semibold text-white",
        sizes[size],
        className
      )}
    >
      {initials(name)}
    </div>
  );
}
