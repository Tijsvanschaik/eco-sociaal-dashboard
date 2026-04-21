import { RegistrationForm } from "@/components/registration-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardSnapshot } from "@/lib/dashboard";

type TeamOption = {
  id: string;
  locationName: string;
  name: string;
};

type InterventionOption = {
  categoryName: string;
  factorKg: number;
  id: string;
  name: string;
  unit: string;
};

type RecentRegistration = {
  co2KgCached: number;
  happenedOn: string;
  id: string;
  interventionLabel: string;
  note: string | null;
  quantity: number;
  teamLabel: string;
};

function formatKg(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: 1,
    minimumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

export function InternalDashboard({
  interventions,
  orgName,
  orgSlug,
  recentRegistrations,
  roleLabel,
  snapshot,
  teams,
}: {
  interventions: InterventionOption[];
  orgName: string;
  orgSlug: string;
  recentRegistrations: RecentRegistration[];
  roleLabel: string;
  snapshot: DashboardSnapshot;
  teams: TeamOption[];
}) {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <section className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{orgName}</p>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Registreer acties, volg de impact per team en zie wat jullie samen besparen. Je bent
          ingelogd als {roleLabel}.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="CO2 bespaard" value={`${formatKg(snapshot.totalCo2Kg)} kg`} />
        <MetricCard label="Registraties" value={`${snapshot.registrationCount}`} />
        <MetricCard label="Actieve collega's" value={`${snapshot.activeUserCount}`} />
        <MetricCard label="EOD opgeschoven" value={`${snapshot.eodDays} dagen`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Nieuwe registratie</CardTitle>
            <CardDescription>
              Houd het simpel: team, interventie, hoeveelheid, datum en eventueel een korte notitie.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teams.length === 0 || interventions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Voeg eerst teams en interventies toe in beheer voordat je kunt registreren.
              </p>
            ) : (
              <RegistrationForm interventions={interventions} orgSlug={orgSlug} teams={teams} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mijn recente registraties</CardTitle>
            <CardDescription>
              Je laatste 8 registraties, zodat je meteen feedback ziet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRegistrations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nog geen registraties. Voeg je eerste actie toe.
              </p>
            ) : (
              recentRegistrations.map((registration) => (
                <div key={registration.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{registration.interventionLabel}</p>
                      <p className="text-sm text-muted-foreground">{registration.teamLabel}</p>
                    </div>
                    <p className="text-sm font-medium">{formatKg(registration.co2KgCached)} kg</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {registration.quantity} op {registration.happenedOn}
                  </p>
                  {registration.note && <p className="mt-2 text-sm">{registration.note}</p>}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <BreakdownCard
          emptyText="Zodra teams registreren, zie je hier de ranglijst."
          items={snapshot.teamBreakdown.slice(0, 6)}
          subtitleKey="secondary"
          title="Top teams"
        />
        <BreakdownCard
          emptyText="Zodra categorieen gebruikt worden, zie je hier de spreiding."
          items={snapshot.categoryBreakdown}
          title="Per categorie"
        />
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="gap-1">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function BreakdownCard({
  emptyText,
  items,
  subtitleKey,
  title,
}: {
  emptyText: string;
  items: DashboardSnapshot["teamBreakdown"];
  subtitleKey?: "secondary";
  title: string;
}) {
  const rows = items.filter((item) => item.registrationCount > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          rows.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                {subtitleKey && item[subtitleKey] && (
                  <p className="text-sm text-muted-foreground">{item[subtitleKey]}</p>
                )}
              </div>
              <div className="text-right text-sm">
                <p className="font-medium">{formatKg(item.co2SavedKg)} kg</p>
                <p className="text-muted-foreground">{item.registrationCount} registraties</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
