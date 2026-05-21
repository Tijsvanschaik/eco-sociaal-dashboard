"use client";

import { useMemo, useState } from "react";

import { Icon } from "@/components/ui/icon";
import type { TeamBreakdownRow } from "@/lib/dashboard";
import { treesEquivalent } from "@/lib/impact";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_TEAMS = 5;

/** Zelfde hoek en schaduw als het impact-overview-blok; witte inset-panelen. */
const impactInsetPanelClassName = "rounded-[2rem] bg-card shadow-[0_20px_40px_rgba(54,50,45,0.04)]";

const integerFormatter = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 0 });

function formatTons(kg: number): string {
  const tons = kg / 1000;
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: tons >= 10 ? 0 : 1,
    minimumFractionDigits: tons >= 10 ? 0 : 1,
  }).format(tons);
}

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
  teamBreakdown: TeamBreakdownRow[];
  periodLabel: string;
  registrationCount: number;
  totalCo2Kg: number;
  totalSocialScore: number;
};

export function ImpactOverviewCard({
  className,
  eodDays,
  fitToContainer = false,
  forceShowAllTeams = false,
  showTeamRanks = false,
  teamBreakdown,
  periodLabel,
  registrationCount,
  totalCo2Kg,
  totalSocialScore,
}: ImpactOverviewCardProps) {
  const [showAllTeams, setShowAllTeams] = useState(false);

  const visibleTeams = useMemo(() => {
    if (forceShowAllTeams || showAllTeams) return teamBreakdown;
    return teamBreakdown.slice(0, MAX_VISIBLE_TEAMS);
  }, [forceShowAllTeams, teamBreakdown, showAllTeams]);

  const grandTotalKg = useMemo(
    () => teamBreakdown.reduce((sum, team) => sum + team.co2SavedKg, 0),
    [teamBreakdown],
  );
  const maxTeamKg = useMemo(
    () => teamBreakdown.reduce((max, team) => Math.max(max, team.co2SavedKg), 0),
    [teamBreakdown],
  );

  const trees = treesEquivalent(totalCo2Kg);
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
          eodDays={eodDays}
          hasData={hasData}
          registrationCount={registrationCount}
          totalCo2Kg={totalCo2Kg}
          totalSocialScore={totalSocialScore}
          trees={trees}
        />
        <TeamBreakdownPanel
          fitToContainer={fitToContainer}
          grandTotalKg={grandTotalKg}
          hasMore={!forceShowAllTeams && teamBreakdown.length > MAX_VISIBLE_TEAMS}
          teams={visibleTeams}
          maxTeamKg={maxTeamKg}
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
  eodDays,
  hasData,
  registrationCount,
  totalCo2Kg,
  totalSocialScore,
  trees,
}: {
  eodDays: number;
  hasData: boolean;
  registrationCount: number;
  totalCo2Kg: number;
  totalSocialScore: number;
  trees: number;
}) {
  return (
    <div className="flex min-h-0 flex-col gap-7 lg:h-full">
      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
        <Icon name="insights" className="text-base" filled /> Totale eco-sociale impact
      </span>

      <div>
        <h2
          id="impact-overview-heading"
          className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl"
        >
          <span className="text-primary">{integerFormatter.format(eodDays)}</span>
          <span className="ml-3 inline-block text-4xl font-extrabold text-foreground/90 sm:text-5xl">
            {eodDays === 1 ? "dag" : "dagen"}
          </span>
          <span className="mt-2 block text-lg font-semibold text-muted-foreground sm:text-xl">
            gewonnen voor Earth Overshoot Day
          </span>
        </h2>
        <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
          {hasData ? (
            <>
              Samen goed voor{" "}
              <strong className="font-bold text-foreground">
                {formatTons(totalCo2Kg)} ton CO<sub>2</sub>
              </strong>{" "}
              minder uitstoot
              {totalSocialScore > 0 ? (
                <>
                  {" "}
                  en{" "}
                  <strong className="font-bold text-tertiary">
                    {integerFormatter.format(Math.round(totalSocialScore))}
                  </strong>{" "}
                  sociale score bij elkaar
                </>
              ) : null}
              .
            </>
          ) : (
            <>
              Zodra de eerste acties binnenrollen, zien jullie hier precies hoeveel dagen Earth
              Overshoot Day is opgeschoven.
            </>
          )}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-4 pt-1 lg:mt-auto">
        <FactTile
          icon="forest"
          label="Eco-score"
          sublabel="als bomen geplant · jaar opname"
          tone="tertiary"
          value={integerFormatter.format(trees)}
        />
        <FactTile
          icon="volunteer_activism"
          label="Sociale score"
          sublabel={
            registrationCount === 1
              ? "uit 1 registratie samen"
              : `uit ${integerFormatter.format(registrationCount)} registraties samen`
          }
          tone="primary"
          value={formatScore(totalSocialScore)}
        />
      </dl>
    </div>
  );
}

