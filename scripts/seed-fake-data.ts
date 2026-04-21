/**
 * scripts/seed-fake-data.ts
 *
 * Dev-only seeder: voegt nep-medewerkers (1 admin + 9 workers) en een batch
 * registraties toe aan de bestaande LEV Groep-seed. Idempotent: hergebruikt
 * bestaande users op e-mail en slaat registraties alleen aan wanneer er er
 * nog nauwelijks zijn.
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

type UserRole = "admin" | "worker";

const ORG_SLUG = "lev-groep";
const DEFAULT_PASSWORD = "LevDev2026!";
const REGISTRATION_TARGET = 180;
const DAYS_BACK = 90;

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

function randRange(min: number, max: number, step = 1): number {
  const steps = Math.floor((max - min) / step) + 1;
  return Number((min + Math.floor(Math.random() * steps) * step).toFixed(3));
}

function quantityForUnit(unit: string): number {
  switch (unit) {
    case "km":
      return randRange(2, 45);
    case "maaltijd":
      return randRange(1, 3);
    case "kwh":
      return randRange(1, 12);
    case "stuk":
      return randRange(1, 6);
    case "uur":
      return randRange(1, 4, 0.5);
    case "dag":
      return randRange(1, 5);
    case "kg":
      return randRange(1, 10);
    case "liter":
      return randRange(1, 20);
    default:
      return 1;
  }
}

function randomHappenedOn(): string {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const offset = Math.floor(Math.random() * DAYS_BACK);
  const d = new Date(today);
  d.setDate(d.getDate() - offset);
  const day = d.getDay();
  if ((day === 0 || day === 6) && Math.random() < 0.6) {
    d.setDate(d.getDate() - (day === 0 ? 2 : 1));
  }
  return d.toISOString().slice(0, 10);
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

  const [teamsRes, interventionsRes] = await Promise.all([
    admin
      .from("teams")
      .select("id, name")
      .eq("org_id", orgId)
      .eq("is_archived", false)
      .order("name"),
    admin
      .from("interventions")
      .select("id, name, unit, co2_factor_kg")
      .eq("org_id", orgId)
      .eq("is_archived", false),
  ]);
  if (teamsRes.error) throw teamsRes.error;
  if (interventionsRes.error) throw interventionsRes.error;
  const teams = teamsRes.data ?? [];
  const interventions = interventionsRes.data ?? [];
  if (teams.length === 0 || interventions.length === 0) {
    throw new Error("Geen teams of interventies gevonden. Draai eerst 9000_seed.sql.");
  }
  console.log(`   ${teams.length} teams, ${interventions.length} interventies.`);

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
    const [tmListRes, memListRes] = await Promise.all([
      admin.from("team_memberships").select("user_id, team_id").eq("org_id", orgId),
      admin.from("memberships").select("user_id, role").eq("org_id", orgId),
    ]);
    if (tmListRes.error) throw tmListRes.error;
    if (memListRes.error) throw memListRes.error;

    const workerIds = new Set(
      (memListRes.data ?? []).filter((m) => m.role === "worker").map((m) => m.user_id),
    );
    const workerAssignments = (tmListRes.data ?? []).filter((row) => workerIds.has(row.user_id));

    if (workerAssignments.length === 0) {
      throw new Error("Geen worker-toewijzingen gevonden.");
    }

    const notes = [
      null,
      null,
      null,
      "Op weg naar thuisbezoek",
      "Samen met collega",
      "Teamlunch",
      "Buurtactiviteit",
      "Groepje begeleid",
      "Eigen initiatief",
    ];

    const rows = Array.from({ length: REGISTRATION_TARGET }, () => {
      const assignment = rand(workerAssignments);
      const intervention = rand(interventions);
      const quantity = quantityForUnit(intervention.unit as string);
      const co2 = Number((quantity * Number(intervention.co2_factor_kg)).toFixed(3));
      return {
        org_id: orgId,
        team_id: assignment.team_id as string,
        user_id: assignment.user_id as string,
        intervention_id: intervention.id,
        quantity,
        happened_on: randomHappenedOn(),
        note: rand(notes),
        co2_kg_cached: co2,
      };
    });

    const chunkSize = 60;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error } = await admin.from("registrations").insert(chunk);
      if (error) throw error;
      console.log(`   ${Math.min(i + chunkSize, rows.length)}/${rows.length}`);
    }
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
