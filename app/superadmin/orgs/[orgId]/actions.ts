"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { isCurrentUserSuperadmin } from "@/lib/organizations";
import { revalidateOrgPaths } from "@/lib/revalidate-org-paths";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export type SuperadminClearRegistrationsResult = { ok: true } | { ok: false; message: string };

/** Verwijdert alle registraties van één tenant. Alleen platform-superadmin. */
export async function superadminClearOrgRegistrations(
  orgId: string,
): Promise<SuperadminClearRegistrationsResult> {
  const parsed = z.string().uuid().safeParse(orgId.trim());
  if (!parsed.success) {
    return { ok: false, message: "Ongeldige organisatie." };
  }

  const supabase = await createClient();
  if (!(await isCurrentUserSuperadmin(supabase))) {
    return { ok: false, message: "Alleen platform-superadmins mogen dit uitvoeren." };
  }

  const { data: org, error: orgSelErr } = await supabase
    .from("organizations")
    .select("id, slug, public_share_slug")
    .eq("id", parsed.data)
    .maybeSingle();

  if (orgSelErr || !org?.slug) {
    return { ok: false, message: "Organisatie niet gevonden." };
  }

  const svc = createServiceRoleClient();
  const { error: delErr } = await svc.from("registrations").delete().eq("org_id", org.id);

  if (delErr) {
    return { ok: false, message: delErr.message };
  }

  revalidatePath("/superadmin");
  revalidatePath(`/superadmin/orgs/${org.id}`);
  revalidateOrgPaths(org.slug, org.public_share_slug ?? null);

  return { ok: true };
}
