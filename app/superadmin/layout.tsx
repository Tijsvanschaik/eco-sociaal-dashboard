import Link from "next/link";
import { notFound, redirect } from "next/navigation";

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

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold tracking-tight">Superadmin</p>
            <p className="text-xs text-muted-foreground">Platform-overzicht en organisatiebeheer</p>
          </div>
          <div className="flex items-center gap-4">
            <Link className="text-sm text-muted-foreground hover:text-foreground" href="/">
              Naar app
            </Link>
            <form action="/auth/signout" method="post">
              <button className="text-sm text-muted-foreground hover:text-foreground" type="submit">
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
