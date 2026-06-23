"use server";

import {
  archiveEntitySchema,
  categorySchema,
  categoryUpdateSchema,
  interventionSchema,
  interventionUpdateSchema,
  memberTeamUpdateSchema,
  membershipUpdateSchema,
  orgProfileSchema,
  orgSettingsSchema,
  provisionUserSchema,
  removeMemberSchema,
  teamSchema,
  teamUpdateSchema,
} from "@/lib/admin-schema";
import { findOrCreateUserId } from "@/lib/admin-users";
import { provisionOrgInvite } from "@/lib/auth/invite-membership";
import { checkInviteRateLimit } from "@/lib/auth/invite-rate-limit";
import { sendMagicLinkEmail } from "@/lib/auth/send-magic-link-email";
import { getPublicSupabaseEnv } from "@/lib/env";
import { getOrgContextBySlug } from "@/lib/organizations";
import {
  ORG_LOGOS_BUCKET,
  buildOrgLogoStoragePath,
  extractOrgLogoStoragePath,
  getOrgLogoPublicUrl,
  validateOrgLogoFile,
} from "@/lib/organizations/logo-upload";
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

export async function updateTeam(orgSlug: string, formData: FormData) {
  const { context, writer } = await requireAdmin(orgSlug);
  const input = teamUpdateSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
  });

  await writer
    .from("teams")
    .update({ name: input.name })
    .eq("org_id", context.org.id)
    .eq("id", input.id);

  revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
}

export async function archiveTeam(orgSlug: string, teamId: string) {
  const { context, writer } = await requireAdmin(orgSlug);
  const input = archiveEntitySchema.parse({ id: teamId });

  const { count } = await writer
    .from("team_memberships")
    .select("id", { count: "exact", head: true })
    .eq("org_id", context.org.id)
    .eq("team_id", input.id);

  if ((count ?? 0) > 0) {
    throw new Error("Verplaats of verwijder eerst de medewerkers in dit team.");
  }

  await writer
    .from("teams")
    .update({ is_archived: true })
    .eq("org_id", context.org.id)
    .eq("id", input.id);

  revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
}

async function countOrgAdmins(
  writer: Awaited<ReturnType<typeof requireAdmin>>["writer"],
  orgId: string,
) {
  const { count } = await writer
    .from("memberships")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("role", "admin");

  return count ?? 0;
}

export async function updateMembership(orgSlug: string, formData: FormData) {
  const { context, writer } = await requireAdmin(orgSlug);
  const input = membershipUpdateSchema.parse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  const { data: membership } = await writer
    .from("memberships")
    .select("role")
    .eq("org_id", context.org.id)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (!membership) {
    throw new Error("Lid niet gevonden in deze organisatie.");
  }

  if (membership.role === "admin" && input.role !== "admin") {
    const adminCount = await countOrgAdmins(writer, context.org.id);
    if (adminCount <= 1) {
      throw new Error("Je kunt de laatste admin niet demoten.");
    }
  }

  if (input.role === "worker") {
    const { count } = await writer
      .from("team_memberships")
      .select("id", { count: "exact", head: true })
      .eq("org_id", context.org.id)
      .eq("user_id", input.userId);

    if ((count ?? 0) === 0) {
      throw new Error("Kies eerst een team voordat je iemand medewerker maakt.");
    }
  }

  await writer
    .from("memberships")
    .update({ role: input.role })
    .eq("org_id", context.org.id)
    .eq("user_id", input.userId);

  revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
}

