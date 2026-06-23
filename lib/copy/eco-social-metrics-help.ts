export type MetricsHelpSection = {
  body: string;
  title: string;
};

export type MetricsHelpContent = {
  footer?: string;
  paragraphs: string[];
  sections?: MetricsHelpSection[];
  title: string;
};

export const INTERVENTIONS_OVERVIEW_HELP: MetricsHelpContent = {
  title: "Activiteiten en impact",
  paragraphs: [
    "Elke activiteit is iets dat medewerkers kunnen kiezen bij registratie (bijv. Energiecoach of Repaircafé).",
    "Eco en sociaal tellen apart: eco gebruikt uur, km, stuk of kg; sociaal is vrijwel altijd personen.",
    "CO₂-factor × eco-hoeveelheid = kg CO₂. Score-factor × sociale hoeveelheid = sociale score op het dashboard.",
    "Score 1,0 is de standaard bewonersdienst; hoger of lager geeft relatief zwaardere of lichtere sociale impact.",
  ],
};

export const ECO_UNIT_COLUMN_HELP: MetricsHelpContent = {
  title: "Eco-eenheid",
  paragraphs: [
    "Label bij registratie voor de eco-hoeveelheid: uur, km, stuk, kg of een eigen eenheid.",
    "Medewerkers vullen dit veld in volgens de activiteit — geen automatische kopie van het sociale veld.",
  ],
};

export const CO2_FACTOR_COLUMN_HELP: MetricsHelpContent = {
  title: "CO₂-factor",
  paragraphs: [
    "Kg CO₂ bespaard per eco-eenheid (bijv. kg/uur of kg/km).",
    "Formule: eco-hoeveelheid × CO₂-factor = totale CO₂-impact van de registratie.",
  ],
};

export const SOCIAL_UNIT_COLUMN_HELP: MetricsHelpContent = {
  title: "Sociale eenheid",
  paragraphs: [
    "Label bij registratie voor de sociale hoeveelheid. Bij LEV is dit vrijwel altijd personen.",
    "Tel bereikte of betrokken mensen — niet uren, km of stuks herhalen in het sociale veld.",
  ],
};

export const SOCIAL_SCORE_COLUMN_HELP: MetricsHelpContent = {
  title: "Sociale score-factor",
  paragraphs: [
    "Relatief gewicht per sociale eenheid t.o.v. standaard bewonersdienst (1,0).",
    "Formule: sociale hoeveelheid × score-factor = bijdrage aan “harten bereikt” op het dashboard.",
  ],
};

export const INTERVENTION_ECO_SECTION_HELP: MetricsHelpContent = {
  title: "Eco-impact instellen",
  paragraphs: [
    "Eco meten we vaak aan hoeveel werk er is gedaan — bijvoorbeeld in uren, km, stuks of kg.",
    "Kies de eenheid en CO₂-factor die medewerkers zien bij registratie.",
  ],
};

export const INTERVENTION_SOCIAL_SECTION_HELP: MetricsHelpContent = {
  title: "Sociale impact instellen",
  paragraphs: [
    "Sociaal meten we vaak in uren of in aanwezige personen. Tel bij personen geen medewerkers mee.",
    "De score-factor geeft het relatieve gewicht t.o.v. standaard bewonersdienst (1,0).",
  ],
};

export const QUANTITIES_PANEL_HELP: MetricsHelpContent = {
  title: "Twee hoeveelheden",
  paragraphs: [
    "Elke registratie heeft één eco- en één sociale hoeveelheid op dezelfde activiteit.",
  ],
  sections: [
    {
      title: "Eco",
      body: "Eco meten we vaak aan hoeveel je hebt gedaan — bijvoorbeeld in uren, km, stuks of kg (het label staat naast het veld).",
    },
    {
      title: "Sociaal",
      body: "Sociaal meten we vaak in uren of in aanwezige personen. Tel bij personen geen medewerkers mee.",
    },
  ],
  footer: "Samen meten we hiermee de eco-sociale score!",
};

const ECO_UNIT_HINTS: Record<string, string> = {
  uur: "Tel het aantal uren aan deze activiteit (mag decimalen, bijv. 0,5 of 2,75).",
  km: "Tel kilometers met een duurzaam alternatief i.p.v. de auto — geen km die je toch met eigen auto reed.",
  stuk: "Eén stuk = één sessie, item of afgeronde inzet zoals in de activiteitsnaam staat.",
  kg: "Gewicht (of afgesproken schatting) van hergebruikt materiaal in kg.",
};

const SOCIAL_UNIT_HINTS_BY_ECO: Record<string, string> = {
  uur: "Tel bewoners of deelnemers die bereikt zijn — niet dezelfde uren als eco.",
  km: "Tel bewoners bereikt via gesprek of stimulering. Puur teamrit zonder bewoners → 1 (eigen inzet).",
  stuk: "Tel aanwezigen of bezoekers per sessie/event — eco blijft 1 stuk.",
  kg: "Tel personen op locatie betrokken bij het materiaal — niet het gewicht in kg.",
};

const DEFAULT_ECO_HINT =
  "Volg het label naast het veld. Niet hetzelfde getal als sociaal tenzij dat inhoudelijk klopt.";

const DEFAULT_SOCIAL_HINT =
  "Tel personen die bereikt of betrokken zijn. Het sociale veld is vrijwel altijd personen, los van eco.";

export function getEcoQuantityHelp(ecoUnit?: string): MetricsHelpContent {
  const normalized = ecoUnit?.trim().toLowerCase();
  const unitHint = normalized ? ECO_UNIT_HINTS[normalized] : undefined;

  return {
    title: "Eco-hoeveelheid",
    paragraphs: [
      "Voor de CO₂-berekening van deze activiteit.",
      unitHint ?? DEFAULT_ECO_HINT,
      "Formule: ingevuld getal × CO₂-factor = kg CO₂ op het dashboard.",
    ],
  };
}

export function getSocialQuantityHelp(ecoUnit?: string): MetricsHelpContent {
  const normalized = ecoUnit?.trim().toLowerCase();
  const unitHint = normalized ? SOCIAL_UNIT_HINTS_BY_ECO[normalized] : undefined;

  return {
    title: "Sociale hoeveelheid",
    paragraphs: [
      "Voor de sociale score — altijd personen (bewoners, deelnemers, bezoekers).",
      unitHint ?? DEFAULT_SOCIAL_HINT,
      "Formule: ingevuld getal × score-factor = bijdrage aan sociale impact.",
    ],
  };
}
