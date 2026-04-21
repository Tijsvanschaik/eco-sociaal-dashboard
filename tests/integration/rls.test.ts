import type { SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Database } from "@/supabase/types/supabase";

import { adminClient, anonClient, signedInClient } from "./supabase";

// Fixture handles populated by `beforeAll` so individual tests can use them.
type Fixtures = {
  orgA: { id: string; slug: string };
  orgB: { id: string; slug: string };
  teamA1: { id: string };
  teamA2: { id: string };
  interventionA: { id: string };
  categoryA: { id: string };
  users: {
    workerA1: { id: string; email: string; password: string };
    workerA2: { id: string; email: string; password: string };
    adminA: { id: string; email: string; password: string };
    superadmin: { id: string; email: string; password: string };
    workerB: { id: string; email: string; password: string };
  };
  // One registration owned by workerA2 in teamA2 — targeted by other tests.
  registrationA2: { id: string };
};

const SLUG_PREFIX = "rls-test";
const PASSWORD = "rls-test-password-123!";
const EMAIL_DOMAIN = "rls-test.example.com";

// Teardown cleans up by slug-prefix / email-domain so a partial previous run
// cannot leave poisoned rows around.
async function purgeByPrefix(admin: SupabaseClient<Database>): Promise<void> {
  const { data: orgs } = await admin
    .from("organizations")
    .select("id")
    .like("slug", `${SLUG_PREFIX}-%`);
  if (orgs) {
    for (const org of orgs) {
      await admin.from("organizations").delete().eq("id", org.id);
    }
  }

  const { data: userList } = await admin.auth.admin.listUsers({ perPage: 200 });
  for (const user of userList?.users ?? []) {
    if (user.email?.endsWith(`@${EMAIL_DOMAIN}`)) {
      await admin.auth.admin.deleteUser(user.id);
    }
  }
}

async function setupFixtures(): Promise<Fixtures> {
  const admin = adminClient();
  await purgeByPrefix(admin);

  // --- Orgs ---
  const { data: orgA, error: orgAErr } = await admin
    .from("organizations")
    .insert({
      name: "RLS Test A",
      slug: `${SLUG_PREFIX}-a`,
      public_share_enabled: true,
      public_share_slug: `${SLUG_PREFIX}-a`,
      eod_baseline_kg: 10_000,
      eod_baseline_date: "2024-01-01",
    })
    .select("id, slug")
    .single();
  if (orgAErr || !orgA) throw orgAErr ?? new Error("orgA insert failed");

  const { data: orgB, error: orgBErr } = await admin
    .from("organizations")
    .insert({
      name: "RLS Test B",
      slug: `${SLUG_PREFIX}-b`,
      public_share_enabled: false,
      eod_baseline_kg: 10_000,
      eod_baseline_date: "2024-01-01",
    })
    .select("id, slug")
    .single();
  if (orgBErr || !orgB) throw orgBErr ?? new Error("orgB insert failed");

  // --- Locations + teams ---
  const { data: locA } = await admin
    .from("locations")
    .insert({ org_id: orgA.id, name: "Loc A" })
    .select("id")
    .single();
  if (!locA) throw new Error("locA insert failed");

  const { data: teamA1 } = await admin
    .from("teams")
    .insert({ org_id: orgA.id, location_id: locA.id, name: "Team A1" })
    .select("id")
    .single();
  const { data: teamA2 } = await admin
    .from("teams")
    .insert({ org_id: orgA.id, location_id: locA.id, name: "Team A2" })
    .select("id")
    .single();
  if (!teamA1 || !teamA2) throw new Error("team insert failed");

  // --- Category + intervention in orgA ---
  const { data: categoryA } = await admin
    .from("categories")
    .insert({ org_id: orgA.id, name: "Test Cat", color: "#000000" })
    .select("id")
    .single();
  if (!categoryA) throw new Error("category insert failed");

  const { data: interventionA } = await admin
    .from("interventions")
    .insert({
      org_id: orgA.id,
      category_id: categoryA.id,
      name: "Test Intervention",
      unit: "kg",
      co2_factor_kg: 1,
    })
    .select("id")
    .single();
  if (!interventionA) throw new Error("intervention insert failed");

  // --- Users via auth admin API ---
  async function createUser(slug: string) {
    const email = `${slug}@${EMAIL_DOMAIN}`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
    });
    if (error || !data.user) throw error ?? new Error(`createUser ${email} failed`);
    return { id: data.user.id, email, password: PASSWORD };
  }

  const workerA1 = await createUser(`${SLUG_PREFIX}-worker-a1`);
  const workerA2 = await createUser(`${SLUG_PREFIX}-worker-a2`);
  const adminA = await createUser(`${SLUG_PREFIX}-admin-a`);
  const superadmin = await createUser(`${SLUG_PREFIX}-superadmin`);
  const workerB = await createUser(`${SLUG_PREFIX}-worker-b`);

  // --- Memberships ---
  await admin.from("memberships").insert([
    { org_id: orgA.id, user_id: workerA1.id, role: "worker" },
    { org_id: orgA.id, user_id: workerA2.id, role: "worker" },
    { org_id: orgA.id, user_id: adminA.id, role: "admin" },
    { org_id: orgB.id, user_id: workerB.id, role: "worker" },
  ]);

  await admin.from("team_memberships").insert([
    { org_id: orgA.id, team_id: teamA1.id, user_id: workerA1.id },
    { org_id: orgA.id, team_id: teamA2.id, user_id: workerA2.id },
    // adminA is NOT in any team - proves admin bypass works via role check.
  ]);
  await admin.from("platform_admins").insert({ user_id: superadmin.id });

  // --- One seed registration so anon-SELECT tests have a row to find ---
  const { data: reg } = await admin
    .from("registrations")
    .insert({
      org_id: orgA.id,
      team_id: teamA2.id,
      intervention_id: interventionA.id,
      user_id: workerA2.id,
      quantity: 5,
      happened_on: new Date().toISOString().slice(0, 10),
      co2_kg_cached: 5,
    })
    .select("id")
    .single();
  if (!reg) throw new Error("registration insert failed");

  return {
    orgA,
    orgB,
    teamA1: { id: teamA1.id },
    teamA2: { id: teamA2.id },
    interventionA: { id: interventionA.id },
    categoryA: { id: categoryA.id },
    users: { workerA1, workerA2, adminA, superadmin, workerB },
    registrationA2: { id: reg.id },
  };
}

