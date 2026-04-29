import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type KioskSlide = {
  /** Stabiele id; gebruikt als React-key. */
  id: string;
  node: ReactNode;
};

export type KioskStackProps = {
  className?: string;
  slides: KioskSlide[];
};

/**
 * Verticale stack-modus voor publieke surfaces. Default voor `/embed` (zodat
 * intranet-iframes scrollbaar blijven) en automatische fallback voor `/tv` op
 * smalle viewports.
 */
export function KioskStack({ className, slides }: KioskStackProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} data-testid="kiosk-stack">
      {slides.map((slide) => (
        <div key={slide.id}>{slide.node}</div>
      ))}
    </div>
  );
}
