---
name: new-feature
description: Guides implementing a new product feature end-to-end (story, acceptance criteria, Zod validation, tests first, server implementation, UI, progress update, and conventional commit). Use when the user asks for a new feature or says @new-feature.
---

# Skill: New Feature

Wanneer de gebruiker zegt `@new-feature <naam>`, volg dit vaste pad en blijf iteratief (kleine opleverbare stappen).

## Werkwijze

1. **Verduidelijk scope**  
   Vraag om een korte user story en acceptatiecriteria (liefst in bullets). Verzamel ook randvoorwaarden (rollen/tenants, public vs private, performance, tracking, i18n).

2. **Past dit in de huidige fase?**  
   Check of dit binnen de huidige MVP/fase valt. Als het mogelijk scope-creep is, vraag expliciet om bevestiging v--r je verder bouwt.

3. **Ontwerp eerst de inputs (server-side)**  
   - Definieer een Zod-schema voor alle inputs (inclusief defaults, bounds, enums).  
   - Bepaal wat de server accepteert vs wat de UI toont.  
   - Wees strikt: strip/normalize waar nodig.

4. **Schrijf eerst een failing unit test (kernlogica)**  
   - Identificeer de “pure” kernlogica en test edge cases.  
   - Zorg dat de test faalt v--r de implementatie.

5. **Implementeer server-side**  
   Bouw de feature in een Server Action of Route Handler (kies wat past bij Next.js architectuur in dit project).  
   - Valideer inputs server-side met het Zod-schema.  
   - Respecteer multi-tenancy en security (geen secrets naar client, RLS als DB betrokken is).  
   - Voeg duidelijke error handling toe.

6. **Implementeer UI**  
   - Gebruik een Server Component waar mogelijk.  
   - Gebruik een client form alleen waar nodig (form state/validation UX).  
   - Zorg voor loading/error/empty states en mobile-first layout.

7. **Voeg component-test toe als UI niet triviaal is**  
   Gebruik Vitest + Testing Library voor kritieke UI flows (valideert, toont errors, disabled submit, happy path).

8. **Update documentatie**  
   Werk `docs/progress.md` bij met wat er is opgeleverd en wat nog open staat.

9. **Commit**  
   Commit met conventionele commit message: `feat: <naam>`.  
   Commit pas als de gebruiker expliciet vraagt om te committen.

## Output templates

Als de gebruiker nog geen story/criteria heeft, vraag minimaal:

```text
User story:
Als <rol> wil ik <doel>, zodat <waarde>.

Acceptatiecriteria:
- [ ] ...
- [ ] ...

Niet-doen (out of scope):
- ...
```
