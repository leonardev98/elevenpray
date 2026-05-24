import { cn } from "@/lib/utils";

export function UserAvatar({
  initial,
  colorClass,
  size = "md",
  className,
}: {
  initial: string;
  colorClass: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass =
    size === "sm" ? "h-7 w-7 text-xs" : size === "lg" ? "h-11 w-11 text-base" : "h-9 w-9 text-sm";

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        colorClass,
        sizeClass,
        className,
      )}
      aria-hidden
    >
      {initial}
    </span>
  );
}
