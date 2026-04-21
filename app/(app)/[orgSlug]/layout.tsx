import { notFound, redirect } from "next/navigation";

import { TenantAppShell } from "@/components/app-shell/tenant-app-shell";
import { getOrgContextBySlug } from "@/lib/organizations";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ orgSlug: string }>;

// Tenant-scoped shell. `getOrgContextBySlug` returns null when the org does not
// exist, the slug/id is wrong, or the user may not access that tenant — we answer
// with 404 to avoid leaking org existence.
export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { orgSlug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(`/${orgSlug}`)}`);
  }

  const context = await getOrgContextBySlug(supabase, orgSlug);
  if (!context) notFound();

  const { data: allOrgs } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .order("name", { ascending: true });

  const userDisplayName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email ??
    "Medewerker";

  return (
    <TenantAppShell
      org={context.org}
      memberRole={context.role}
      isSuperadmin={context.isSuperadmin}
      userDisplayName={userDisplayName}
      switchableOrgs={allOrgs ?? []}
    >
      {children}
    </TenantAppShell>
  );
}
