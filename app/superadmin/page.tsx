import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

function formatNumber(value: number) {
  return new Intl.NumberFormat("nl-NL").format(value);
}

export default async function SuperadminPage() {
  const supabase = await createClient();
  const [{ data: organizations }, { data: memberships }, { data: registrations }] =
    await Promise.all([
      supabase
        .from("organizations")
        .select("id, name, slug, public_share_enabled, public_share_slug, eod_baseline_kg")
        .order("name"),
      supabase.from("memberships").select("org_id"),
      supabase.from("registrations").select("org_id"),
    ]);

  const memberCounts = new Map<string, number>();
  for (const membership of memberships ?? []) {
    memberCounts.set(membership.org_id, (memberCounts.get(membership.org_id) ?? 0) + 1);
  }

  const registrationCounts = new Map<string, number>();
  for (const registration of registrations ?? []) {
    registrationCounts.set(
      registration.org_id,
      (registrationCounts.get(registration.org_id) ?? 0) + 1,
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Organisaties</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Bekijk alle tenants, controleer de basisconfiguratie en voeg nieuwe organisaties toe.
          </p>
        </div>
        <Button asChild className="min-h-11 sm:w-auto">
          <Link href="/superadmin/orgs/new">Nieuwe organisatie</Link>
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Organisaties" value={formatNumber((organizations ?? []).length)} />
        <MetricCard
          label="Gebruikerskoppelingen"
          value={formatNumber((memberships ?? []).length)}
        />
        <MetricCard label="Registraties" value={formatNumber((registrations ?? []).length)} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Tenant-overzicht</CardTitle>
          <CardDescription>Read-only overzicht over alle organisaties heen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(organizations ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Er zijn nog geen organisaties aangemaakt.
            </p>
          ) : (
            (organizations ?? []).map((org) => (
              <div
                key={org.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{org.name}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      /{org.slug}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {memberCounts.get(org.id) ?? 0} leden · {registrationCounts.get(org.id) ?? 0}{" "}
                    registraties · publieke link{" "}
                    {org.public_share_enabled && org.public_share_slug ? "aan" : "uit"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    EOD-baseline:{" "}
                    {org.eod_baseline_kg ? `${org.eod_baseline_kg} kg` : "placeholder"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {org.public_share_enabled && org.public_share_slug && (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/p/${org.public_share_slug}`}>Publieke link</Link>
                    </Button>
                  )}
                  <Button asChild size="sm">
                    <Link href={`/superadmin/orgs/${org.id}`}>Bekijk details</Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
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
