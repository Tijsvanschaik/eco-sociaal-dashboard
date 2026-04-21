import { redirect } from "next/navigation";

import { getDefaultAuthedPath } from "@/lib/organizations";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const nextPath = await getDefaultAuthedPath(supabase);
  if (nextPath) {
    redirect(nextPath);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-4 px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Nog geen toegang gekoppeld</h1>
      <p className="text-sm text-muted-foreground">
        Je bent ingelogd, maar hebt nog geen organisatie-lidmaatschap en ook geen superadmin-rol.
        Neem contact op met een beheerder om toegang te krijgen.
      </p>
    </main>
  );
}
