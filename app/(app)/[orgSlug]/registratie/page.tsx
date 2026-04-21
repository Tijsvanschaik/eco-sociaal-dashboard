import Link from "next/link";
import { notFound } from "next/navigation";

import { RegistrationForm } from "@/components/registration-form";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
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
    <main className="min-h-dvh w-full min-w-0 space-y-8 bg-[color-mix(in_srgb,var(--card)_92%,var(--background)_8%)] px-10 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <header className="w-full space-y-3 p-10">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-primary-container text-primary shadow-sm">
              <Icon name="favorite" filled className="text-xl" />
            </span>
            <div className="min-w-0 flex-1 space-y-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                Wat heb je vandaag gedaan voor de <span className="text-primary">wereld</span>?
              </h1>
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                Elke actie telt. Deel je impact met de community!
              </p>
            </div>
          </div>
        </header>

        <section className="rounded-[2rem] bg-surface-container-low p-5 shadow-[0_20px_40px_rgba(54,50,45,0.04)] sm:p-8">
          {canRegister ? (
            <RegistrationForm
              interventions={data.interventions}
              orgId={data.context.org.id}
              orgSlug={data.context.org.slug}
              teams={data.teams}
              userId={data.context.userId}
            />
          ) : (
            <EmptyState canManage={data.context.role === "admin"} orgSlug={data.context.org.slug} />
          )}
        </section>
      </div>
    </main>
  );
}

function EmptyState({ canManage, orgSlug }: { canManage: boolean; orgSlug: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[1.5rem] bg-card px-6 py-10 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-primary-container text-primary shadow-sm">
        <Icon name="inventory_2" filled className="text-2xl" />
      </span>
      <p className="max-w-md text-sm text-muted-foreground">
        Voeg eerst teams en interventies toe in instellingen voordat je kunt registreren.
      </p>
      {canManage ? (
        <Button asChild variant="brand" className="min-h-11 rounded-full">
          <Link href={`/${orgSlug}/instellingen`}>
            <Icon name="settings" className="text-base" />
            Naar instellingen
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
