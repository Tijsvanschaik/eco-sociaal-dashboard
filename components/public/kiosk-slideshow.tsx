"use client";

import { useCallback, useEffect, useState } from "react";

import type { KioskSlide } from "@/components/public/kiosk-stack";
import { cn } from "@/lib/utils";

export type KioskSlideshowProps = {
  /**
   * Tijd in milliseconden tussen slide-overgangen. Default = 8000.
   * Caller-page valideert reeds bovengrens via `embedQuerySchema`.
   */
  intervalMs?: number;
  /** Klas voor de buitenste container (vb. om hoogte te bepalen). */
  className?: string;
  /** Slides die elkaar afwisselen. Slides < 2 -> renderen we statisch. */
  slides: KioskSlide[];
  /**
   * Linker deel klikken / pijl links = vorige; rechter deel / pijl rechts = volgende.
   * Handmatig wissen herstart de autoplay-timer. Default = true.
   */
  interactive?: boolean;
};

const DEFAULT_INTERVAL_MS = 8000;

/**
 * Kiosk-slideshow voor `/tv` en `/embed?mode=rotate`. Toont één slide tegelijk
 * fullscreen, met een rustige fade-overgang.
 *
 * Dataverversing blijft de verantwoordelijkheid van de page (`revalidate=60`
 * + `<meta http-equiv="refresh">`); deze component rouleert alleen de UI.
 */
export function KioskSlideshow({
  intervalMs = DEFAULT_INTERVAL_MS,
  className,
  slides,
  interactive = true,
}: KioskSlideshowProps) {
  const slideCount = slides.length;
  const [activeIndex, setActiveIndex] = useState(0);
  /** Bump om autoplay-interval te herstarten na handmatige navigatie. */
  const [autoplayKey, setAutoplayKey] = useState(0);

  const restartAutoplay = useCallback(() => {
    setAutoplayKey((k) => k + 1);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % slideCount);
    restartAutoplay();
  }, [slideCount, restartAutoplay]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + slideCount) % slideCount);
    restartAutoplay();
  }, [slideCount, restartAutoplay]);

  useEffect(() => {
    if (slideCount <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slideCount);
    }, Math.max(intervalMs, 1000));
    return () => window.clearInterval(id);
  }, [intervalMs, slideCount, autoplayKey]);

  useEffect(() => {
    if (!interactive || slideCount <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [interactive, slideCount, goNext, goPrev]);

  if (slideCount === 0) return null;

  return (
    <div
      aria-roledescription="carousel"
      className={cn("relative isolate flex min-h-0 flex-1 flex-col overflow-hidden", className)}
      data-testid="kiosk-slideshow"
    >
      <div className="relative flex min-h-0 flex-1">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              aria-hidden={!isActive}
              className={cn(
                "absolute inset-0 flex min-h-0 flex-col transition-opacity duration-700 ease-in-out",
                isActive ? "opacity-100" : "pointer-events-none opacity-0",
              )}
              data-active={isActive}
              data-testid={`kiosk-slide-${slide.id}`}
              key={slide.id}
            >
              {slide.node}
            </div>
          );
        })}

        {interactive && slideCount > 1 ? (
          <>
            <button
              type="button"
              aria-label="Vorige slide"
              className="absolute inset-y-0 left-0 z-50 w-[42%] cursor-w-resize border-0 bg-transparent p-0"
              onClick={goPrev}
            />
            <button
              type="button"
              aria-label="Volgende slide"
              className="absolute inset-y-0 right-0 z-50 w-[42%] cursor-e-resize border-0 bg-transparent p-0"
              onClick={goNext}
            />
          </>
        ) : null}
      </div>

      {slideCount > 1 ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex items-center justify-center gap-2"
          data-testid="kiosk-slideshow-indicators"
        >
          {slides.map((slide, index) => (
            <span
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                index === activeIndex ? "w-8 bg-primary" : "w-2 bg-border",
              )}
              key={`indicator-${slide.id}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
