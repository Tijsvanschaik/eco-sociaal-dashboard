# ADR 0007: CO₂-factoren en sociale-score-factoren voor LEV-interventies

**Datum:** 2026-05-16  
**Status:** goedgekeurd voor defaults (herschaal na kalibratie met LEV-data)  
**Context:** LEV Groep levert werkzaamheden die deels materiële uitstoot-effecten indirect raken (advies → besparing later; hergebruik → vermeden nieuw-aankoopembodied CO₂) en deels vooral verbindende / sociale impact hebben zonder stabiele nationale “factorkaart” zoals elektriciteit of benzinekilometers.

---

## Kernprincipe

We scheiden bewust:

1. **CO₂/kg per geregistreerde eenheid** — een **bewuste grove proxy** waar geen officiële emissiefactor bestaat voor “uur activiteit”; die moet LEV periodiek tegen CO₂emissiefactoren.nl, eigen rapportages of lokale gemeentedata valideren.
2. **Sociale-score-factor per eenheid** — een **relatieve interne KPI** voor het dashboard/TV-eco-sociaal-indicator (combinatie-regel in [`lib/impact.ts`](../../lib/impact.ts)): geen nationale norm, maar wel **consistent tussen interventies** zodat vergelijk binnen LEV zinvoller is dan absolute “punten voor de buitenwereld”.

Beide liggen tussen **≥ 0** (schema-constraint).

---

## Semantiek van registreerbare eenheden

| Unit | Interpretatie voor vrijwilligers / medewerkers |
|------|------------------------------------------------|
| `uur` | Tijd die jullie inzetten bij die activiteit (consulent-uur; hands-on vrijwilligerswerk; facilitator van een bijeenkomst). Geen automatische aftrek tegen loonkosten; puur werkingsduur zoals gebruikers invoeren. |
| `dag` | Alleen daar waar een “bewerkingsdag als geheel” logischer is dan uren (zeldzaam; default blijft `uur`). Seed gebruikt deze niet behalve waar expliciet in de naam past — **in de seed zetten we alles waar mogelijk op `uur` voor eenduidige instructie**. |
| `stuk` | Discrete impact-eenheid: geleverde lezing/session (één registratie ≈ één sessie uitgevoerd); **één gerepareerd/swapped/weggeschonken gebruikt item** waar dat de bedoelde telwijze is. |
| `km` | Afgelegde kilometer met duurzaam alternatief in plaats van autokilometer (bewust vermeden autorit). Dezelfde richt als bestaande “fiets ipv auto”. |
| `kg` | Hoeveelheid materiaal hergebruikt of van de verbrandings-/stort-route gehaald, **gewogen of admin geschat en vastgelegd als consensusregel bij LEV**. |

Andere enums (`liter`, `kwh`, `maaltijd`) zijn voor deze LEV-lijst minder geschikt maar blijven in het datamodel beschikbaar voor toekomstige interventies.

---

## Methode voor CO₂ (per type activiteit)

### A. Mobiliteit (`km`)

- **Rationale:** “Autokilometer vermeden” is het meest overdraagbare proxy-model in literatuur.
- **Waarde:** **0,170 kg CO₂-equivalent/km** (typische orde grootte WLTP-well-to-wheel personenauto; afgerond naar bestaande app-seeds). Laag-variant carpool/overige modi zou lager zijn; LEV kan dit later splitsen.
- **Sociale factor:** relatief **laag**, want primair infrastructuur-route; waar bewonersbewustmaking expliciet in zit (“bewoners stimuleren”) iets **hoger**.

### B. Energie‑advies / huisbezuchten (`uur`)

- **Probleem:** geen nationale “CO₂/uur vrijwilligers advies”; besparing verschijnt later en verdeeld over jaar.
- **Proxy:** conservatief **effect-budget per contactuur** gedacht als **orde 2–4 kg/uur**, afhankelijk van diepgang (“kierenjagers” meer hands-on gedacht tegen nachtelijke warmte-/luchtlekken dan puur verwijzend spreekuur). Exacte plaatsing in seed is **middel-maat**.
- **Documentatieplicht:** elk jaar reviseren tegen steekproef gemeentelijke W/W-subsidieregistraties of energie-monitoringsdata als die beschikbaar zijn.

### C. Educatief / podium (`stuk` sessie)

- **Proxy:** hogere maar zeldzamere “impuls” naar publiek (**~18 kg/sessie** in seed) gedacht als **geamortiseerde geïnspireerde maatregel-haalbare besparing bij een deel van aanwezigen** — inhoudelijk de **meest sensitieve aanname**. Alternatief beheer in productie: **lage CO₂**, hoge **sociale factor** alleen als jullie communicatie die verzening niet wil dragen — dan ADR herzien met two-factor storytelling.

