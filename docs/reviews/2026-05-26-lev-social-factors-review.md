# Review: sociale metrics per LEV-interventie

**Status:** goedgekeurd — zie `supabase/sql/0011_lev_social_metrics.sql`  
**Datum:** 2026-05-26  
**Doel:** factoren + telwijze personen afstemmen vóór update van seed/SQL  
**Baseline:** sociale factor **1,0 ≈ 1 persoon bij standaard bewonersdienst** (coach, spreekuur, advies)

---

## Zo lees je deze tabel

| Kolom | Uitleg |
| --- | --- |
| **Eco** | Ongewijzigd (ADR 0007) — wat medewerker in eco-veld telt |
| **Soc. eenheid** | Voorstel: overal **`personen`** (behalve expliciete uitzondering) |
| **Factor nu** | Huidige waarde in seed / ADR 0007 |
| **Factor voorstel** | Onze voorzet; **=** = behouden, **?** = graag jouw oordeel |
| **Personen tellen als…** | Instructie voor medewerkers |
| **Voorbeeld** | Eco-invoer + sociale invoer → score (= personen × factor) |

**Formule:** `social_score_cached = social_quantity × social_score_factor`  
**Dashboard:** som = **“harten bereikt”** (gewogen proxy, geen unieke personen).

**App-regel:** sociale hoeveelheid moet **> 0** bij nieuwe registratie — bij puur intern/km-werk dus minimaal **1** (zie mobiliteit).

---

## Schaal (herinnering)

| Factor | Type activiteit |
| ---: | --- |
| 0,3–0,5 | Infra/verplaatsing, weinig relationeel contact |
| 0,8–1,0 | Informeren, eenmalig publiekscontact |
| **1,0–1,2** | **Baseline** — regulier bewonerscontact |
| 1,3–1,6 | Buurt/netwerk, groepswerk, initiatieven |
| 1,7–2,0 | Inclusie / verbindend programma |

---

## Energie & Besparing

| Interventie | Eco | Factor nu | Factor voorstel | Personen tellen als… | Voorbeeld registratie |
| --- | --- | ---: | ---: | --- | --- |
| Energiecoach (contactuur) | uur | 1,22 | **1,22 =** | Bewoners/huishoudens waarmee je dat contactmoment had (1 bezoek = 1, tenzij gezin expliciet meerdere) | 2 uur eco · **1 persoon** → **1,2 harten** |
| Kierenjagers | uur | 1,13 | **1,13 =** | Bewoners waarbij hands-on klus | 3 uur · **2 personen** → **2,3** |
| Energie-inloopspreekuur | uur | 1,06 | **1,06 =** | Bezoekers spreekuur (doorloop) | 4 uur · **6 personen** → **6,4** |
| Lezing over energie | stuk | 0,93 | **0,93 =** | Aantal **aanwezigen** (niet “1 stuk” voor sociaal) | 1 sessie eco · **20 personen** → **18,6** |
| Ondersteuning Mijn Huis Past | uur | 1,04 | **1,04 =** | Bewoners die je begeleidde in traject | 1,5 uur · **1 persoon** → **1,0** |
| Energieadvies bewoners | uur | 1,19 | **1,19 =** | Bewoners met adviesgesprek / huisbezoek | 2 uur · **1 persoon** → **1,2** |

**Check:** bij lezing — eco **stuk** = sessie afgerond; sociaal altijd **headcount zaal**.

---

## Groen & Leefomgeving

| Interventie | Eco | Factor nu | Factor voorstel | Personen tellen als… | Voorbeeld |
| --- | --- | ---: | ---: | --- | --- |
| Geveltuintjes aanleggen | uur | 1,33 | **1,33 =** | Bewoners + vrijwilligers actief mee (niet voorbijgangers) | 2 uur · **3 personen** → **4,0** |
| Vergroenen buurt/wijk/schoolplein | uur | 1,33 | **1,33 =** | Deelnemers actiedag (bewoners, leerlingen, ouders) | 4 uur · **12 personen** → **16,0** |
| Tegels wippen / vergroenen oprit | uur | 1,14 | **1,14 =** | Bewoners/vrijwilligers betrokken bij klus | 2,5 uur · **2 personen** → **2,3** |
| Moestuin / buurttuin | uur | 1,52 | **1,52 =** | Deelnemers tuinmoment (regelmatige groep mag per sessie) | 3 uur · **8 personen** → **12,2** |
| Ondersteunen groeninitiatieven | uur | 1,52 | **1,52 =** | Kernteam + bewoners in overleg/actie | 2 uur · **5 personen** → **7,6** |
| Stationspark / buurtgroen | uur | 1,28 | **1,28 =** | Meedoeners actie (mix buurt) | 3 uur · **6 personen** → **7,7** |

---

## Hergebruik & Circulair

| Interventie | Eco | Factor nu | Factor voorstel | Personen tellen als… | Voorbeeld |
| --- | --- | ---: | ---: | --- | --- |
| Repaircafé — hersteld item | stuk | 1,04 | **1,04 =** | **Bezoeker** wiens item is meegenomen (1 stuk eco ≈ 1 bezoeker sociaal) | 2 stuks eco · **2 personen** → **2,1** |
| Kledingruil — item geruild | stuk | 1,14 | **1,14 =** | Personen die ruilen/ iets meenemen (per transactie 1 persoon) | 4 stuks · **4 personen** → **4,6** |
| Kledingatelier / naaiatelier | uur | 1,33 | **1,33 =** | Deelnemers aan atelier-sessie | 2 uur · **5 personen** → **6,7** |
| Kledingbank — item uitgifte | stuk | 1,44 | **1,44 =** | **Ontvangers** hulp (1 item ≈ 1 persoon) | 3 stuks · **3 personen** → **4,3** |
| Speelgoedruilkast — item | stuk | 1,04 | **1,04 =** | Kind/ouder die ruilt (1 item ≈ 1 gezin/persoon) | 1 stuk · **1 persoon** → **1,0** |
| Hergebruik materialen | kg | 1,04 | **1,04 =** **?** | **Niet kg.** Personen direct betrokken (afhalers, makers, bewoners op locatie) | 8 kg eco · **2 personen** → **2,1** |

