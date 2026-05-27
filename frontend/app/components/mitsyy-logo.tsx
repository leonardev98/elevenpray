import Image from "next/image";
import { cn } from "@/lib/utils";
import { MITSYY_LOGO_URL } from "@/app/lib/brand";

export type MitsyyLogoSize = "sm" | "md" | "lg" | "xl";

/** Altura del wordmark (ancho proporcional ~3.5:1). */
const HEIGHT_CLASS: Record<MitsyyLogoSize, string> = {
  sm: "h-9", // 36px — pie de sidebar
  md: "h-11", // 44px — login, compacto
  lg: "h-14", // 56px — sidebar expandido
  xl: "h-16", // 64px — navbar landing / pricing
};

interface MitsyyLogoProps {
  size?: MitsyyLogoSize;
  className?: string;
  priority?: boolean;
  /** Sidebar colapsado: recorta al icono del wordmark. */
  compact?: boolean;
}

export function MitsyyLogo({
  size = "md",
  className,
  priority = false,
  compact = false,
}: MitsyyLogoProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center",
        compact && "max-w-[4.75rem] overflow-hidden",
        className,
      )}
    >
      <Image
        src={MITSYY_LOGO_URL}
        alt="Mitsyy"
        width={280}
        height={80}
        priority={priority}
        className={cn(
          "w-auto max-w-none object-contain",
          HEIGHT_CLASS[size],
          compact && "object-left",
        )}
      />
    </span>
  );
}
