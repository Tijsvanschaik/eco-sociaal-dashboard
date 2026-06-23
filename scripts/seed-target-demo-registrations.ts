/**
 * Voegt een kleine, vaste set demo-registraties toe (~500 kg CO₂, ~30 sociale score).
 *
 *   npx tsx scripts/seed-target-demo-registrations.ts
 *   TARGET_CLEAR=1 npx tsx scripts/seed-target-demo-registrations.ts
 *   DEMO_ORG_SLUG=lev-groep npx tsx scripts/seed-target-demo-registrations.ts
 *
 * TARGET_CLEAR=1 verwijdert eerst alle registraties van de org (handig voor schone demo).
 * Vereist .env.local: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 */

import { createReadStream, existsSync } from "node:fs";
import { createInterface } from "node:readline";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "../supabase/types/supabase";
import { insertTargetedOrgRegistrations } from "./insert-targeted-org-registrations";
import { computeTargetDemoTotals } from "./target-demo-registrations-data";

const ORG_SLUG = process.env.DEMO_ORG_SLUG ?? "lev-groep";
const CLEAR_EXISTING = process.env.TARGET_CLEAR === "1" || process.env.TARGET_CLEAR === "true";
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

  const expected = computeTargetDemoTotals();
  console.log(
    `Verwachte totalen (${expected.count} registraties): ~${expected.totalCo2Kg} kg CO₂, ~${expected.totalSocialScore} sociale score`,
  );

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

  if (CLEAR_EXISTING) {
    console.log(`→ Bestaande registraties verwijderen voor ${org.slug}`);
    const { error: delErr } = await admin.from("registrations").delete().eq("org_id", org.id);
    if (delErr) throw delErr;
  }

  console.log(`→ Target-demo-registraties invoegen voor ${org.slug} (${org.name})`);
  if (WORKERS_ONLY) console.log("   (alleen workers als attribuant)");

  const result = await insertTargetedOrgRegistrations(admin, org.id, { workersOnly: WORKERS_ONLY });

  console.log(
    `Klaar: ${result.inserted} registraties — totaal ${result.totalCo2Kg} kg CO₂, ${result.totalSocialScore} sociale score.`,
  );
}

main().catch((err) => {
  console.error("Mislukt:", err);
  process.exit(1);
});