function FactTile({
  icon,
  label,
  sublabel,
  tone,
  value,
}: {
  icon: string;
  label: string;
  sublabel: string;
  tone: "primary" | "tertiary";
  value: string;
}) {
  const iconTone =
    tone === "tertiary"
      ? "bg-tertiary-container text-tertiary"
      : "bg-primary-container text-primary";

  return (
    <div
      className={`group relative flex flex-col gap-4 overflow-hidden p-5 transition-transform hover:-translate-y-0.5 ${impactInsetPanelClassName}`}
    >
      <span
        className={`inline-flex h-11 w-11 items-center justify-center rounded-[1rem] shadow-sm ${iconTone}`}
      >
        <Icon name={icon} filled className="text-2xl" />
      </span>
      <div>
        <dd className="text-3xl font-extrabold leading-none tracking-tight text-foreground sm:text-4xl">
          {value}
        </dd>
        <dt className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
          <span className="ml-1 font-medium normal-case tracking-normal text-muted-foreground/70">
            · {sublabel}
          </span>
        </dt>
      </div>
    </div>
  );
}

function TeamBreakdownPanel({
  fitToContainer = false,
  grandTotalKg,
  hasMore,
  teams,
  maxTeamKg,
  onToggleShowAll,
  periodLabel,
  showAll,
  showRanks,
  totalTeamCount,
}: {
  fitToContainer?: boolean;
  grandTotalKg: number;
  hasMore: boolean;
  teams: TeamBreakdownRow[];
  maxTeamKg: number;
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
            CO<sub>2</sub> en sociale score per team · {periodLabel}
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
            "flex min-h-0 flex-col gap-4",
            fitToContainer && "min-h-0 flex-1 overflow-y-auto overscroll-y-contain pr-1",
          )}
        >
          {teams.map((team, index) => (
            <TeamBar
              grandTotalKg={grandTotalKg}
              key={team.id}
              maxTeamKg={maxTeamKg}
              rank={showRanks ? index + 1 : undefined}
              team={team}
            />
          ))}
        </ol>
      )}

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
  grandTotalKg,
  team,
  maxTeamKg,
  rank,
}: {
  grandTotalKg: number;
  team: TeamBreakdownRow;
  maxTeamKg: number;
  rank?: number;
}) {
  const fillPercent = maxTeamKg > 0 ? (team.co2SavedKg / maxTeamKg) * 100 : 0;
  const sharePercent = grandTotalKg > 0 ? (team.co2SavedKg / grandTotalKg) * 100 : 0;
  const daysLabel = team.eodDays === 1 ? "dag" : "dagen";

  return (
    <li className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex min-w-0 items-baseline gap-2 text-sm font-semibold text-foreground">
          {rank ? (
            <span className="flex-none text-xs font-extrabold text-primary">
              #{integerFormatter.format(rank)}
            </span>
          ) : null}
          <span className="truncate">{team.name}</span>
        </span>
        <span className="flex-none text-xs font-semibold text-muted-foreground">
          {formatKg(team.co2SavedKg)} kg · {formatScore(team.socialScoreTotal)} score ·{" "}
          <span className="font-bold text-primary">
            {integerFormatter.format(team.eodDays)} {daysLabel}
          </span>
        </span>
      </div>
      <div
        aria-label={`${team.name}: ${formatKg(team.co2SavedKg)} kilogram CO2 bespaard, ${formatScore(team.socialScoreTotal)} sociale score, ${integerFormatter.format(
          team.eodDays,
        )} ${daysLabel} gewonnen`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(sharePercent)}
        className="relative h-3.5 w-full overflow-hidden rounded-full bg-card shadow-[inset_0_1px_2px_rgba(54,50,45,0.04)]"
        role="progressbar"
        tabIndex={-1}
      >
        {team.segments.length === 0 ? (
          <div className="h-full rounded-full bg-primary" style={{ width: `${fillPercent}%` }} />
        ) : (
          <div className="flex h-full" style={{ width: `${fillPercent}%` }}>
            {team.segments.map((segment) => {
              const segmentWidth =
                team.co2SavedKg > 0 ? (segment.co2SavedKg / team.co2SavedKg) * 100 : 0;
              return (
                <span
                  key={segment.id}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{ width: `${segmentWidth}%`, backgroundColor: segment.categoryColor }}
                  title={`${segment.interventionName} (${segment.categoryName}) — ${formatKg(
                    segment.co2SavedKg,
                  )} kg · ${formatScore(segment.socialScoreTotal)} score`}
                />
              );
            })}
          </div>
        )}
      </div>
    </li>
  );
}
