"use client";

import Link from "next/link";
import { type RefObject, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { ImpactHeroSection } from "@/components/dashboard/impact-hero-section";
import {
  DEFAULT_FIT_LIST_ITEM_COUNT,
  TEAM_BAR_ROW_GAP_PX,
  TEAM_BAR_ROW_HEIGHT_PX,
  useFitListItemCount,
  useLargeScreenLayout,
} from "@/components/dashboard/use-fit-list-item-count";
import { Icon } from "@/components/ui/icon";
import type { TeamBreakdownRow } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_TEAMS_MOBILE = DEFAULT_FIT_LIST_ITEM_COUNT;

/** Minimum segment width (px) before icon + label are shown. */
const BAR_SEGMENT_CONTENT_MIN_WIDTH_PX = 28;

function useBarSegmentContentVisibility(segmentRef: RefObject<HTMLSpanElement | null>): boolean {
  const [visible, setVisible] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: ref attachment is stable; measure runs on mount
  useLayoutEffect(() => {
    const node = segmentRef.current;
    if (!node) return;

    const measure = () => {
      setVisible(node.clientWidth >= BAR_SEGMENT_CONTENT_MIN_WIDTH_PX);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return visible;
}

/** Zelfde hoek en schaduw als het impact-overview-blok; witte inset-panelen. */
const impactInsetPanelClassName = "rounded-[2rem] bg-card shadow-[0_20px_40px_rgba(54,50,45,0.04)]";

const integerFormatter = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 0 });

function formatKg(kg: number): string {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: kg >= 100 ? 0 : 1,
  }).format(kg);
}

function formatScore(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

export type ImpactOverviewCardProps = {
  className?: string;
  eodDays: number;
  fitToContainer?: boolean;
  forceShowAllTeams?: boolean;
  showTeamRanks?: boolean;
  /** Basis-URL voor team drill-down, bijv. `/lev-groep/teams`. */
  teamLinkBase?: string;
  teamBreakdown: TeamBreakdownRow[];
  periodLabel: string;
  registrationCount: number;
  totalCo2Kg: number;
  totalSocialScore: number;
};

export function ImpactOverviewCard({
  className,
  eodDays: _eodDays,
  fitToContainer = false,
  forceShowAllTeams = false,
  showTeamRanks = false,
  teamLinkBase,
  teamBreakdown,
  periodLabel,
  registrationCount: _registrationCount,
  totalCo2Kg,
  totalSocialScore,
}: ImpactOverviewCardProps) {
  const [showAllTeams, setShowAllTeams] = useState(false);
  const heroColumnRef = useRef<HTMLDivElement>(null);
  const [heroColumnHeight, setHeroColumnHeight] = useState(0);
  const isLargeScreen = useLargeScreenLayout(!fitToContainer);
  const useDynamicTeamFit = isLargeScreen && !fitToContainer && !forceShowAllTeams;

  const hasData =
    totalCo2Kg > 0 ||
    totalSocialScore > 0 ||
    teamBreakdown.some((t) => t.co2SavedKg > 0 || t.socialScoreTotal > 0);

  useEffect(() => {
    if (!useDynamicTeamFit) {
      setHeroColumnHeight(0);
      return;
    }

    const node = heroColumnRef.current;
    if (!node) return;

    const measure = () => setHeroColumnHeight(node.offsetHeight);

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);

    return () => observer.disconnect();
  }, [useDynamicTeamFit]);

  const { containerRef: teamListContainerRef, fitCount: dynamicFitCount } = useFitListItemCount({
    enabled: useDynamicTeamFit && !showAllTeams,
    fallbackCount: DEFAULT_FIT_LIST_ITEM_COUNT,
    gapPx: teamLinkBase ? TEAM_BAR_ROW_GAP_PX : 16,
    itemCount: teamBreakdown.length,
    itemHeightPx: TEAM_BAR_ROW_HEIGHT_PX,
  });

  const collapsedTeamLimit = useDynamicTeamFit
    ? dynamicFitCount
    : forceShowAllTeams
      ? teamBreakdown.length
      : MAX_VISIBLE_TEAMS_MOBILE;

  const visibleTeams = useMemo(() => {
    if (forceShowAllTeams || showAllTeams) return teamBreakdown;
    return teamBreakdown.slice(0, collapsedTeamLimit);
  }, [collapsedTeamLimit, forceShowAllTeams, showAllTeams, teamBreakdown]);

  const maxCombinedImpact = useMemo(
    () =>
      teamBreakdown.reduce(
        (max, team) => Math.max(max, team.co2SavedKg + team.socialScoreTotal),
        0,
      ),
    [teamBreakdown],
  );

  return (
    <section
      aria-labelledby="impact-overview-heading"
      className={cn(
        "relative overflow-hidden rounded-[2rem] bg-surface-container-low p-6 shadow-[0_20px_40px_rgba(54,50,45,0.04)] sm:p-10",
        fitToContainer && "flex h-full min-h-0 flex-col",
        className,
      )}
    >
      <div
        className={cn(
          "relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-12",
          fitToContainer && "min-h-0 flex-1",
        )}
      >
        <div ref={heroColumnRef} className="min-h-0">
          <ImpactHeroSection
            fitToContainer={fitToContainer}
            hasData={hasData}
            totalCo2Kg={totalCo2Kg}
            totalSocialScore={totalSocialScore}
          />
        </div>
        <TeamBreakdownPanel
          dynamicTeamFit={useDynamicTeamFit}
          fitToContainer={fitToContainer}
          hasMore={!forceShowAllTeams && teamBreakdown.length > collapsedTeamLimit}
          listContainerRef={teamListContainerRef}
          matchedHeight={useDynamicTeamFit && heroColumnHeight > 0 ? heroColumnHeight : undefined}
          maxCombinedImpact={maxCombinedImpact}
          teamLinkBase={teamLinkBase}
          teams={visibleTeams}
          onToggleShowAll={() => setShowAllTeams((value) => !value)}
          periodLabel={periodLabel}
          showAll={showAllTeams}
          showRanks={showTeamRanks}
          totalTeamCount={teamBreakdown.length}
        />
      </div>
    </section>
  );
}

