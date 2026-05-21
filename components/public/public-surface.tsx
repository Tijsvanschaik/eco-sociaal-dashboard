import type { ReactNode } from "react";

import { KioskSlideshow } from "@/components/public/kiosk-slideshow";
import { type KioskSlide, KioskStack } from "@/components/public/kiosk-stack";
import { ProgressSlide } from "@/components/public/progress-slide";
import { RecentRegistrationFeaturedPanel } from "@/components/public/recent-registration-featured-panel";
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

const MAX_KIOSK_RECENT_SLIDES = 3;

function wrapTv(node: ReactNode, mode: PublicSurfaceMode) {
  if (mode !== "tv") return node;
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col justify-stretch">{node}</div>
  );
}

function buildKioskSlides({
  data,
  mode,
  order,
  slideMap,
  expandRecentIntoSeparateSlides,
}: {
  data: PublicDashboardData;
  mode: PublicSurfaceMode;
  order: PublicSlideId[];
  slideMap: Record<PublicSlideId, ReactNode>;
  expandRecentIntoSeparateSlides: boolean;
}): KioskSlide[] {
  const slides: KioskSlide[] = [];

  for (const id of order) {
    if (id === "3" && expandRecentIntoSeparateSlides) {
      const regs = data.recentRegistrations.slice(0, MAX_KIOSK_RECENT_SLIDES);
      if (regs.length === 0) {
        slides.push({
          id: "slide-3-empty",
          node: wrapTv(slideMap["3"], mode),
        });
      } else {
        regs.forEach((registration, index) => {
          slides.push({
            id: `slide-3-${registration.id}`,
            node: wrapTv(
              <RecentRegistrationFeaturedPanel
                index={index}
                registration={registration}
                totalRecent={regs.length}
              />,
              mode,
            ),
          });
        });
      }
      continue;
    }

    slides.push({
      id: `slide-${id}`,
      node: wrapTv(slideMap[id], mode),
    });
  }

  return slides;
}

/**
 * Centrale renderer voor publieke surfaces. Bouwt eenmaal de slide-set en
 * kiest dan een shell (slideshow op TV, stack op share/embed) op basis van de
 * mode. Op smalle viewports valt elke modus terug op stack zodat mobiel
 * scrollbaar blijft (1-screen-no-scroll geldt alleen op `lg+`).
 *
 * Op TV en `embed-rotate` wordt logische slide `3` (recente registraties)
 * uitgesplitst tot max. drie aparte kiosk-slides (3–5), elk met één hero-
 * registratie — geen geneste carousel.
 */
export function PublicSurface({ data, intervalMs, mode, slideOrder }: PublicSurfaceProps) {
  const order = slideOrder?.length ? slideOrder : [...ALL_PUBLIC_SLIDES];
  const periodLabel = "alle data";
  const orgName = data.totals.org_name ?? "";
  const expandRecent = mode === "tv" || mode === "embed-rotate";

  const slideMap: Record<PublicSlideId, ReactNode> = {
    "1": (
      <TotalImpactSlide
        isTv={expandRecent}
        periodLabel={periodLabel}
        snapshot={data.snapshot}
        storyPhotoSources={data.recentRegistrations.map(
          ({ id, photoUrl, co2KgCached, socialScoreCached }) => ({
            id,
            photoUrl: photoUrl ?? null,
            co2KgCached,
            socialScoreCached,
          }),
        )}
      />
    ),
    "2": (
      <ProgressSlide
        isKioskFullscreen={expandRecent}
        periodLabel={periodLabel}
        snapshot={data.snapshot}
        timeseries={data.timeseries}
      />
    ),
    "3": <RecentRegistrationsSlide registrations={data.recentRegistrations} />,
  };

  const slides = buildKioskSlides({
    data,
    mode,
    order,
    slideMap,
    expandRecentIntoSeparateSlides: expandRecent,
  });

  const showRotation = expandRecent;

  return (
    <main
      className={cn(
        "flex w-full min-w-0 flex-col bg-[color-mix(in_srgb,var(--card)_92%,var(--background)_8%)]",
        // TV vult exact het scherm; share/embed-stack laten content groeien.
        mode === "tv"
          ? "min-h-dvh px-3 py-3 sm:px-4 sm:py-3 lg:h-dvh lg:overflow-hidden lg:px-5 lg:py-4 xl:px-8 xl:py-5 2xl:px-12 2xl:py-7"
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
            <KioskSlideshow interactive intervalMs={intervalMs} slides={slides} />
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
