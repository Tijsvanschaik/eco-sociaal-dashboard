import { notFound, redirect } from "next/navigation";

import { PlatformAppShell } from "@/components/app-shell/platform-app-shell";
import { isCurrentUserSuperadmin } from "@/lib/organizations";
import { createClient } from "@/lib/supabase/server";

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/superadmin");
  }

  if (!(await isCurrentUserSuperadmin(supabase))) {
    notFound();
  }

  // Via RLS zien we alleen orgs waar de superadmin lid van is. Dat is precies
  // wat we willen voor de "Terug naar app"-link in de footer.
  const { data: firstMembership } = await supabase
    .from("memberships")
    .select("org_id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  let fallbackOrgSlug: string | null = null;
  if (firstMembership?.org_id) {
    const { data: org } = await supabase
      .from("organizations")
      .select("slug")
      .eq("id", firstMembership.org_id)
      .maybeSingle();
    fallbackOrgSlug = org?.slug ?? null;
  }

  const userDisplayName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email ??
    "Superadmin";

  return (
    <PlatformAppShell userDisplayName={userDisplayName} fallbackOrgSlug={fallbackOrgSlug}>
      {children}
    </PlatformAppShell>
  );
}
