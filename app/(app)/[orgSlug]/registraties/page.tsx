import { notFound } from "next/navigation";

import { tenantPageMainClassName } from "@/components/app-shell/tenant-page-layout";
import { RegistrationsList } from "@/components/registrations/registrations-list";
import { createClient } from "@/lib/supabase/server";
import { getTenantRegistrationsListData } from "@/lib/tenant-registrations-list-data";

type Params = Promise<{ orgSlug: string }>;
type SearchParams = Promise<{
  scope?: string | string[];
  team?: string | string[];
  year?: string | string[];
}>;

export default async function RegistratiesPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { orgSlug } = await params;
  const filters = await searchParams;
  const supabase = await createClient();
  const data = await getTenantRegistrationsListData(supabase, orgSlug, filters);
  if (!data) notFound();

  return (
    <main className={tenantPageMainClassName}>
      <RegistrationsList
        isAdmin={data.context.role === "admin"}
        orgSlug={orgSlug}
        rows={data.rows}
        scope={data.scope}
        selectedTeamId={data.selectedTeamId}
        teams={data.teams}
        years={data.years}
        year={data.year}
      />
    </main>
  );
}
