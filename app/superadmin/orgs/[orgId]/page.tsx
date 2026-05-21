import Link from "next/link";
import { notFound } from "next/navigation";

import { SuperadminResetRegistrationsPanel } from "@/components/superadmin-reset-registrations-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getSuperadminOrgOverview } from "@/lib/tenant-dashboard-data";

type Params = Promise<{ orgId: string }>;

function formatKg(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: 1,
    minimumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

function formatSocialScoreMetric(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: 1,
    minimumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

export default async function SuperadminOrgDetailPage({ params }: { params: Params }) {
  const { orgId } = await params;
  const supabase = await createClient();
  const data = await getSuperadminOrgOverview(supabase, orgId);
  if (!data) notFound();

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">/{data.org.slug}</p>
          <h1 className="text-3xl font-semibold tracking-tight">{data.org.name}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Read-only tenantdetail voor support en kwaliteitscontrole.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/superadmin">Terug</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/${data.org.slug}/dashboard`}>Tenant-dashboard</Link>
          </Button>
          {data.org.publicShareEnabled && data.org.publicShareSlug && (
            <Button asChild>
              <Link href={`/p/${data.org.publicShareSlug}`}>Publieke link</Link>
            </Button>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <MetricCard label="CO2 bespaard" value={`${formatKg(data.snapshot.totalCo2Kg)} kg`} />
        <MetricCard
          label="Sociale score"
          value={formatSocialScoreMetric(data.snapshot.totalSocialScore)}
        />
        <MetricCard label="Registraties" value={`${data.snapshot.registrationCount}`} />
        <MetricCard label="Actieve collega's" value={`${data.snapshot.activeUserCount}`} />
        <MetricCard label="EOD opgeschoven" value={`${data.snapshot.eodDays} dagen`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Organisatie-status</CardTitle>
            <CardDescription>Snelle checks voor support en onboarding.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              Publieke share-link:{" "}
              <span className="font-medium">
                {data.org.publicShareEnabled && data.org.publicShareSlug ? "aan" : "uit"}
              </span>
            </p>
            <p>
              Publieke slug:{" "}
              <span className="font-medium">
                {data.org.publicShareSlug ?? "nog niet ingesteld"}
              </span>
            </p>
            <p>
              EOD-baseline:{" "}
              <span className="font-medium">
                {data.org.eodBaselineKg ? `${data.org.eodBaselineKg} kg` : "placeholder"}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recente registraties</CardTitle>
            <CardDescription>Laatste 8 registraties binnen deze tenant.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentRegistrations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nog geen registraties beschikbaar.</p>
            ) : (
              data.recentRegistrations.map((registration) => (
                <div key={registration.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{registration.interventionLabel}</p>
                      <p className="text-sm text-muted-foreground">{registration.teamLabel}</p>
                    </div>
                    <p className="text-sm font-medium text-right">
                      {formatKg(registration.co2KgCached)} kg ·{" "}
                      {formatSocialScoreMetric(registration.socialScoreCached)} score
                    </p>
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
          emptyText="Nog geen teamdata beschikbaar."
          items={data.snapshot.teamBreakdown.slice(0, 6)}
          title="Top teams"
        />
        <BreakdownCard
          emptyText="Nog geen categoriedata beschikbaar."
          items={data.snapshot.categoryBreakdown}
          title="Per categorie"
        />
      </section>
      <section>
        <SuperadminResetRegistrationsPanel
          orgId={data.org.id}
          registrationCount={data.snapshot.registrationCount}
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
  title,
}: {
  emptyText: string;
  items: Array<{
    co2SavedKg: number;
    id: string;
    name: string;
    registrationCount: number;
    socialScoreTotal: number;
  }>;
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
              </div>
              <div className="text-right text-sm">
                <p className="font-medium">
                  {formatKg(item.co2SavedKg)} kg · {formatSocialScoreMetric(item.socialScoreTotal)}{" "}
                  score
                </p>
                <p className="text-muted-foreground">{item.registrationCount} registraties</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