let fx: Fixtures;

beforeAll(async () => {
  const probe = anonClient();
  const { error: viewError } = await probe
    .from("public_dashboard_totals")
    .select("org_id")
    .limit(1);
  if (viewError?.code === "42501" && viewError.message.includes("registrations")) {
    throw new Error(
      "Database view `public_dashboard_totals` is outdated: anon cannot read it (missing `app_public_org_active_user_count` fix). Re-run the current `supabase/sql/0002_views.sql` in the Supabase SQL Editor, then run integration tests again.",
    );
  }

  fx = await setupFixtures();
});

afterAll(async () => {
  await purgeByPrefix(adminClient());
});

describe("RLS - public views", () => {
  it("anon can read public_dashboard_totals for a public-enabled org", async () => {
    const anon = anonClient();
    const { data, error } = await anon
      .from("public_dashboard_totals")
      .select("*")
      .eq("org_id", fx.orgA.id)
      .maybeSingle();
    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data?.registration_count).toBeGreaterThanOrEqual(1);
  });

  it("anon can read public_dashboard_timeseries for a public-enabled org", async () => {
    const anon = anonClient();
    const { data, error } = await anon
      .from("public_dashboard_timeseries")
      .select("*")
      .eq("org_id", fx.orgA.id);

    expect(error).toBeNull();
    expect((data ?? []).length).toBeGreaterThanOrEqual(1);
  });

  it("anon sees NO rows in public views for a non-public org", async () => {
    const anon = anonClient();
    const { data, error } = await anon
      .from("public_dashboard_totals")
      .select("*")
      .eq("org_id", fx.orgB.id);
    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  it("anon sees no timeseries rows for a non-public org", async () => {
    const anon = anonClient();
    const { data, error } = await anon
      .from("public_dashboard_timeseries")
      .select("*")
      .eq("org_id", fx.orgB.id);

    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });
});

describe("RLS - sensitive columns", () => {
  it("anon cannot read user_id / photo_path / note from registrations", async () => {
    const anon = anonClient();
    // Column-level GRANT: anon must not be able to SELECT sensitive columns.
    const { error } = await anon
      .from("registrations")
      .select("user_id, photo_path, note")
      .eq("org_id", fx.orgA.id);
    expect(error).toBeTruthy();
  });

  it("anon CAN read allowed columns from registrations in a public org", async () => {
    const anon = anonClient();
    const { data, error } = await anon
      .from("registrations")
      .select("id, org_id, team_id, intervention_id, quantity, happened_on, co2_kg_cached")
      .eq("org_id", fx.orgA.id);
    expect(error).toBeNull();
    expect(data ?? []).not.toHaveLength(0);
  });

  it("anon sees nothing from raw registrations of a non-public org", async () => {
    const anon = anonClient();
    const { data, error } = await anon
      .from("registrations")
      .select("id, org_id, quantity")
      .eq("org_id", fx.orgB.id);
    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });
});

describe("RLS - tenant isolation", () => {
  it("worker cannot read organizations they are not a member of", async () => {
    const client = await signedInClient(fx.users.workerA1.email, PASSWORD);
    const { data, error } = await client
      .from("organizations")
      .select("id, slug")
      .in("id", [fx.orgA.id, fx.orgB.id]);
    expect(error).toBeNull();
    // Worker A1 is in org A only; RLS should strip org B.
    const slugs = (data ?? []).map((r) => r.slug);
    expect(slugs).toContain(fx.orgA.slug);
    expect(slugs).not.toContain(fx.orgB.slug);
  });

  it("worker cannot read memberships of other orgs", async () => {
    const client = await signedInClient(fx.users.workerA1.email, PASSWORD);
    const { data, error } = await client
      .from("memberships")
      .select("id, org_id, user_id")
      .eq("org_id", fx.orgB.id);
    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });
});

describe("RLS - superadmin", () => {
  it("superadmin can read organizations and memberships across orgs", async () => {
    const client = await signedInClient(fx.users.superadmin.email, PASSWORD);
    const [{ data: orgs, error: orgError }, { data: memberships, error: membershipsError }] =
      await Promise.all([
        client.from("organizations").select("id, slug").in("id", [fx.orgA.id, fx.orgB.id]),
        client.from("memberships").select("org_id, user_id").in("org_id", [fx.orgA.id, fx.orgB.id]),
      ]);

    expect(orgError).toBeNull();
    expect(membershipsError).toBeNull();
    expect((orgs ?? []).map((org) => org.slug)).toEqual(
      expect.arrayContaining([fx.orgA.slug, fx.orgB.slug]),
    );
    expect((memberships ?? []).map((membership) => membership.org_id)).toEqual(
      expect.arrayContaining([fx.orgA.id, fx.orgB.id]),
    );
  });

  it("superadmin cannot write tenant data without explicit org admin rights", async () => {
    const client = await signedInClient(fx.users.superadmin.email, PASSWORD);

    const { error: insertError } = await client.from("locations").insert({
      org_id: fx.orgB.id,
      name: "Should Fail",
    });
    expect(insertError).toBeTruthy();

    const { data: updatedOrgs, error: updateError } = await client
      .from("organizations")
      .update({ public_share_enabled: true })
      .eq("id", fx.orgB.id)
      .select("id");
    expect(updateError).toBeNull();
    expect(updatedOrgs ?? []).toHaveLength(0);

    const { data: deletedMemberships, error: deleteError } = await client
      .from("memberships")
      .delete()
      .eq("org_id", fx.orgB.id)
      .select("id");
    expect(deleteError).toBeNull();
    expect(deletedMemberships ?? []).toHaveLength(0);
  });

  it("non-superadmin cannot read platform_admin rows", async () => {
    const client = await signedInClient(fx.users.adminA.email, PASSWORD);
    const { data, error } = await client.from("platform_admins").select("user_id");

    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });
});

describe("RLS - registrations mutations", () => {
  it("worker cannot insert a registration for a team they are not in", async () => {
    const client = await signedInClient(fx.users.workerA1.email, PASSWORD);
    const { error } = await client.from("registrations").insert({
      org_id: fx.orgA.id,
      team_id: fx.teamA2.id, // workerA1 is in teamA1, not teamA2
      intervention_id: fx.interventionA.id,
      user_id: fx.users.workerA1.id,
      quantity: 1,
      happened_on: new Date().toISOString().slice(0, 10),
      co2_kg_cached: 1,
    });
    expect(error).toBeTruthy();
  });

  it("worker can insert a registration for their own team", async () => {
    const client = await signedInClient(fx.users.workerA1.email, PASSWORD);
    const { data, error } = await client
      .from("registrations")
      .insert({
        org_id: fx.orgA.id,
        team_id: fx.teamA1.id,
        intervention_id: fx.interventionA.id,
        user_id: fx.users.workerA1.id,
        quantity: 2,
        happened_on: new Date().toISOString().slice(0, 10),
        co2_kg_cached: 2,
      })
      .select("id")
      .single();
    expect(error).toBeNull();
    expect(data?.id).toBeTruthy();
    // Clean up the row so the test is idempotent across re-runs.
    if (data?.id) {
      await adminClient().from("registrations").delete().eq("id", data.id);
    }
  });

  it("worker cannot update another user's registration", async () => {
    const client = await signedInClient(fx.users.workerA1.email, PASSWORD);
    const { data, error } = await client
      .from("registrations")
      .update({ quantity: 999 })
      .eq("id", fx.registrationA2.id)
      .select("id");
    // RLS-blocked updates return a successful status with 0 rows affected.
    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  it("admin can update any registration within their org", async () => {
    const client = await signedInClient(fx.users.adminA.email, PASSWORD);
    const { data, error } = await client
      .from("registrations")
      .update({ quantity: 42 })
      .eq("id", fx.registrationA2.id)
      .select("id, quantity");
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0]?.quantity).toBe(42);
  });

  it("worker of org B cannot insert a registration into org A", async () => {
    const client = await signedInClient(fx.users.workerB.email, PASSWORD);
    const { error } = await client.from("registrations").insert({
      org_id: fx.orgA.id,
      team_id: fx.teamA1.id,
      intervention_id: fx.interventionA.id,
      user_id: fx.users.workerB.id,
      quantity: 1,
      happened_on: new Date().toISOString().slice(0, 10),
      co2_kg_cached: 1,
    });
    expect(error).toBeTruthy();
  });
});
