---
name: review
description: Performs a structured self-review of the current diff focusing on RLS, server/client boundaries, secrets, Zod validation, tests, UX states, mobile layout, and documentation. Use when the user asks for a review or says @review.
---

# Skill: Self-Review

Wanneer de gebruiker zegt `@review`, loop de wijziging door v--r je commit/push/PR afrondt.

## Checklist

- [ ] **RLS**: Staat RLS aan op nieuwe tabellen? Zijn policies correct en minimaal?
- [ ] **Server/Client-boundary**: Geen secrets in client bundle? Geen `service_role` usage in client? Alleen server-side data access waar nodig?
- [ ] **Validatie**: Is input-validatie server-side met Zod aanwezig (en wordt deze afgedwongen)?
- [ ] **Tests**: Zijn tests toegevoegd/aangepast voor nieuwe business-logica? Faalt niets?
- [ ] **UX states**: Error/loading/empty states aanwezig waar relevant?
- [ ] **Mobile-first**: Werkt de flow op small screens (form layout, buttons, spacing, scroll)?
- [ ] **Commits**: Klein en conventional (`feat:`, `fix:`, `docs:`, etc.)?
- [ ] **Progress**: Is `docs/progress.md` bijgewerkt?

## Rapportage

Rapporteer bevindingen als:
- **Blockers**: moet v--r merge/commit
- **Aanraders**: sterk aanbevolen, maar niet blocker
- **Nice-to-haves**: optioneel

Commit/push pas als de gebruiker dat expliciet vraagt.
