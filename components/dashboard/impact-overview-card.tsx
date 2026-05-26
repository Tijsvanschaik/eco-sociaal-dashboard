"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ImpactStoryRotator } from "@/components/dashboard/impact-story-rotator";
import { registrationPlaceholderPhotoUrl } from "@/components/dashboard/registration-placeholder";
import { Icon } from "@/components/ui/icon";
import type { TeamBreakdownRow } from "@/lib/dashboard";
import {
  type ImpactStoryPhotoSource,
  attachStoryImages,
  buildImpactStories,
} from "@/lib/impact-stories";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_TEAMS = 5;

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
  storyPhotoSources?: ImpactStoryPhotoSource[];
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
  storyPhotoSources = [],
  totalCo2Kg,
  totalSocialScore,
}: ImpactOverviewCardProps) {
  const [showAllTeams, setShowAllTeams] = useState(false);

  const visibleTeams = useMemo(() => {
    if (forceShowAllTeams || showAllTeams) return teamBreakdown;
    return teamBreakdown.slice(0, MAX_VISIBLE_TEAMS);
  }, [forceShowAllTeams, teamBreakdown, showAllTeams]);

  const maxCombinedImpact = useMemo(
    () =>
      teamBreakdown.reduce(
        (max, team) => Math.max(max, team.co2SavedKg + team.socialScoreTotal),
        0,
      ),
    [teamBreakdown],
  );

  const hasData =
    totalCo2Kg > 0 ||
    totalSocialScore > 0 ||
    teamBreakdown.some((t) => t.co2SavedKg > 0 || t.socialScoreTotal > 0);

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
          "relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch lg:gap-12",
          fitToContainer && "min-h-0 flex-1",
        )}
      >
        <ImpactHero
          hasData={hasData}
          storyPhotoSources={storyPhotoSources}
          totalCo2Kg={totalCo2Kg}
          totalSocialScore={totalSocialScore}
        />
        <TeamBreakdownPanel
          fitToContainer={fitToContainer}
          hasMore={!forceShowAllTeams && teamBreakdown.length > MAX_VISIBLE_TEAMS}
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

function ImpactHero({
  hasData,
  storyPhotoSources,
  totalCo2Kg,
  totalSocialScore,
}: {
  hasData: boolean;
  storyPhotoSources: ImpactStoryPhotoSource[];
  totalCo2Kg: number;
  totalSocialScore: number;
}) {
  const stories = useMemo(() => {
    const built = buildImpactStories({ totalCo2Kg, totalSocialScore });
    return attachStoryImages(
      built,
      storyPhotoSources,
      (registration) => registration.photoUrl ?? registrationPlaceholderPhotoUrl(registration.id),
    );
  }, [storyPhotoSources, totalCo2Kg, totalSocialScore]);

  return (
    <div className="flex min-h-0 flex-col gap-7 lg:h-full">
      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
        <Icon name="insights" className="text-base" filled /> Totale eco-sociale impact
      </span>

      <div>
        {hasData && stories.length > 0 ? (
          <ImpactStoryRotator stories={stories} />
        ) : (
          <div className="min-h-[8.5rem] space-y-2 sm:min-h-[9rem]">
            <h2
              id="impact-overview-heading"
              className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl"
            >
              Jullie impact in cijfers
            </h2>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              {hasData
                ? "Nog geen vertaling beschikbaar voor dit jaar — voeg registraties toe om bomen, harten en km te zien."
                : "Zodra de eerste acties binnenrollen, wisselen we hier tussen bomen, harten bereikt en km autorijden vermeden."}
            </p>
          </div>
        )}
      </div>

      <dl className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2 lg:mt-auto">
        <FactTile
          description="Dit is de som van de CO2 impact van alle eco-sociale activiteiten."
          icon="eco"
          label="Eco score"
          tone="tertiary"
          unit="kg CO₂"
          value={formatKg(totalCo2Kg)}
        />
        <FactTile
          description="Dit is de som van alle sociale impact van alle eco-sociale activiteiten."
          icon="favorite"
          label="Sociale score"
          tone="primary"
          unit="punten"
          value={formatScore(totalSocialScore)}
        />
      </dl>
    </div>
  );
}

