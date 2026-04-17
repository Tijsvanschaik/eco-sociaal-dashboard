import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Dispatch authenticated visitors to their first organisation dashboard.
    const { data: membership } = await supabase
      .from("memberships")
      .select("org_id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (membership) {
      const { data: org } = await supabase
        .from("organizations")
        .select("slug")
        .eq("id", membership.org_id)
        .maybeSingle();
      if (org?.slug) {
        redirect(`/${org.slug}/dashboard`);
      }
    }
    // User is authed but has zero memberships: fall through to marketing landing.
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-start justify-center gap-6 px-6 py-12">
      <p className="text-sm font-medium text-muted-foreground">LEV Groep - MVP</p>
      <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
        Eco-sociaal Dashboard
      </h1>
      <p className="max-w-prose text-pretty text-lg text-muted-foreground">
        Registreer eco-sociale activiteiten, bereken de CO2-impact en zie hoe jullie Earth Overshoot
        Day opschuift.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/login">Inloggen</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/p/demo">Bekijk demo-dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