export async function updateMemberTeam(orgSlug: string, formData: FormData) {
  const { context, writer } = await requireAdmin(orgSlug);
  const input = memberTeamUpdateSchema.parse({
    userId: formData.get("userId"),
    teamId: formData.get("teamId"),
  });

  const { data: membership } = await writer
    .from("memberships")
    .select("role")
    .eq("org_id", context.org.id)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (!membership) {
    throw new Error("Lid niet gevonden in deze organisatie.");
  }

  if (membership.role !== "worker") {
    throw new Error("Alleen medewerkers kunnen aan een team worden gekoppeld.");
  }

  const { data: team } = await writer
    .from("teams")
    .select("id")
    .eq("org_id", context.org.id)
    .eq("id", input.teamId)
    .eq("is_archived", false)
    .maybeSingle();

  if (!team) {
    throw new Error("Kies een geldig team.");
  }

  await writer
    .from("team_memberships")
    .delete()
    .eq("org_id", context.org.id)
    .eq("user_id", input.userId);

  await writer.from("team_memberships").insert({
    org_id: context.org.id,
    user_id: input.userId,
    team_id: input.teamId,
  });

  revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
}

export async function removeMember(orgSlug: string, userId: string) {
  const { context, writer } = await requireAdmin(orgSlug);
  const input = removeMemberSchema.parse({ userId });

  const { data: membership } = await writer
    .from("memberships")
    .select("role")
    .eq("org_id", context.org.id)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (!membership) {
    throw new Error("Lid niet gevonden in deze organisatie.");
  }

  if (membership.role === "admin") {
    const adminCount = await countOrgAdmins(writer, context.org.id);
    if (adminCount <= 1) {
      throw new Error("Je kunt de laatste admin niet verwijderen.");
    }
  }

  await writer
    .from("team_memberships")
    .delete()
    .eq("org_id", context.org.id)
    .eq("user_id", input.userId);

  await writer
    .from("memberships")
    .delete()
    .eq("org_id", context.org.id)
    .eq("user_id", input.userId);

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

export async function updateCategory(orgSlug: string, formData: FormData) {
  const { context, writer } = await requireAdmin(orgSlug);
  const input = categoryUpdateSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    color: formData.get("color"),
  });

  await writer
    .from("categories")
    .update({
      name: input.name,
      color: input.color,
    })
    .eq("org_id", context.org.id)
    .eq("id", input.id);

  revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
}

export async function archiveCategory(orgSlug: string, categoryId: string) {
  const { context, writer } = await requireAdmin(orgSlug);
  const input = archiveEntitySchema.parse({ id: categoryId });

  const { count } = await writer
    .from("interventions")
    .select("id", { count: "exact", head: true })
    .eq("org_id", context.org.id)
    .eq("category_id", input.id)
    .eq("is_archived", false);

  if ((count ?? 0) > 0) {
    throw new Error("Archiveer of verwijder eerst de actieve activiteiten in deze categorie.");
  }

  await writer
    .from("categories")
    .update({ is_archived: true })
    .eq("org_id", context.org.id)
    .eq("id", input.id);

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

export async function updateIntervention(orgSlug: string, formData: FormData) {
  const { context, writer } = await requireAdmin(orgSlug);
  const input = interventionUpdateSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    ecoUnit: formData.get("ecoUnit"),
    socialUnit: formData.get("socialUnit"),
    co2FactorKg: formData.get("co2FactorKg"),
    socialScoreFactor: formData.get("socialScoreFactor"),
  });

  await writer
    .from("interventions")
    .update({
      category_id: input.categoryId,
      name: input.name,
      eco_unit: input.ecoUnit,
      social_unit: input.socialUnit,
      co2_factor_kg: input.co2FactorKg,
      social_score_factor: input.socialScoreFactor,
    })
    .eq("org_id", context.org.id)
    .eq("id", input.id);

  revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
}

export async function archiveIntervention(orgSlug: string, interventionId: string) {
  const { context, writer } = await requireAdmin(orgSlug);
  const input = archiveEntitySchema.parse({ id: interventionId });

  await writer
    .from("interventions")
    .update({ is_archived: true })
    .eq("org_id", context.org.id)
    .eq("id", input.id);

  revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
}

export async function updateOrgProfile(orgSlug: string, formData: FormData) {
  const { context, writer } = await requireAdmin(orgSlug);
  const input = orgProfileSchema.parse({
    description: formData.get("description") ?? "",
    impactDisclaimer: formData.get("impactDisclaimer") ?? "",
    missionShort: formData.get("missionShort") ?? "",
    name: formData.get("name"),
  });

  await writer
    .from("organizations")
    .update({
      name: input.name,
      description: input.description ? input.description : null,
      impact_disclaimer: input.impactDisclaimer ? input.impactDisclaimer : null,
      mission_short: input.missionShort ? input.missionShort : null,
    })
    .eq("id", context.org.id);

  revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
}