### D. Buurt-/tuin-/groene handarbeid (`uur`)

- Real sequestration + koeling + biodiversiteit is **contextafhankelijk** en nauwelijks zonder lokale invoer te verankeren.
- **Proxy-bandbreedte in seed:** **0,35–1,05 kg/uur** hogere waarden daar waar “tegels wippen / infrastructuur-hitte-eiland” rationeler is voor een CO₂-lijn; lagere waar het vooral biodiversity/samenwerking is.
- Dashboard moet deze getallen beschouwen als **indicatie volgorde tussen activiteiten**, niet als audited CO₂.

### E. Circulariteit — herstel ruil materiaal

- **`stuk` gerepareerd item:** **~6,5 kg** gemiddelde vermeden productie-impact (orde-grootte mid tussen textiel/meubel/consumentenelektronica — **bewust middel-maat**, overschat productie-impact liever niet in communicatie naar buiten zonder QA).
- **Kleding per stuk geruild/uitgift:** lagere embodied-CO₂ per stuk (**~3,2 resp. ~4,2 kg**) — verschil dekt assortimentsgemiddelde + sociale gerichtheid kledingbank.
- **Materiaal `kg` hergebruik:** proxy **~4,8 kg CO₂/kg** gemogen homogeen plastics/metaal/paper — LEV moet deze regel inhoudelijk vrijgeven of vervangen door materiaalgroepfactoren als ze dat gaan splitsen.

### F. Bewustmaking / ontmoeting / taal-inclusive activiteiten (`uur`)

- **CO₂-factor laag**, want **middelbare toepassing naar meetbare emissiereductie**.
- **Sociale factor hoog** waar het inclusie, taalsupport en structurele ontmoeting is.

### G. Afval / scheiding

- **`uur`** voor **organisatie + begeleiding** met CO₂-factor die **orde 1,3–2,1 kg/uur** dekt gedacht aan **minder reststroom verbranding**, betere recycling-route en **preventie**.
- **`stuk` event-bewustwording:** **10 kg/registratie** als impuls-evenement‑proxy (“één succesvol ingestoken evenement”).
- Concurrentie tussen “Opruimactie” (thema ontmoeting) en “Zwerfafval” (thema afval) is bewust: afvalthema iets **hogere CO₂-leuning**, ontmoeting iets **hogere sociale leuning** voor dezelfde fysieke actie waar teams het onder verschillende doelen boeken.

---

## Schaalsysteem voor sociale score

**Niet** gekoppeld aan externe definities zoals ESCO of WMO; intern:

| Band | Betekenis (ruw) |
|------|----------------|
| ~0–0,4 | Incidenteel contact tijdens infra-/loopwerk zonder relatievormingsdoel als primaire KPI. |
| ~0,5–0,9 | Bekende buurtbewoners worden geïnformeerd; herhalingscontact mogelijk maar niet kern. |
| ~1,0–1,2 | Gestandaardiseerde buurt- of bewoners-service (coach, spreekuur, advies-route). |
| ~1,3–1,6 | Bewuste community-/netwerkopbouw, teams & initiatieven ondersteund. |
| ~1,7–2,0 | Inclusive programma’s (**Taal & Tuin**, verbindende initiatieven waar taal/arbeidspariteit centraal staat); hoogste vertrouwen in meetbare menselijke nabijheid tussen groepen die elkaar anders nauwelijks zien |

---

## Tabel defaults (implementatie=`supabase/sql/9000_seed.sql`)

