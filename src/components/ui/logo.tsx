import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  variant?: "icon" | "wordmark";
  className?: string;
}

/**
 * Logo oficial de Menta.
 * - "icon": isotipo cuadrado (símbolo "n"), ideal para navbar/avatar
 * - "wordmark": logo completo con la palabra "menta"
 */
export function Logo({ size = 36, variant = "icon", className }: LogoProps) {
  const src = variant === "icon" ? "/menta-icon.svg" : "/menta-logo.svg";
  // Para el wordmark el ratio es ~3.4:1; usamos width proporcional.
  const width = variant === "wordmark" ? size * 3.4 : size;
  return (
    <Image
      src={src}
      alt="Menta"
      width={width}
      height={size}
      className={cn("rounded-lg", className)}
      priority
    />
  );
}
