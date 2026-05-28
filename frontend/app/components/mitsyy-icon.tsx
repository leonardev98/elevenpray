import Image from "next/image";
import { cn } from "@/lib/utils";

export type MitsyyIconSize = "sm" | "md" | "nav" | "lg";

const SIZE_PX: Record<MitsyyIconSize, number> = {
  sm: 28,
  md: 36,
  nav: 36,
  lg: 48,
};

/** Isotipo servido desde `public/` (mismo asset que favicon). */
const ICON_SRC = "/icon.png";
const ICON_LARGE_SRC = "/apple-icon.png";

interface MitsyyIconProps {
  size?: MitsyyIconSize;
  className?: string;
  priority?: boolean;
  /** Navbar landing: un poco más grande sin ensanchar la barra. */
  navbar?: boolean;
}

export function MitsyyIcon({
  size = "md",
  className,
  priority = false,
  navbar = false,
}: MitsyyIconProps) {
  const px = navbar ? SIZE_PX.nav : SIZE_PX[size];
  const src = px >= SIZE_PX.lg ? ICON_LARGE_SRC : ICON_SRC;

  return (
    <Image
      src={src}
      alt=""
      width={px}
      height={px}
      priority={priority}
      className={cn(
        "shrink-0 object-contain",
        navbar && "h-9 w-9",
        className,
      )}
    />
  );
}
