import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const teamSchema = z.object({
  name: z.string().trim().min(1, "Naam is verplicht.").max(80, "Naam is te lang."),
});

export const teamUpdateSchema = teamSchema.extend({
  id: z.string().uuid("Ongeldig team."),
});

export const categorySchema = z.object({
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Kies een geldige kleur."),
  name: z.string().trim().min(1, "Naam is verplicht.").max(80, "Naam is te lang."),
});

export const categoryUpdateSchema = categorySchema.extend({
  id: z.string().uuid("Ongeldige categorie."),
});

export const archiveEntitySchema = z.object({
  id: z.string().uuid("Ongeldige id."),
});

const unitLabelSchema = z
  .string()
  .trim()
  .min(1, "Eenheid is verplicht.")
  .max(40, "Eenheid is te lang (max. 40 tekens).");

export const interventionSchema = z.object({
  categoryId: z.string().uuid("Kies een categorie."),
  co2FactorKg: z.coerce.number().min(0, "CO2-factor mag niet negatief zijn."),
  ecoUnit: unitLabelSchema,
  name: z.string().trim().min(1, "Naam is verplicht.").max(80, "Naam is te lang."),
  socialScoreFactor: z.coerce.number().min(0, "Sociale score-factor mag niet negatief zijn."),
  socialUnit: unitLabelSchema,
});

export const interventionUpdateSchema = interventionSchema.extend({
  id: z.string().uuid("Ongeldige activiteit."),
});

export const orgProfileSchema = z.object({
  description: z
    .string()
    .trim()
    .max(4000, "Missie (uitgebreid) is te lang (max. 4000 tekens).")
    .optional()
    .or(z.literal("")),
  impactDisclaimer: z
    .string()
    .trim()
    .max(2000, "Disclaimer is te lang (max. 2000 tekens).")
    .optional()
    .or(z.literal("")),
  missionShort: z
    .string()
    .trim()
    .max(280, "Missie kort is te lang (max. 280 tekens).")
    .optional()
    .or(z.literal("")),
  name: z.string().trim().min(2, "Naam is te kort.").max(120, "Naam is te lang."),
});

export const orgSettingsSchema = z
  .object({
    eodBaselineDate: z.string().optional(),
    eodBaselineKg: z.union([
      z.literal(""),
      z.coerce.number().positive("Baseline moet groter zijn dan 0."),
    ]),
    publicShareEnabled: z.boolean().default(false),
    publicShareSlug: z.union([
      z.literal(""),
      z.string().regex(slugPattern, "Gebruik alleen kleine letters, cijfers en koppeltekens."),
    ]),
  })
  .superRefine((data, ctx) => {
    if (data.publicShareEnabled && !data.publicShareSlug) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vul een publieke slug in om delen in te schakelen.",
        path: ["publicShareSlug"],
      });
    }
  });

export const membershipUpdateSchema = z.object({
  role: z.enum(["admin", "worker"]),
  userId: z.string().uuid("Ongeldige gebruiker."),
});

export const memberTeamUpdateSchema = z.object({
  teamId: z.string().uuid("Kies een team."),
  userId: z.string().uuid("Ongeldige gebruiker."),
});

export const removeMemberSchema = z.object({
  userId: z.string().uuid("Ongeldige gebruiker."),
});

export const provisionUserSchema = z
  .object({
    email: z.string().email("Vul een geldig e-mailadres in."),
    role: z.enum(["admin", "worker"]),
    teamId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "worker" && !data.teamId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Kies een team voor een medewerker.",
        path: ["teamId"],
      });
    }
  });

export const createOrgSchema = z.object({
  adminEmail: z.string().email("Vul een geldig e-mailadres in."),
  orgName: z.string().trim().min(2, "Naam is te kort.").max(120, "Naam is te lang."),
  orgSlug: z
    .string()
    .trim()
    .regex(slugPattern, "Gebruik alleen kleine letters, cijfers en koppeltekens."),
});
