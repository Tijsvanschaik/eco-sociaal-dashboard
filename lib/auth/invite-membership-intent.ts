import type { User } from "@supabase/supabase-js";

export type OrgInviteIntent = {
  orgId: string;
  orgSlug: string;
  role: "admin" | "worker";
  teamId?: string;
  userId: string;
};

export const PENDING_ORG_SLUG = "pending_org_slug";
export const PENDING_ORG_ROLE = "pending_org_role";
export const PENDING_TEAM_ID = "pending_team_id";

export function parsePendingInviteIntent(
  user: Pick<User, "id" | "user_metadata">,
): OrgInviteIntent | null {
  const meta = user.user_metadata ?? {};
  const orgSlug = meta[PENDING_ORG_SLUG];
  if (typeof orgSlug !== "string" || !orgSlug.trim()) return null;

  const role = meta[PENDING_ORG_ROLE] === "admin" ? "admin" : "worker";
  const teamIdRaw = meta[PENDING_TEAM_ID];
  const teamId = typeof teamIdRaw === "string" && teamIdRaw.length > 0 ? teamIdRaw : undefined;

  return {
    orgId: "",
    orgSlug,
    role,
    teamId,
    userId: user.id,
  };
}
