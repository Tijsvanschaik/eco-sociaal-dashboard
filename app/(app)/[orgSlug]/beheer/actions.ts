"use server";

import {
  categorySchema,
  interventionSchema,
  locationSchema,
  orgSettingsSchema,
  provisionUserSchema,
  teamSchema,
} from "@/lib/admin-schema";
import { findOrCreateUserId } from "@/lib/admin-users";
import { getOrgContextBySlug } from "@/lib/organizations";
import { revalidateOrgPaths } from "@/lib/revalidate-org-paths";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin(orgSlug: string) {
  const supabase = await createClient();
  const context = await getOrgContextBySlug(supabase, orgSlug);

  if (!context || context.role !== "admin") {
    throw new Error("Alleen admins mogen deze actie uitvoeren.");
  }

  return { context, supabase };
}

export async function createLocation(orgSlug: string, formData: FormData) {
  const { context, supabase } = await requireAdmin(orgSlug);
  const input = locationSchema.parse({
    name: formData.get("name"),
    isInternal: formData.get("isInternal") === "on",
  });

  await supabase.from("locations").insert({
    org_id: context.org.id,
    name: input.name,
    is_internal: input.isInternal,
  });

  revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
}

export async function createTeam(orgSlug: string, formData: FormData) {
  const { context, supabase } = await requireAdmin(orgSlug);
  const input = teamSchema.parse({
    name: formData.get("name"),
    locationId: formData.get("locationId"),
  });

  await supabase.from("teams").insert({
    org_id: context.org.id,
    location_id: input.locationId,
    name: input.name,
  });

  revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
}

export async function createCategory(orgSlug: string, formData: FormData) {
  const { context, supabase } = await requireAdmin(orgSlug);
  const input = categorySchema.parse({
    name: formData.get("name"),
    color: formData.get("color"),
  });

  await supabase.from("categories").insert({
    org_id: context.org.id,
    name: input.name,
    color: input.color,
  });

  revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
}

export async function createIntervention(orgSlug: string, formData: FormData) {
  const { context, supabase } = await requireAdmin(orgSlug);
  const input = interventionSchema.parse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    unit: formData.get("unit"),
    co2FactorKg: formData.get("co2FactorKg"),
  });

  await supabase.from("interventions").insert({
    org_id: context.org.id,
    category_id: input.categoryId,
    name: input.name,
    unit: input.unit,
    co2_factor_kg: input.co2FactorKg,
  });

  revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
}

export async function updateOrgSettings(orgSlug: string, formData: FormData) {
  const { context, supabase } = await requireAdmin(orgSlug);
  const input = orgSettingsSchema.parse({
    publicShareEnabled: formData.get("publicShareEnabled") === "on",
    publicShareSlug: formData.get("publicShareSlug"),
    eodBaselineKg: formData.get("eodBaselineKg"),
    eodBaselineDate: formData.get("eodBaselineDate"),
  });

  const shareSlug = input.publicShareEnabled ? input.publicShareSlug : "";
  await supabase
    .from("organizations")
    .update({
      public_share_enabled: input.publicShareEnabled,
      public_share_slug: shareSlug || null,
      eod_baseline_kg: input.eodBaselineKg === "" ? null : input.eodBaselineKg,
      eod_baseline_date: input.eodBaselineDate || null,
    })
    .eq("id", context.org.id);

  revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
  if (shareSlug && shareSlug !== context.org.publicShareSlug) {
    revalidateOrgPaths(context.org.slug, shareSlug);
  }
}

export async function provisionUser(orgSlug: string, formData: FormData) {
  const { context, supabase } = await requireAdmin(orgSlug);
  const input = provisionUserSchema.parse({
    email: formData.get("email"),
    role: formData.get("role"),
    teamId: formData.get("teamId") || undefined,
  });

  const userId = await findOrCreateUserId(input.email);
  const { data: membership } = await supabase
    .from("memberships")
    .select("id")
    .eq("org_id", context.org.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (!membership) {
    await supabase.from("memberships").insert({
      org_id: context.org.id,
      user_id: userId,
      role: input.role,
    });
  }

  if (input.teamId) {
    const { data: teamMembership } = await supabase
      .from("team_memberships")
      .select("id")
      .eq("org_id", context.org.id)
      .eq("user_id", userId)
      .eq("team_id", input.teamId)
      .maybeSingle();

    if (!teamMembership) {
      await supabase.from("team_memberships").insert({
        org_id: context.org.id,
        user_id: userId,
        team_id: input.teamId,
      });
    }
  }

  revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
}