**Check:** bij **stuk/kg eco** — sociaal blijft **personen**, nooit stuk/kg herhalen.

---

## Ontmoeting & Bewustwording

| Interventie | Eco | Factor nu | Factor voorstel | Personen tellen als… | Voorbeeld |
| --- | --- | ---: | ---: | --- | --- |
| Opruimactie | uur | 1,32 | **1,32 =** | Deelnemers opruimactie | 2 uur · **10 personen** → **13,2** |
| Taal & Tuin | uur | 1,82 | **1,82 =** | Deelnemers programma (inclusie zwaar) | 2 uur · **6 personen** → **10,9** |
| Duurzame buurtactiviteit | uur | 1,52 | **1,52 =** | Aanwezigen activiteit | 3 uur · **15 personen** → **22,8** |
| Buurtcamping (uren inzet) | uur | 1,82 | **1,82 =** | Deelnemers + bewoners in programma | 4 uur · **20 personen** → **36,4** |
| Bewustwordingsactiviteit | uur | 1,52 | **1,52 =** | Bereikte deelnemers | 2 uur · **8 personen** → **12,2** |
| Workshop / bijeenkomst | uur | 1,38 | **1,38 =** | Aanwezigen workshop | 2 uur · **12 personen** → **16,6** |
| Verbindend bewonersinitiatief | uur | 1,74 | **1,74 =** | Kernduwen + bewoners in verbindend overleg | 1,5 uur · **4 personen** → **7,0** |

---

## Duurzame Mobiliteit

| Interventie | Eco | Factor nu | Factor voorstel | Personen tellen als… | Voorbeeld |
| --- | --- | ---: | ---: | --- | --- |
| Deelmobiliteit | km | 0,34 | **0,34 =** | **0 bewoners** idealiter → app vereist min. **1**: tel **1** als alleen teamrit, anders bewoners bereikt | 15 km · **1 persoon** → **0,3** |
| Teamfietsen | km | 0,48 | **0,48 =** | Idem: bewoners mee op tour = tel hen; anders **1** (eigen team) | 20 km · **1 persoon** → **0,5** |
| Bakfiets inzet | km | 0,43 | **0,43 =** | Idem | 8 km · **1 persoon** → **0,4** |
| Bewoners aanmoedigen vervoer | km | 0,62 | **0,62 =** | **Bewoners** waarmee gesprek/stimulering (niet km) | 5 km · **3 personen** → **1,9** |

**Check:** mobiliteit is **eco-dominant**. Sociale score blijft bewust laag tenzij bewoners expliciet bereikt worden.

---

## Afval & Scheiding

| Interventie | Eco | Factor nu | Factor voorstel | Personen tellen als… | Voorbeeld |
| --- | --- | ---: | ---: | --- | --- |
| Afval scheiden kantoor | uur | 0,84 | **0,84 =** | Collega's actief betrokken (intern; geen bewoners) | 1 uur · **4 personen** → **3,4** |
| Afvalscheiding bewonersinitiatief | uur | 1,32 | **1,32 =** | Bewoners in actie | 2 uur · **8 personen** → **10,6** |
| Bewustmaking afval evenement | stuk | 1,26 | **1,26 =** | Bezoekers bereikt op evenement | 1 evt eco · **50 personen** → **63,0** |
| Zwerfafvalactie | uur | 1,22 | **1,22 =** | Deelnemers actie | 2 uur · **6 personen** → **7,3** |

---

## Voorgestelde wijzigingen t.o.v. nu (samenvatting)

| # | Wat | Voorstel |
| --- | --- | --- |
| 1 | **`social_unit`** | Overal **`personen`** (0010-SQL / seed) |
| 2 | **`social_score_factor`** | **Geen bulk-wijziging** — ADR 0007-waarden behouden tenzij jij anders markeert |
| 3 | **Telinstructie** | Toevoegen aan `docs/medewerkers-registratie-eenheid.md` per categorie (kort) |
| 4 | **Mobiliteit / app min. 1** | Teamafspraak: “geen bewoners → sociaal **1** (eigen inzet)” |
| 5 | **Lezing / evenement** | Eco = sessie/event; sociaal = **headcount** |

### Optioneel te bespreken (factor ?)

| Interventie | Nu | Alternatief | Reden |
| --- | ---: | ---: | --- |
| Lezing over energie | 0,93 | 0,85–0,95 | Massa vs. diepte — nu oké midden |
| Hergebruik materialen | 1,04 | 0,90 | Minder relationeel dan repaircafé? |
| Afval kantoor | 0,84 | 0,70 | Puur intern, geen bewonersbereik |

---

## Na jouw OK → SQL

Uitgevoerd in **`supabase/sql/0011_lev_social_metrics.sql`** (2026-05-26).

---

## Jouw feedback (invullen)

- [x] Energie & Besparing  
- [x] Groen & Leefomgeving  
- [x] Hergebruik & Circulair  
- [x] Ontmoeting & Bewustwording  
- [x] Duurzame Mobiliteit  
- [x] Afval & Scheiding  

Goedgekeurd zonder factorwijzigingen t.o.v. ADR 0007.
