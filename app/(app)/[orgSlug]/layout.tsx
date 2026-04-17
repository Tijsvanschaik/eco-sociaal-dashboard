import { notFound, redirect } from "next/navigation";

import { OrgSwitcher } from "@/components/org-switcher";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ orgSlug: string }>;

// Tenant-scoped shell. RLS guarantees we only see orgs the user is a member of,
// so a `maybeSingle()` miss means either "no such org" OR "user is not a member" -
// both answered with a 404 to avoid leaking org existence.
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

  const { data: currentOrg } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", orgSlug)
    .maybeSingle();
  if (!currentOrg) {
    notFound();
  }

  const { data: allOrgs } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .order("name", { ascending: true });

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-tight">Eco-sociaal</span>
          <span aria-hidden className="text-muted-foreground/50">
            /
          </span>
          <OrgSwitcher current={currentOrg} orgs={allOrgs ?? []} />
        </div>
        <form action="/auth/signout" method="post">
          <button type="submit" className="text-sm text-muted-foreground hover:text-foreground">
            Uitloggen
          </button>
        </form>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