| Categorie | Interventienaam | unit | CO₂-factor (kg/unit) | Sociale-score-factor |
|-----------|-----------------|------|----------------------|----------------------|
| Energie & Besparing | Energiecoach (contactuur) | uur | 3,05 | 1,22 |
| Energie & Besparing | Kierenjagers — tochtafdichting/handwerk | uur | 3,55 | 1,13 |
| Energie & Besparing | Energie-inloopspreekuur | uur | 2,60 | 1,06 |
| Energie & Besparing | Lezing over energie (per sessie) | stuk | 18,00 | 0,93 |
| Energie & Besparing | Ondersteuning Mijn Huis Past | uur | 3,10 | 1,04 |
| Energie & Besparing | Energieadvies / energiebesparing voor bewoners | uur | 3,35 | 1,19 |
| Groen & Leefomgeving | Geveltuintjes aanleggen | uur | 0,55 | 1,33 |
| Groen & Leefomgeving | Vergroenen buurt, wijk of schoolplein | uur | 0,65 | 1,33 |
| Groen & Leefomgeving | Tegels wippen / vergroenen oprit | uur | 1,05 | 1,14 |
| Groen & Leefomgeving | Moestuin / buurttuin (mede-/ondersteuning) | uur | 0,45 | 1,52 |
| Groen & Leefomgeving | Ondersteunen groeninitiatieven | uur | 0,55 | 1,52 |
| Groen & Leefomgeving | Stationspark / buurtgroenproject | uur | 0,55 | 1,28 |
| Hergebruik & Circulair | Repaircafé — hersteld item | stuk | 6,50 | 1,04 |
| Hergebruik & Circulair | Kledingruil / kledingmarkt — item geruild | stuk | 3,20 | 1,14 |
| Hergebruik & Circulair | Kledingatelier / naaiatelier | uur | 2,25 | 1,33 |
| Hergebruik & Circulair | Kledingbank — item uitgifte | stuk | 4,25 | 1,44 |
| Hergebruik & Circulair | Speelgoedruilkast — item | stuk | 2,00 | 1,04 |
| Hergebruik & Circulair | Hergebruik materialen | kg | 4,80 | 1,04 |
| Ontmoeting & Bewustwording | Opruimactie | uur | 1,40 | 1,32 |
| Ontmoeting & Bewustwording | Taal & Tuin | uur | 0,35 | 1,82 |
| Ontmoeting & Bewustwording | Duurzame buurtactiviteit | uur | 0,75 | 1,52 |
| Ontmoeting & Bewustwording | Buurtcamping — duurzame activiteit (uren inzet) | uur | 0,62 | 1,82 |
| Ontmoeting & Bewustwording | Bewustwordingsactiviteit | uur | 0,45 | 1,52 |
| Ontmoeting & Bewustwording | Workshop / bijeenkomst duurzaamheid | uur | 0,95 | 1,38 |
| Ontmoeting & Bewustwording | Verbindend duurzaam bewonersinitiatief | uur | 0,54 | 1,74 |
| Duurzame Mobiliteit | Deelmobiliteit (km ipv auto) | km | 0,170 | 0,34 |
| Duurzame Mobiliteit | Teamfietsen (km ipv auto) | km | 0,170 | 0,48 |
| Duurzame Mobiliteit | Bakfiets inzet (bezorg-/ritkilometers ipv auto) | km | 0,170 | 0,43 |
| Duurzame Mobiliteit | Bewoners aanmoedigen duurzaam vervoer | km | 0,170 | 0,62 |
| Afval & Scheiding | Afval scheiden op kantoor (begeleidings-/actie-uren) | uur | 2,08 | 0,84 |
| Afval & Scheiding | Afvalscheiding bij bewonersinitiatief | uur | 1,75 | 1,32 |
| Afval & Scheiding | Bewustmaking afval tijdens evenement (per succesvol evt.) | stuk | 10,00 | 1,26 |
| Afval & Scheiding | Zwerfafvalactie | uur | 1,31 | 1,22 |

Waarden gebruiken **comma’s** hier in prose; **`9000_seed.sql`** gebruikt **US-decimaal punt** voor numerieke literals.

---

## Operationele gevolgen

1. **Communicatie LEV:** elk kwartaal of jaar — herijken top-5 grootste volumetermen; vervang waar harde gemeente-data beschikbaar is.
2. **Dev-reset (`9000_seed.sql`):** voor organisatie‑slug **`lev-groep`** wist dit script eerst registrations, memberships, team_memberships, interventions, categories en teams, en vult teams + LEV‑themata + alle interventies opnieuw. **Niet draaien tegen productiedata.** Auth‑accounts blijven bestaan maar verliezen memberships tot opnieuw uitnodigen (`/beheer` of `scripts/seed-fake-data.ts`).
3. **Registratie-instructie medewerkers:** zie **`docs/medewerkers-registratie-eenheid.md`** voor `uur`/`stuk`/`kg`/`km` en dubbeltelling.

---

## Consequenties

- **Positief:** één expliciete bron van waarheid voor default-factoren; minder willekeur dan ad-hoc ChatGPT op regelniveau.
- **Negatief:** politiek/communicatie risico als externe partijen denken dat **alle** `uur` activiteiten geauditeerde CO₂ zijn — bij public-facing copy altijd “indicatief op basis van interne methodiek” vermelden tot LEV formele auditlijn vastlegt.
