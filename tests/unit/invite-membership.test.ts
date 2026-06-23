import { describe, expect, it } from "vitest";

import { parsePendingInviteIntent } from "@/lib/auth/invite-membership-intent";

describe("parsePendingInviteIntent", () => {
  it("returns null when no pending invite metadata is present", () => {
    expect(
      parsePendingInviteIntent({
        id: "user-1",
        user_metadata: {},
      }),
    ).toBeNull();
  });

  it("parses worker invite metadata with team", () => {
    expect(
      parsePendingInviteIntent({
        id: "user-1",
        user_metadata: {
          pending_org_slug: "lev-groep",
          pending_org_role: "worker",
          pending_team_id: "team-1",
        },
      }),
    ).toEqual({
      orgId: "",
      orgSlug: "lev-groep",
      role: "worker",
      teamId: "team-1",
      userId: "user-1",
    });
  });

  it("defaults role to worker and ignores empty team id", () => {
    expect(
      parsePendingInviteIntent({
        id: "user-2",
        user_metadata: {
          pending_org_slug: "lev-groep",
          pending_org_role: "unknown",
          pending_team_id: "",
        },
      }),
    ).toEqual({
      orgId: "",
      orgSlug: "lev-groep",
      role: "worker",
      teamId: undefined,
      userId: "user-2",
    });
  });
});
