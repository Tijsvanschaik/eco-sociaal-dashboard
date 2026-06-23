import Link from "next/link";
import { notFound } from "next/navigation";

import { tenantPageMainClassName } from "@/components/app-shell/tenant-page-layout";
import { RegistrationForm } from "@/components/registration/registration-form";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/server";
import { getTenantRegistrationEditData } from "@/lib/tenant-registration-edit-data";

type Params = Promise<{ id: string; orgSlug: string }>;

export default async function EditActivityPage({ params }: { params: Params }) {
  const { orgSlug, id } = await params;
  const supabase = await createClient();
  const data = await getTenantRegistrationEditData(supabase, orgSlug, id);
  if (!data) notFound();

  return (
    <main className={tenantPageMainClassName}>
      <header className="space-y-4">
        <Button
          asChild
          variant="outline"
          className="min-h-10 rounded-full border-border/60 bg-card"
        >
          <Link href={`/${orgSlug}/activiteiten`}>
            <Icon name="arrow_back" className="text-base" />
            Terug naar registraties
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Registratie <span className="text-primary">bewerken</span>
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Pas activiteit, hoeveelheden, datum, notitie of foto aan.
          </p>
        </div>
      </header>

      <RegistrationForm
        initialPhotoUrl={data.initialPhotoUrl}
        initialValues={data.initialValues}
        interventions={data.interventions}
        mode="edit"
        orgId={data.context.org.id}
        orgSlug={data.context.org.slug}
        registrationId={data.registrationId}
        teams={data.teams}
        userId={data.context.userId}
      />
    </main>
  );
}
