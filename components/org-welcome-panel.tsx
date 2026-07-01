"use client";

import { ExpandableMarkdown } from "@/components/dashboard/expandable-markdown";
import { Icon } from "@/components/ui/icon";
import { SafeMarkdown } from "@/components/ui/safe-markdown";
import {
  resolveDashboardImpactDisclaimer,
  resolveDashboardMission,
} from "@/lib/copy/dashboard-welcome";
import { cn } from "@/lib/utils";

export type OrgWelcomeProfile = {
  description?: string | null;
  impactDisclaimer?: string | null;
  missionShort?: string | null;
  orgName: string;
};

export type OrgWelcomePanelProps = OrgWelcomeProfile & {
  className?: string;
};

/**
 * Shared intro block: org title, mission, and methodology disclaimer.
 * Used on the internal dashboard and public share/embed stack surfaces.
 */
export function OrgWelcomePanel({
  className,
  description,
  impactDisclaimer,
  missionShort,
  orgName,
}: OrgWelcomePanelProps) {
  const mission = resolveDashboardMission(description, missionShort);
  const disclaimer = resolveDashboardImpactDisclaimer(impactDisclaimer);
  const bodyCopyClassName = "text-sm leading-relaxed text-muted-foreground sm:text-base";

  return (
    <section
      className={cn(
        "rounded-[2rem] bg-surface-container-low p-6 shadow-[0_20px_40px_rgba(54,50,45,0.04)] sm:p-8",
        className,
      )}
      data-testid="org-welcome-panel"
    >
      <div className="grid gap-y-6 2xl:grid-cols-2 2xl:grid-rows-[auto_auto] 2xl:gap-x-12 2xl:gap-y-4">
        <header className="flex min-w-0 items-start gap-3 2xl:col-start-1 2xl:row-start-1">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-primary-container text-primary shadow-sm">
            <Icon name="insights" filled />
          </span>
          <h1 className="min-w-0 flex-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Welkom op het <span className="text-primary">{orgName}</span> impact dashboard
          </h1>
        </header>

        <div className="min-w-0 2xl:col-start-1 2xl:row-start-2">
          <ExpandableMarkdown className={bodyCopyClassName} content={mission} maxLines={3} />
        </div>

        <div className="min-w-0 border-t border-border/60 pt-6 2xl:col-start-2 2xl:row-start-2 2xl:border-l 2xl:border-t-0 2xl:pt-0 2xl:pl-12">
          <div className="flex items-start gap-2.5">
            <Icon
              name="info"
              className="mt-0.5 shrink-0 text-lg text-muted-foreground"
              aria-hidden
            />
            <div className="min-w-0 flex-1 space-y-2">
              <h2 className="text-sm font-bold text-foreground">Over de impactcijfers</h2>
              <SafeMarkdown className={bodyCopyClassName} content={disclaimer} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
