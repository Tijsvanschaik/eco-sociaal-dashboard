import Link from "next/link";

import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import {
  RegistrationCard,
  type RegistrationCardData,
} from "@/components/dashboard/registration-card";
import { RegistrationsFilters } from "@/components/dashboard/registrations-filters";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { DashboardFeedFilters } from "@/lib/registrations/dashboard-filters";
import type { TeamOption } from "@/lib/tenant-dashboard-data";
import { cn } from "@/lib/utils";

export type InternalRecentRegistration = RegistrationCardData & {
  canEdit: boolean;
};

type InternalRecentRegistrationsSectionProps = {
  filters: DashboardFeedFilters;
  orgSlug: string;
  registrations: InternalRecentRegistration[];
  showTeamFilter: boolean;
  teams: TeamOption[];
};

export function InternalRecentRegistrationsSection({
  filters,
  orgSlug,
  registrations,
  showTeamFilter,
  teams,
}: InternalRecentRegistrationsSectionProps) {
  return (
    <DashboardPanel
      action={
        <Button asChild size="sm" variant="outline" className="hidden rounded-full sm:inline-flex">
          <Link href={`/${orgSlug}/activiteiten`}>
            <Icon name="list" className="text-base" />
            Alle activiteiten
          </Link>
        </Button>
      }
      contentClassName="space-y-5"
      description="Filter op periode of team. Bewerk je eigen activiteiten of alles als beheerder."
      icon="history"
      iconTone="primary"
      title="Recente eco-sociale activiteiten"
    >
      <RegistrationsFilters
        filters={filters}
        orgSlug={orgSlug}
        showTeamFilter={showTeamFilter}
        teams={teams}
      />

      {registrations.length === 0 ? (
        <div className="flex flex-col items-start gap-2 rounded-[1.5rem] bg-card p-6 text-sm text-muted-foreground shadow-[0_20px_40px_rgba(54,50,45,0.04)]">
          <Icon name="inbox" className="text-2xl text-primary" filled />
          <p>
            Geen eco-sociale activiteiten voor deze selectie. Pas de filters aan of registreer een
            nieuwe activiteit.
          </p>
        </div>
      ) : (
        <ul className={cn("grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3")}>
          {registrations.map((registration) => (
            <li key={registration.id} className="h-full">
              <RegistrationCard
                editHref={
                  registration.canEdit
                    ? `/${orgSlug}/activiteiten/${registration.id}/bewerken`
                    : null
                }
                registration={registration}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="sm:hidden">
        <Button asChild className="w-full rounded-full" variant="outline">
          <Link href={`/${orgSlug}/activiteiten`}>
            <Icon name="list" className="text-base" />
            Alle activiteiten bekijken
          </Link>
        </Button>
      </div>
    </DashboardPanel>
  );
}
