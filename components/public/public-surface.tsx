import type { ReactNode } from "react";

import { KioskSlideshow } from "@/components/public/kiosk-slideshow";
import { type KioskSlide, KioskStack } from "@/components/public/kiosk-stack";
import { ProgressSlide } from "@/components/public/progress-slide";
import { RecentRegistrationsSlide } from "@/components/public/recent-registrations-slide";
import { TotalImpactSlide } from "@/components/public/total-impact-slide";
import { ALL_PUBLIC_SLIDES, type PublicSlideId } from "@/lib/embed/query-schema";
import type { PublicDashboardData } from "@/lib/public-dashboard";
import { cn } from "@/lib/utils";

export type PublicSurfaceMode = "tv" | "embed-stack" | "embed-rotate" | "share";

export type PublicSurfaceProps = {
  data: PublicDashboardData;
  intervalMs?: number;
  mode: PublicSurfaceMode;
  /** Subset/volgorde van slides (default = alle drie). */
  slideOrder?: PublicSlideId[];
};

/**
 * Centrale renderer voor publieke surfaces. Bouwt eenmaal de slide-set en
 * kiest dan een shell (slideshow op TV, stack op share/embed) op basis van de
 * mode. Op smalle viewports valt elke modus terug op stack zodat mobiel
 * scrollbaar blijft (1-screen-no-scroll geldt alleen op `lg+`).
 */
export function PublicSurface({ data, intervalMs, mode, slideOrder }: PublicSurfaceProps) {
  const order = slideOrder?.length ? slideOrder : [...ALL_PUBLIC_SLIDES];
  const periodLabel = "alle data";
  const orgName = data.totals.org_name ?? "";

  const slideMap: Record<PublicSlideId, ReactNode> = {
    "1": (
      <TotalImpactSlide isTv={mode === "tv"} periodLabel={periodLabel} snapshot={data.snapshot} />
    ),
    "2": (
      <ProgressSlide
        periodLabel={periodLabel}
        snapshot={data.snapshot}
        timeseries={data.timeseries}
      />
    ),
    "3": (
      <RecentRegistrationsSlide
        compactCards={mode === "tv"}
        gridClassName={mode === "tv" ? "grid grid-cols-3 gap-4" : ""}
        // Op TV/desktop slideshow: 6 kaarten in 3x2-grid; op stack/embed: 9.
        limit={mode === "tv" ? 6 : mode === "embed-rotate" ? 6 : undefined}
        registrations={data.recentRegistrations}
      />
    ),
  };

  const slides: KioskSlide[] = order.map((id) => ({
    id: `slide-${id}`,
    node:
      mode === "tv" ? (
        <div className="flex h-full min-h-0 items-center justify-center">
          <div className="w-full max-w-[1500px]">{slideMap[id]}</div>
        </div>
      ) : (
        slideMap[id]
      ),
  }));
  const showRotation = mode === "tv" || mode === "embed-rotate";

  return (
    <main
      className={cn(
        "flex w-full min-w-0 flex-col bg-[color-mix(in_srgb,var(--card)_92%,var(--background)_8%)]",
        // TV vult exact het scherm; share/embed-stack laten content groeien.
        mode === "tv"
          ? "min-h-dvh px-4 py-4 sm:px-6 lg:h-dvh lg:overflow-hidden"
          : "px-4 py-6 sm:px-6 sm:py-8",
      )}
      data-mode={mode}
      data-testid="public-surface"
    >
      {mode !== "tv" ? <PublicSurfaceHeader mode={mode} orgName={orgName} /> : null}

      {showRotation ? (
        <>
          {/* Slideshow op desktop (lg+); stack op smal scherm. */}
          <div className="hidden lg:flex lg:flex-1 lg:min-h-0 lg:flex-col">
            <KioskSlideshow intervalMs={intervalMs} slides={slides} />
          </div>
          <div className="flex flex-col lg:hidden">
            <KioskStack slides={slides} />
          </div>
        </>
      ) : (
        <KioskStack slides={slides} />
      )}
    </main>
  );
}

function PublicSurfaceHeader({
  mode,
  orgName,
}: {
  mode: PublicSurfaceMode;
  orgName: string;
}) {
  const eyebrow =
    mode === "tv"
      ? "TV-modus"
      : mode === "embed-rotate" || mode === "embed-stack"
        ? "Intranet embed"
        : "Publiek dashboard";

  // TV krijgt een compacter header zodat de slide ruim z'n viewport vult.
  const isTv = mode === "tv";

  return (
    <header
      className={cn(
        "w-full",
        isTv ? "shrink-0 px-2 pb-4 pt-2 lg:pb-6" : "space-y-3 px-2 pb-2 pt-4 sm:pb-4",
      )}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
      <h1
        className={cn(
          "font-extrabold tracking-tight text-foreground",
          isTv ? "text-3xl sm:text-4xl lg:text-5xl" : "text-2xl sm:text-3xl",
        )}
      >
        {orgName}
      </h1>
      <p className={cn("text-muted-foreground", isTv ? "text-sm" : "text-sm sm:text-base")}>
        Live overzicht van eco-sociale impact. Deze pagina toont alleen publieke cijfers.
      </p>
    </header>
  );
}