async function deleteManagedOrgLogo(
  writer: Awaited<ReturnType<typeof createClient>>,
  logoUrl: string | null | undefined,
  orgId: string,
) {
  const { NEXT_PUBLIC_SUPABASE_URL } = getPublicSupabaseEnv();
  const storagePath = logoUrl
    ? extractOrgLogoStoragePath(logoUrl, orgId, NEXT_PUBLIC_SUPABASE_URL)
    : null;
  if (!storagePath) return;

  const { error } = await writer.storage.from(ORG_LOGOS_BUCKET).remove([storagePath]);
  if (error) {
    console.error("[org-logo] delete failed", error.message);
  }
}

export async function uploadOrgLogo(orgSlug: string, formData: FormData) {
  const { context, writer } = await requireAdmin(orgSlug);
  const file = formData.get("logo");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Kies een logo-bestand.");
  }

  const validation = validateOrgLogoFile(file);
  if (!validation.ok) {
    throw new Error(validation.message);
  }

  const storagePath = buildOrgLogoStoragePath(context.org.id, file);
  const { error: uploadError } = await writer.storage
    .from(ORG_LOGOS_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "86400",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("[org-logo] upload failed", uploadError.message);
    throw new Error("Logo uploaden lukte niet. Probeer het nog eens.");
  }

  const { NEXT_PUBLIC_SUPABASE_URL } = getPublicSupabaseEnv();
  const publicUrl = getOrgLogoPublicUrl(NEXT_PUBLIC_SUPABASE_URL, storagePath);
  const previousLogoUrl = context.org.logoUrl;

  const { error: updateError } = await writer
    .from("organizations")
    .update({ logo_url: publicUrl })
    .eq("id", context.org.id);

  if (updateError) {
    await writer.storage.from(ORG_LOGOS_BUCKET).remove([storagePath]);
    console.error("[org-logo] profile update failed", updateError.message);
    throw new Error("Logo kon niet worden opgeslagen.");
  }

  await deleteManagedOrgLogo(writer, previousLogoUrl, context.org.id);
  revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);

  return { logoUrl: publicUrl };
}

export async function removeOrgLogo(orgSlug: string) {
  const { context, writer } = await requireAdmin(orgSlug);
  if (!context.org.logoUrl) return;

  await deleteManagedOrgLogo(writer, context.org.logoUrl, context.org.id);

  await writer.from("organizations").update({ logo_url: null }).eq("id", context.org.id);

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
  const { context } = await requireAdmin(orgSlug);
  const input = provisionUserSchema.parse({
    email: formData.get("email"),
    role: formData.get("role"),
    teamId: formData.get("teamId") || undefined,
  });

  const rateLimit = await checkInviteRateLimit(input.email, context.org.slug);
  if (!rateLimit.allowed) {
    throw new Error(rateLimit.message);
  }

  const userId = await findOrCreateUserId(input.email);

  try {
    await provisionOrgInvite({
      orgId: context.org.id,
      orgSlug: context.org.slug,
      role: input.role,
      teamId: input.teamId,
      userId,
    });
  } catch (error) {
    console.error("provisionUser invite error:", error);
    throw new Error("Medewerker kon niet worden gekoppeld aan deze organisatie.");
  }

  const inviteResult = await sendMagicLinkEmail({
    email: input.email,
    kind: "member_invite",
    orgName: context.org.name,
    redirectPath: `/${context.org.slug}/dashboard`,
  });
  if (!inviteResult.ok) {
    throw new Error(
      "Medewerker is toegevoegd, maar de uitnodigingsmail kon niet worden verstuurd.",
    );
  }

  revalidateOrgPaths(context.org.slug, context.org.publicShareSlug);
}
