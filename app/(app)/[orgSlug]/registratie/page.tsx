import Link from "next/link";
import { notFound } from "next/navigation";

import { RegistrationForm } from "@/components/registration-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getTenantDashboardData } from "@/lib/tenant-dashboard-data";

type Params = Promise<{ orgSlug: string }>;

export default async function RegistratiePage({ params }: { params: Params }) {
  const { orgSlug } = await params;
  const supabase = await createClient();
  const data = await getTenantDashboardData(supabase, orgSlug, "all");
  if (!data) notFound();

  const canRegister = data.teams.length > 0 && data.interventions.length > 0;

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <section className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{data.context.org.name}</p>
        <h1 className="text-3xl font-semibold tracking-tight">Nieuwe registratie</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Voeg een nieuwe eco-sociale actie toe. Na opslaan zie je het effect terug op het
          dashboard.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Registratie invullen</CardTitle>
          <CardDescription>
            Houd het simpel: team, interventie, hoeveelheid, datum en eventueel een korte notitie.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canRegister ? (
            <>
              <p className="text-sm text-muted-foreground">
                Voeg eerst teams en interventies toe in instellingen voordat je kunt registreren.
              </p>
              {data.context.role === "admin" && (
                <Button asChild className="min-h-11 w-full sm:w-auto" variant="secondary">
                  <Link href={`/${data.context.org.slug}/instellingen`}>Naar instellingen</Link>
                </Button>
              )}
            </>
          ) : (
            <RegistrationForm
              interventions={data.interventions}
              orgSlug={data.context.org.slug}
              teams={data.teams}
            />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
