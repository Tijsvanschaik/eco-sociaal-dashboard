/**
 * scripts/seed-fake-data.ts
 *
 * Dev-only seeder: voegt nep-medewerkers (1 admin + 9 workers) en een batch
 * registraties toe aan de bestaande LEV Groep-seed. Idempotent: hergebruikt
 * bestaande users op e-mail en slaat registraties alleen aan wanneer er er
 * nog nauwelijks zijn.
 *
 * Na een destructieve `9000_seed.sql`-run ontbreken memberships; dit script zet ze
 * (opnieuw) en kan opnieuw een registratie-batch toevoegen.
 *
 * Uitvoeren:
 *   npx tsx scripts/seed-fake-data.ts
 *
 * Vereist .env.local met NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 */

import { createReadStream, existsSync } from "node:fs";
import { createInterface } from "node:readline";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "../supabase/types/supabase";
import { insertRandomOrgRegistrations } from "./insert-random-org-registrations";

type UserRole = "admin" | "worker";

const ORG_SLUG = "lev-groep";
const DEFAULT_PASSWORD = "LevDev2026!";
const REGISTRATION_TARGET = 180;

const FAKE_USERS: Array<{ email: string; name: string; role: UserRole }> = [
  { email: "anouk.admin@levdev.test", name: "Anouk Admin", role: "admin" },
  { email: "bram@levdev.test", name: "Bram Bakker", role: "worker" },
  { email: "carla@levdev.test", name: "Carla Coenen", role: "worker" },
  { email: "daan@levdev.test", name: "Daan de Vries", role: "worker" },
  { email: "evi@levdev.test", name: "Evi Engels", role: "worker" },
  { email: "finn@levdev.test", name: "Finn Fokkens", role: "worker" },
  { email: "gwen@levdev.test", name: "Gwen Groen", role: "worker" },
  { email: "hugo@levdev.test", name: "Hugo Hendriks", role: "worker" },
  { email: "iris@levdev.test", name: "Iris IJsbrand", role: "worker" },
  { email: "jeroen@levdev.test", name: "Jeroen Jansen", role: "worker" },
];

async function loadEnvLocal(): Promise<void> {
  const path = ".env.local";
  if (!existsSync(path)) return;
  const rl = createInterface({ input: createReadStream(path) });
  for await (const raw of rl) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    const valueRaw = match[2];
    if (!key || valueRaw === undefined) continue;
    const value = valueRaw.replace(/^['"]|['"]$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

function rand<T>(arr: T[]): T {
  if (arr.length === 0) throw new Error("rand() op lege array");
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

async function main(): Promise<void> {
  await loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY moeten in .env.local staan.",
    );
  }

  const admin = createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("→ Organisatie opzoeken:", ORG_SLUG);
  const { data: org, error: orgErr } = await admin
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", ORG_SLUG)
    .maybeSingle();

  if (orgErr) throw orgErr;
  if (!org) {
    throw new Error(`Organisatie '${ORG_SLUG}' niet gevonden. Draai eerst 9000_seed.sql.`);
  }
  const orgId = org.id;

  const { count: interventionCount } = await admin
    .from("interventions")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("is_archived", false);
  const ic = interventionCount ?? 0;
  if (ic === 0) {
    throw new Error("Geen interventies gevonden. Draai eerst 9000_seed.sql.");
  }

  console.log("→ Nep-users aanmaken / hergebruiken");
  const userIdsByEmail = new Map<string, string>();

  for (const u of FAKE_USERS) {
    let userId: string | null = null;

    const created = await admin.auth.admin.createUser({
      email: u.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: u.name, seeded: true },
    });

    if (created.data.user) {
      userId = created.data.user.id;
      console.log(`   + ${u.email} aangemaakt`);
    } else if (created.error) {
      const msg = created.error.message.toLowerCase();
      const alreadyExists =
        msg.includes("already") || msg.includes("registered") || msg.includes("exists");
      if (!alreadyExists) throw created.error;

      let page = 1;
      while (!userId) {
        const list = await admin.auth.admin.listUsers({ page, perPage: 200 });
        if (list.error) throw list.error;
        const hit = list.data.users.find((x) => x.email === u.email);
        if (hit) {
          userId = hit.id;
          console.log(`   · ${u.email} bestond al`);
          break;
        }
        if (list.data.users.length < 200) break;
        page += 1;
      }
      if (!userId) throw new Error(`Kon user ${u.email} niet vinden`);
    } else {
      throw new Error(`Onbekend resultaat voor ${u.email}`);
    }

    userIdsByEmail.set(u.email, userId);
  }

  console.log("→ Memberships upserten");
  const membershipRows = FAKE_USERS.map((u) => ({
    org_id: orgId,
    user_id: userIdsByEmail.get(u.email) as string,
    role: u.role,
  }));
  const { error: memErr } = await admin
    .from("memberships")
    .upsert(membershipRows, { onConflict: "org_id,user_id" });
  if (memErr) throw memErr;

  console.log("→ Team-memberships toewijzen (elk werknemer 1-2 teams)");
  const teamMembershipRows: Array<{
    org_id: string;
    team_id: string;
    user_id: string;
  }> = [];

  const teamsRes = await admin
    .from("teams")
    .select("id, name")
    .eq("org_id", orgId)
    .eq("is_archived", false)
    .order("name");
  if (teamsRes.error) throw teamsRes.error;
  const teams = teamsRes.data ?? [];
  if (teams.length === 0) {
    throw new Error("Geen teams gevonden. Draai eerst 9000_seed.sql.");
  }
  console.log(`   ${teams.length} teams, ${ic} interventies.`);

  for (const u of FAKE_USERS) {
    const userId = userIdsByEmail.get(u.email) as string;
    const assignCount = u.role === "admin" ? teams.length : Math.random() < 0.3 ? 2 : 1;
    const picked = new Set<string>();
    while (picked.size < assignCount) {
      picked.add(rand(teams).id);
    }
    for (const teamId of picked) {
      teamMembershipRows.push({ org_id: orgId, team_id: teamId, user_id: userId });
    }
  }
  const { error: tmErr } = await admin
    .from("team_memberships")
    .upsert(teamMembershipRows, { onConflict: "team_id,user_id" });
  if (tmErr) throw tmErr;

  console.log("→ Registraties tellen");
  const { count: existingCount, error: countErr } = await admin
    .from("registrations")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId);
  if (countErr) throw countErr;
  const existing = existingCount ?? 0;
  console.log(`   huidige registraties: ${existing}`);

  if (existing >= REGISTRATION_TARGET * 0.5) {
    console.log(
      `   al >= ${Math.floor(REGISTRATION_TARGET * 0.5)} registraties, nieuwe batch overgeslagen.`,
    );
  } else {
    console.log(`→ ${REGISTRATION_TARGET} registraties genereren`);
    await insertRandomOrgRegistrations(admin, orgId, REGISTRATION_TARGET, {
      allowImplicitTeamPair: false,
      workersOnly: true,
    });
    console.log(`   ${REGISTRATION_TARGET}/${REGISTRATION_TARGET}`);
  }

  console.log("\nKlaar.");
  console.log("Login als admin:");
  console.log(`  e-mail:     ${FAKE_USERS[0]?.email}`);
  console.log(`  wachtwoord: ${DEFAULT_PASSWORD}`);
  console.log("Workers gebruiken dezelfde wachtwoord.");
}

main().catch((err) => {
  console.error("Seed mislukt:", err);
  process.exit(1);
});
