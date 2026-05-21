"use server";

import {
  categorySchema,
  interventionSchema,
  orgProfileSchema,
  orgSettingsSchema,
  provisionUserSchema,
  teamSchema,
} from "@/lib/admin-schema";
import { findOrCreateUserId } from "@/lib/admin-users";
import { getOrgContextBySlug } from "@/lib/organizations";
import { revalidateOrgPaths } from "@/lib/revalidate-org-paths";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Zorgt dat de huidige user beheer-acties in deze org mag uitvoeren. Dat mag
 * als je admin van de org bent, OF als je platform-superadmin bent (ook zonder
 * membership). Omdat de RLS-write-policies alleen tenant-admins toelaten,
 * krijgt een superadmin zonder admin-membership een service-role client terug
 * (`writer`) die RLS omzeilt. Org-admins blijven de gewone client gebruiken
 * zodat RLS als laatste verdedigingslinie actief blijft.
 */
async function requireAdmin(orgSlug: string) {
  const supabase = await createClient();
  const context = await getOrgContextBySlug(supabase, orgSlug);

  if (!context) {
    throw new Error("Je sessie is verlopen. Log opnieuw in.");
  }

  const isOrgAdmin = context.role === "admin";
  if (!isOrgAdmin && !context.isSuperadmin) {
    throw new Error("Alleen admins mogen deze actie uitvoeren.");
  }

  const writer = isOrgAdmin ? supabase : createServiceRoleClient();
  return { context, supabase, writer };
}

export async function createTeam(orgSlug: string, formData: FormData) {
  const { context, writer } = await requireAdmin(orgSlug);
  const input = teamSchema.parse({
    name: formData.get("name"),
  });

  await writer.from("teams").insert({
    org_id: context.org.id,
    name: input.name,
  });

  revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
}

export async function createCategory(orgSlug: string, formData: FormData) {
  const { context, writer } = await requireAdmin(orgSlug);
  const input = categorySchema.parse({
    name: formData.get("name"),
    color: formData.get("color"),
  });

  await writer.from("categories").insert({
    org_id: context.org.id,
    name: input.name,
    color: input.color,
  });

  revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
}

export async function createIntervention(orgSlug: string, formData: FormData) {
  const { context, writer } = await requireAdmin(orgSlug);
  const input = interventionSchema.parse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    ecoUnit: formData.get("ecoUnit"),
    socialUnit: formData.get("socialUnit"),
    co2FactorKg: formData.get("co2FactorKg"),
    socialScoreFactor: formData.get("socialScoreFactor"),
  });

  await writer.from("interventions").insert({
    org_id: context.org.id,
    category_id: input.categoryId,
    name: input.name,
    eco_unit: input.ecoUnit,
    social_unit: input.socialUnit,
    co2_factor_kg: input.co2FactorKg,
    social_score_factor: input.socialScoreFactor,
  });

  revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
}

export async function updateOrgProfile(orgSlug: string, formData: FormData) {
  const { context, writer } = await requireAdmin(orgSlug);
  const input = orgProfileSchema.parse({
    description: formData.get("description") ?? "",
    logoUrl: formData.get("logoUrl") ?? "",
    name: formData.get("name"),
  });

  await writer
    .from("organizations")
    .update({
      name: input.name,
      description: input.description ? input.description : null,
      logo_url: input.logoUrl ? input.logoUrl : null,
    })
    .eq("id", context.org.id);

  revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
}

export async function updateOrgSettings(orgSlug: string, formData: FormData) {
  const { context, writer } = await requireAdmin(orgSlug);
  const input = orgSettingsSchema.parse({
    publicShareEnabled: formData.get("publicShareEnabled") === "on",
    publicShareSlug: formData.get("publicShareSlug"),
    eodBaselineKg: formData.get("eodBaselineKg"),
    eodBaselineDate: formData.get("eodBaselineDate"),
  });

  const shareSlug = input.publicShareEnabled ? input.publicShareSlug : "";
  await writer
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
  const { context, writer } = await requireAdmin(orgSlug);
  const input = provisionUserSchema.parse({
    email: formData.get("email"),
    role: formData.get("role"),
    teamId: formData.get("teamId") || undefined,
  });

  const userId = await findOrCreateUserId(input.email);
  const { data: membership } = await writer
    .from("memberships")
    .select("id")
    .eq("org_id", context.org.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (!membership) {
    await writer.from("memberships").insert({
      org_id: context.org.id,
      user_id: userId,
      role: input.role,
    });
  }

  if (input.teamId) {
    const { data: teamMembership } = await writer
      .from("team_memberships")
      .select("id")
      .eq("org_id", context.org.id)
      .eq("user_id", userId)
      .eq("team_id", input.teamId)
      .maybeSingle();

    if (!teamMembership) {
      await writer.from("team_memberships").insert({
        org_id: context.org.id,
        user_id: userId,
        team_id: input.teamId,
      });
    }
  }

  revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
}
