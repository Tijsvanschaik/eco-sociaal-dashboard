/**
 * Random demo registrations for one org. Prefer `team_memberships` so gekozen teams
 * overeenkomen met de echte werkverdeling. Ontbreken die nog, wordt optioneel een
 * willekeurige lid×team combinatie gekozen (`allowImplicitTeamPair`, default true).
 * `workersOnly` sluit admins uit als attribuant (compatibel met seed-fake-data).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/types/supabase";

const DAYS_BACK = 90;

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
    case "personen":
    case "deelnemers":
      return randRange(1, 15);
    default:
      return 1;
  }
}

function randomHappenedOn(daysBack = DAYS_BACK): string {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const offset = Math.floor(Math.random() * daysBack);
  const d = new Date(today);
  d.setDate(d.getDate() - offset);
  const day = d.getDay();
  if ((day === 0 || day === 6) && Math.random() < 0.6) {
    d.setDate(d.getDate() - (day === 0 ? 2 : 1));
  }
  return d.toISOString().slice(0, 10);
}

export type InsertRandomOrgRegistrationsOptions = {
  allowImplicitTeamPair?: boolean;
  workersOnly?: boolean;
};

/**
 * Inserts synthetic registrations for `orgId`. Service-role client recommended.
 */
export async function insertRandomOrgRegistrations(
  admin: SupabaseClient<Database>,
  orgId: string,
  count: number,
  options?: InsertRandomOrgRegistrationsOptions,
): Promise<void> {
  if (count < 1) return;

  const allowImplicitTeamPair = options?.allowImplicitTeamPair !== false;

  const [teamsRes, interventionsRes] = await Promise.all([
    admin
      .from("teams")
      .select("id, name")
      .eq("org_id", orgId)
      .eq("is_archived", false)
      .order("name"),
    admin
      .from("interventions")
      .select("id, name, eco_unit, social_unit, co2_factor_kg, social_score_factor")
      .eq("org_id", orgId)
      .eq("is_archived", false),
  ]);
  if (teamsRes.error) throw teamsRes.error;
  if (interventionsRes.error) throw interventionsRes.error;

  const teams = teamsRes.data ?? [];
  const interventions = interventionsRes.data ?? [];
  if (teams.length === 0 || interventions.length === 0) {
    throw new Error("Geen teams of interventies voor deze organisatie.");
  }

  const [tmListRes, memListRes] = await Promise.all([
    admin.from("team_memberships").select("user_id, team_id").eq("org_id", orgId),
    admin.from("memberships").select("user_id, role").eq("org_id", orgId),
  ]);
  if (tmListRes.error) throw tmListRes.error;
  if (memListRes.error) throw memListRes.error;

  let roster = memListRes.data ?? [];
  if (options?.workersOnly) {
    roster = roster.filter((m) => m.role === "worker");
  }

  if (roster.length === 0) {
    throw new Error(
      options?.workersOnly
        ? "Geen worker-memberships in deze organisatie."
        : "Geen memberships in deze organisatie.",
    );
  }

  const memberIds = new Set(roster.map((m) => m.user_id));
  let assignments = (tmListRes.data ?? []).filter((row) => memberIds.has(row.user_id));

  if (options?.workersOnly) {
    assignments = assignments.filter((row) => roster.some((r) => r.user_id === row.user_id));
  }

  let useImplicitPair = false;
  if (assignments.length === 0 && roster.length > 0 && teams.length > 0) {
    if (allowImplicitTeamPair) {
      useImplicitPair = true;
      console.warn(
        "[demo-registrations] Geen team_memberships — per registratie een willekeurige gebruiker × team combinatie.",
      );
    }
  }

  if (assignments.length === 0 && !useImplicitPair) {
    throw new Error(
      options?.workersOnly
        ? "Geen workers met teamtoewijzing. Wijs workers aan teams toe in Beheer."
        : "Geen team_memberships voor gekozen leden. Wijs gebruikers aan teams toe — of gebruik het demo-script met impliciete teamkeuze (standaard aan).",
    );
  }

  const notes = [
    null,
    null,
    "Vandaag met bewoners uit de straat aan de slag: o.a. mevrouw A., de heer B. en gezin C. en D. Het was een gemoedelijke dag; we hebben samen gekeken naar energie en kleine ingrepen. Er kwamen goede vragen boven tafel en we hebben een paar concrete vervolgstappen afgesproken. Trots op het resultaat!",
    "Leuke middag gehad met vrijwilligers en een handjevol nieuwe buurtbewoners. Na de uitleg waren mensen enthousiast om zelf ook iets te proberen. Het voelde verbindend en er ontstond meteen een praatje over duurzamer leven. Zo zou het vaker mogen gaan.",
    "Workshop goed verlopen; we hadden twaalf aanmeldingen en een levendige discussie. Achteraf nog even napraten met een kleine groep bij koffie. Ik merk dat mensen het vooral fijn vinden om inspiratie en tips in één middag mee te krijgen.",
    "In de wijk rondgelopen met twee collega’s. Bij meerdere adresjes even aangeklopt: sommigen wilden advies, anderen een herinnering voor de volgende bijeenkomst. Het was intensief maar inhoudelijk waardevol—we sluiten de dag positief af.",
    "Repaircafé was druk: veel items mee en vrijwel alles heeft een eerlijke herkans gekregen. Bezoekers bedankten nadrukkelijk; dat doet veel met het teamgevoel. Volgende keer meer naaimachines reserveren—we hebben geleerd.",
    "Met het buurtcomité afgestemd over het groenproject langs het schoolplein. Kinderen waren er ook bij betrokken via een kleine plantactie. Mooie mix van plezier en bewustwording; ouders gaven aan dat ze het prettig vonden zo samen.",
    "Ochtend inloopspreekuur: diverse vragen over isolatie en ventilatie. Even wachtrijen, daarom twee spreekplekken ingericht. Geen grootse verhalen maar wel veel rust en duidelijke uitleg—we hebben waar we konden doorverwezen of een vervolgafspraak gemaakt.",
    "Namens het team langs bij een paar huishoudens voor energiecoach-gesprekken. Bij één adres extra tijd nodig voor uitleg over subsidies; daar hebben we Mijn Huis Past-brochures voor meegegeven. Dag voelde nuttig en menselijk.",
    "De combinatie Taal & Tuin liep prima: deelnemers oefenden woorden tijdens het wieden en daarna ging het napraten bij de koffie leuk. Bewoners onderling gingen al verder praten hoe ze de bakken willen indelen komend seizoen.",
  ];

  const rows = Array.from({ length: count }, () => {
    const intervention = rand(interventions);
    const quantity = quantityForUnit(intervention.eco_unit);
    const socialQuantity = quantityForUnit(intervention.social_unit);
    const co2 = Number((quantity * Number(intervention.co2_factor_kg)).toFixed(3));
    const socialScoreCached = Number(
      (socialQuantity * Number(intervention.social_score_factor ?? 0)).toFixed(3),
    );

    let userId: string;
    let teamId: string;
    if (useImplicitPair) {
      userId = rand(roster).user_id;
      teamId = rand(teams).id;
    } else {
      const assignment = rand(assignments);
      userId = assignment.user_id as string;
      teamId = assignment.team_id as string;
    }

    return {
      org_id: orgId,
      team_id: teamId,
      user_id: userId,
      intervention_id: intervention.id,
      quantity,
      social_quantity: socialQuantity,
      happened_on: randomHappenedOn(),
      note: rand(notes),
      co2_kg_cached: co2,
      social_score_cached: socialScoreCached,
    };
  });

  const chunkSize = 60;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await admin.from("registrations").insert(chunk);
    if (error) throw error;
  }
}
