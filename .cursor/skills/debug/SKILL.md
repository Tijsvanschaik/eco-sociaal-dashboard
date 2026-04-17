---
name: debug
description: Runs a systematic debugging workflow: reproduce, isolate, inspect logs, form a hypothesis, add a failing test, implement the smallest fix, verify, and document. Use when the user reports a bug, failing test/build, runtime error, or says @debug.
---

# Skill: Debug

Wanneer de gebruiker zegt `@debug` (optioneel met context zoals error message of route), debug systematisch en bewijs-gedreven.

## Workflow

1. **Reproduceer**  
   - Verzamel: exacte error, stacktrace, route, omgeving (dev/preview/prod), stappen om te reproduceren.  
   - Reproduceer lokaal of via test-run als dat kan.

2. **Minimaliseer & isoleer**  
   - Maak het probleem zo klein mogelijk (kleinste input, kleinste pagina/actie).  
   - Bepaal of het client, server, DB (RLS), netwerk, of build/typecheck is.

3. **Inspecteer signalen**  
   - Check relevante logs/output (server logs, browser console, test output).  
   - Zoek regressies: “wat is recent veranderd” (diff/commit range) als relevant.

4. **Hypothese -> experiment**  
   - Formuleer 1–2 hypotheses.  
   - Doe snelle checks om hypotheses te falsifi-ren (niet “random” proberen).

5. **Maak het reproduceerbaar in code (waar zinvol)**  
   - Voor pure logic: voeg een **failing unit test** toe.  
   - Voor RLS: voeg/upgrade een **integration test** (worker/admin/anon).  
   - Voor UI: voeg een **component test** toe als de bug in form/interaction zit.

6. **Fix (kleinst mogelijke wijziging)**  
   - Fix de root cause, niet alleen de symptoom.  
   - Houd rekening met security (RLS, server-side Zod, geen secrets).

7. **Verifieer**  
   - Test opnieuw: de eerder falende test/build moet slagen.  
   - Check edge cases en regressie-risico’s.

8. **Documenteer kort**  
   - Update `docs/progress.md` als dit user-visible gedrag of een belangrijke bugfix is.

## Output format (wat je terugrapporteert)

- **Root cause**: 1 zin
- **Fix**: 1–2 zinnen
- **Proof**: welke test/command nu groen is
- **Risks**: wat kan nog breken / wat is niet gedekt
