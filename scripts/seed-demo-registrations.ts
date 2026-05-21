/**
 * Kleine batch willekeurige demo-registraties voor een bestaande tenant.
 * Vereist: teams, interventies uit 9000_seed; leden met memberships + team_memberships.
 *
 *   npx tsx scripts/seed-demo-registrations.ts
 *   DEMO_ORG_SLUG=lev-groep DEMO_COUNT=48 npx tsx scripts/seed-demo-registrations.ts
 *
 * Vereist .env.local: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 */

import { createReadStream, existsSync } from "node:fs";
import { createInterface } from "node:readline";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "../supabase/types/supabase";
import { insertRandomOrgRegistrations } from "./insert-random-org-registrations";

const ORG_SLUG = process.env.DEMO_ORG_SLUG ?? "lev-groep";
const COUNT = Math.max(1, Number.parseInt(process.env.DEMO_COUNT ?? "72", 10) || 72);
const WORKERS_ONLY =
  process.env.DEMO_WORKERS_ONLY === "1" || process.env.DEMO_WORKERS_ONLY === "true";

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

async function main(): Promise<void> {
  await loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY moeten beschikbaar zijn (bv. via .env.local).",
    );
  }

  const admin = createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: org, error: orgErr } = await admin
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", ORG_SLUG)
    .maybeSingle();

  if (orgErr) throw orgErr;
  if (!org) throw new Error(`Organisatie met slug '${ORG_SLUG}' niet gevonden.`);

  console.log(`→ Demo-registraties voor ${org.slug} (${org.name}): ${COUNT} rijen`);
  console.log(WORKERS_ONLY ? "   (alleen workers)" : "   (alle leden met team)");

  await insertRandomOrgRegistrations(admin, org.id, COUNT, { workersOnly: WORKERS_ONLY });
  console.log("Klaar.");
}

main().catch((err) => {
  console.error("Mislukt:", err);
  process.exit(1);
});