function TeamBreakdownPanel({
  dynamicTeamFit = false,
  fitToContainer = false,
  hasMore,
  listContainerRef,
  matchedHeight,
  maxCombinedImpact,
  teamLinkBase,
  teams,
  onToggleShowAll,
  periodLabel,
  showAll,
  showRanks,
  totalTeamCount,
}: {
  dynamicTeamFit?: boolean;
  fitToContainer?: boolean;
  hasMore: boolean;
  listContainerRef?: (node: HTMLDivElement | null) => void;
  /** Match the hero column height on desktop (fill, not just cap). */
  matchedHeight?: number;
  maxCombinedImpact: number;
  teamLinkBase?: string;
  teams: TeamBreakdownRow[];
  onToggleShowAll: () => void;
  periodLabel: string;
  showAll: boolean;
  showRanks: boolean;
  totalTeamCount: number;
}) {
  const fillMatchedHeight = dynamicTeamFit && matchedHeight != null && matchedHeight > 0;

  return (
    <div
      className={cn(
        `flex min-h-0 flex-col gap-5 p-6 sm:p-7 ${impactInsetPanelClassName}`,
        fitToContainer && "h-full overflow-hidden",
        fillMatchedHeight && "lg:overflow-hidden",
        !fitToContainer && !dynamicTeamFit && "h-full",
      )}
      style={fillMatchedHeight ? { height: matchedHeight, minHeight: matchedHeight } : undefined}
    >
      <div className="flex shrink-0 items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-surface-container-high text-primary shadow-sm">
          <Icon name="groups" filled />
        </span>
        <div className="min-w-0">
          <h3 className="text-xl font-extrabold tracking-tight text-foreground">Top teams</h3>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">
            kg CO<sub>2</sub> en sociale punten per team · {periodLabel}
          </p>
        </div>
      </div>

      {teams.length === 0 ? (
        <p className="rounded-[1.25rem] border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
          Nog geen registraties gekoppeld aan een team. Zodra teams registraties toevoegen,
          verschijnt hier de impact per team.
        </p>
      ) : (
        <div
          ref={listContainerRef}
          className={cn(
            "min-h-0",
            (fillMatchedHeight || fitToContainer) && "flex min-h-0 flex-1 flex-col",
          )}
        >
          <ol
            className={cn(
              "flex min-h-0 flex-col",
              teamLinkBase ? "gap-2.5" : "gap-4",
              showAll &&
                (fitToContainer || fillMatchedHeight) &&
                "min-h-0 flex-1 overflow-y-auto overscroll-y-contain pr-1",
            )}
          >
            {teams.map((team, index) => (
              <TeamBar
                key={team.id}
                href={teamLinkBase ? `${teamLinkBase}/${team.id}` : undefined}
                maxCombinedImpact={maxCombinedImpact}
                rank={showRanks ? index + 1 : undefined}
                team={team}
              />
            ))}
          </ol>
        </div>
      )}

      {teams.length > 0 ? (
        <div className={cn("mt-auto flex shrink-0 flex-col gap-3", fillMatchedHeight && "pt-1")}>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Icon aria-hidden name="eco" filled className="text-sm text-tertiary" />
              Eco · kg CO<sub>2</sub>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon aria-hidden name="favorite" filled className="text-sm text-primary" />
              Sociaal · punten
            </span>
          </div>

          {hasMore ? (
            <button
              className="group/toggle inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-card px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:bg-primary/5"
              onClick={onToggleShowAll}
              type="button"
            >
              <Icon
                name={showAll ? "expand_less" : "expand_more"}
                className="text-base transition-transform group-hover/toggle:-translate-y-0.5"
              />
              {showAll
                ? "Toon minder"
                : `Toon alle ${integerFormatter.format(totalTeamCount)} teams`}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function TeamBar({
  href,
  maxCombinedImpact,
  team,
  rank,
}: {
  href?: string;
  maxCombinedImpact: number;
  team: TeamBreakdownRow;
  rank?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidthPx, setTrackWidthPx] = useState(0);

  useLayoutEffect(() => {
    const node = trackRef.current;
    if (!node) return;

    const measure = () => setTrackWidthPx(node.clientWidth);

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const combined = team.co2SavedKg + team.socialScoreTotal;
  const barWidthPercent =
    maxCombinedImpact > 0 ? Math.min(100, (combined / maxCombinedImpact) * 100) : 0;
  const filledBarWidthPx = trackWidthPx * (barWidthPercent / 100);
  const socialSegmentWidthPx =
    combined > 0 ? filledBarWidthPx * (team.socialScoreTotal / combined) : 0;
  const showSocialSegment =
    team.socialScoreTotal > 0 &&
    (trackWidthPx === 0 || socialSegmentWidthPx >= BAR_SEGMENT_CONTENT_MIN_WIDTH_PX);

  const content = (
    <>
      <div className="flex min-w-0 items-baseline gap-2 text-sm font-semibold text-foreground">
        {rank ? (
          <span className="flex-none text-xs font-extrabold text-primary">
            #{integerFormatter.format(rank)}
          </span>
        ) : null}
        <span className="truncate">{team.name}</span>
        {href ? (
          <Icon
            aria-hidden
            name="chevron_right"
            className="ml-auto shrink-0 text-sm text-muted-foreground"
          />
        ) : null}
      </div>
      <div
        ref={trackRef}
        aria-label={`${team.name}: ${formatKg(team.co2SavedKg)} kilogram CO2, ${formatScore(team.socialScoreTotal)} sociale punten`}
        className="relative h-6 w-full overflow-hidden rounded-full bg-card shadow-[inset_0_1px_2px_rgba(54,50,45,0.04)]"
        role="img"
      >
        {combined > 0 ? (
          <div className="flex h-full min-w-0" style={{ width: `${barWidthPercent}%` }}>
            {team.co2SavedKg > 0 ? (
              <BarSegment
                flexGrow={team.co2SavedKg}
                icon="eco"
                label={formatKg(team.co2SavedKg)}
                roundedEnd={!showSocialSegment}
                roundedStart
                title={`${formatKg(team.co2SavedKg)} kg CO₂`}
                tone="eco"
              />
            ) : null}
            {showSocialSegment ? (
              <BarSegment
                flexGrow={team.socialScoreTotal}
                icon="favorite"
                label={formatScore(team.socialScoreTotal)}
                roundedEnd
                roundedStart={team.co2SavedKg <= 0}
                title={`${formatScore(team.socialScoreTotal)} punten`}
                tone="social"
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );

  if (href) {
    return (
      <li>
        <Link
          className="group/team-link -mx-1 block space-y-1 rounded-lg px-1 py-0.5 transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          href={href}
        >
          {content}
        </Link>
      </li>
    );
  }

  return <li className="space-y-1">{content}</li>;
}

function BarSegment({
  flexGrow,
  icon,
  label,
  roundedEnd = false,
  roundedStart = false,
  title,
  tone,
}: {
  flexGrow: number;
  icon: string;
  label: string;
  roundedEnd?: boolean;
  roundedStart?: boolean;
  title: string;
  tone: "eco" | "social";
}) {
  const segmentRef = useRef<HTMLSpanElement>(null);
  const showContent = useBarSegmentContentVisibility(segmentRef);
  const toneClassName =
    tone === "eco" ? "bg-tertiary text-tertiary-foreground" : "bg-primary text-primary-foreground";

  return (
    <span
      ref={segmentRef}
      className={cn(
        "flex h-full min-w-0 items-center justify-center overflow-hidden",
        toneClassName,
        roundedStart && "rounded-l-full",
        roundedEnd && "rounded-r-full",
      )}
      style={{ flex: `${flexGrow} 1 0%` }}
      title={title}
    >
      {showContent ? (
        <span className="flex items-center justify-center gap-px px-0.5 text-[8px] font-extrabold leading-none sm:gap-0.5 sm:text-[9px]">
          <Icon aria-hidden name={icon} filled className="shrink-0 text-[5px] sm:text-[6px]" />
          <span className="whitespace-nowrap">{label}</span>
        </span>
      ) : null}
    </span>
  );
}