function FactTile({
  description,
  icon,
  label,
  tone,
  unit,
  value,
}: {
  description: string;
  icon: string;
  label: string;
  tone: "primary" | "tertiary";
  unit?: string;
  value: string;
}) {
  const iconTone =
    tone === "tertiary"
      ? "bg-tertiary-container text-tertiary"
      : "bg-primary-container text-primary";

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 overflow-hidden p-5 transition-transform hover:-translate-y-0.5",
        impactInsetPanelClassName,
      )}
    >
      <span
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-[0.875rem] shadow-sm",
          iconTone,
        )}
      >
        <Icon name={icon} filled className="text-xl" />
      </span>
      <div className="space-y-2">
        <div className="flex items-baseline gap-1.5">
          <dd className="text-3xl font-extrabold leading-none tracking-tight text-foreground sm:text-4xl">
            {value}
          </dd>
          {unit ? (
            <span className="text-sm font-semibold text-muted-foreground">{unit}</span>
          ) : null}
        </div>
        <dt className="text-sm font-bold tracking-tight text-foreground">{label}</dt>
        <p className="text-xs leading-relaxed text-muted-foreground/90">{description}</p>
      </div>
    </div>
  );
}

function TeamBreakdownPanel({
  fitToContainer = false,
  hasMore,
  maxCombinedImpact,
  teamLinkBase,
  teams,
  onToggleShowAll,
  periodLabel,
  showAll,
  showRanks,
  totalTeamCount,
}: {
  fitToContainer?: boolean;
  hasMore: boolean;
  maxCombinedImpact: number;
  teamLinkBase?: string;
  teams: TeamBreakdownRow[];
  onToggleShowAll: () => void;
  periodLabel: string;
  showAll: boolean;
  showRanks: boolean;
  totalTeamCount: number;
}) {
  return (
    <div
      className={cn(
        `flex h-full min-h-0 flex-col gap-5 p-6 sm:p-7 ${impactInsetPanelClassName}`,
        fitToContainer && "overflow-hidden",
      )}
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
          Nog geen registraties gekoppeld aan een team. Zodra teams registreren, verschijnt hier de
          impact per team.
        </p>
      ) : (
        <ol
          className={cn(
            "flex min-h-0 flex-col",
            teamLinkBase ? "gap-2.5" : "gap-4",
            fitToContainer && "min-h-0 flex-1 overflow-y-auto overscroll-y-contain pr-1",
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
      )}

      {teams.length > 0 ? (
        <div className="flex shrink-0 flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Icon aria-hidden name="eco" filled className="text-sm text-tertiary" />
            Eco · kg CO<sub>2</sub>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon aria-hidden name="favorite" filled className="text-sm text-primary" />
            Sociaal · punten
          </span>
        </div>
      ) : null}

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
          {showAll ? "Toon top 5" : `Toon alle ${integerFormatter.format(totalTeamCount)} teams`}
        </button>
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
  const combined = team.co2SavedKg + team.socialScoreTotal;
  const barWidthPercent =
    maxCombinedImpact > 0 ? Math.min(100, (combined / maxCombinedImpact) * 100) : 0;

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
                roundedEnd={team.socialScoreTotal <= 0}
                roundedStart
                title={`${formatKg(team.co2SavedKg)} kg CO₂`}
                tone="eco"
              />
            ) : null}
            {team.socialScoreTotal > 0 ? (
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
  const toneClassName =
    tone === "eco" ? "bg-tertiary text-tertiary-foreground" : "bg-primary text-primary-foreground";

  return (
    <span
      className={cn(
        "flex h-full min-w-[1.65rem] shrink-0 items-center justify-center gap-px overflow-hidden px-0.5 text-[8px] font-extrabold leading-none sm:min-w-[1.85rem] sm:gap-0.5 sm:text-[9px]",
        toneClassName,
        roundedStart && "rounded-l-full",
        roundedEnd && "rounded-r-full",
      )}
      style={{ flex: `${flexGrow} 1 0%` }}
      title={title}
    >
      <Icon aria-hidden name={icon} filled className="shrink-0 text-[5px] sm:text-[6px]" />
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
}
