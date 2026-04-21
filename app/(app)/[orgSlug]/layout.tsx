import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { OrgSwitcher } from "@/components/org-switcher";
import { getOrgContextBySlug } from "@/lib/organizations";
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

  const context = await getOrgContextBySlug(supabase, orgSlug);
  if (!context) notFound();

  const { data: allOrgs } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .order("name", { ascending: true });

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b px-4 py-3">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold tracking-tight">Eco-sociaal</span>
            <span aria-hidden className="text-muted-foreground/50">
              /
            </span>
            <OrgSwitcher current={context.org} orgs={allOrgs ?? []} />
            <nav className="flex items-center gap-1 rounded-lg bg-muted p-1 text-sm">
              <Link
                className="rounded-md px-3 py-1.5 hover:bg-background"
                href={`/${orgSlug}/dashboard`}
              >
                Dashboard
              </Link>
              <Link
                className="rounded-md px-3 py-1.5 hover:bg-background"
                href={`/${orgSlug}/registratie`}
              >
                Registratie
              </Link>
              {context.role === "admin" && (
                <Link
                  className="rounded-md px-3 py-1.5 hover:bg-background"
                  href={`/${orgSlug}/instellingen`}
                >
                  Instellingen
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {context.isSuperadmin && (
              <Link
                className="text-sm text-muted-foreground hover:text-foreground"
                href="/superadmin"
              >
                Superadmin
              </Link>
            )}
            <span className="text-xs text-muted-foreground">
              {context.role === "admin" ? "Admin" : "Medewerker"}
            </span>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-sm text-muted-foreground hover:text-foreground">
                Uitloggen
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
