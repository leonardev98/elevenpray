import Image from "next/image";
import { cn } from "@/lib/utils";
import { MITSYY_LOGO_URL } from "@/app/lib/brand";

export type MitsyyLogoSize = "sm" | "md" | "lg" | "xl";

/** Altura del wordmark (ancho proporcional ~3.5:1). */
const HEIGHT_CLASS: Record<MitsyyLogoSize, string> = {
  sm: "h-9", // 36px — pie de sidebar
  md: "h-11", // 44px — login, compacto
  lg: "h-14", // 56px — sidebar expandido
  xl: "h-16", // 64px — destacado (hero footer, marketing)
};

interface MitsyyLogoProps {
  size?: MitsyyLogoSize;
  className?: string;
  priority?: boolean;
  /** Sidebar colapsado: recorta al icono del wordmark. */
  compact?: boolean;
  /**
   * Navbar / barras compactas: recorta espacio transparente arriba y abajo del PNG
   * y escala el wordmark para que se lea bien sin ensanchar la barra.
   */
  navbar?: boolean;
}

/**
 * Viewport del navbar (40px). La imagen se escala ~2.2× y overflow recorta
 * el padding transparente superior/inferior del PNG (669×373).
 */
const NAVBAR_VIEWPORT_CLASS = "h-10 max-w-[12rem]";
const NAVBAR_IMAGE_CLASS =
  "h-[5.5rem] w-auto max-w-none object-cover object-[center_42%]";

export function MitsyyLogo({
  size = "md",
  className,
  priority = false,
  compact = false,
  navbar = false,
}: MitsyyLogoProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center",
        compact && "max-w-[4.75rem] overflow-hidden",
        navbar && cn("justify-center overflow-hidden", NAVBAR_VIEWPORT_CLASS),
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
          "w-auto max-w-none",
          navbar
            ? NAVBAR_IMAGE_CLASS
            : cn("object-contain", HEIGHT_CLASS[size]),
          compact && "object-left",
        )}
      />
    </span>
  );
}
