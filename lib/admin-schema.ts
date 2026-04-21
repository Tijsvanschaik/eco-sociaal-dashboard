import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const teamSchema = z.object({
  name: z.string().trim().min(1, "Naam is verplicht.").max(80, "Naam is te lang."),
});

export const categorySchema = z.object({
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Kies een geldige kleur."),
  name: z.string().trim().min(1, "Naam is verplicht.").max(80, "Naam is te lang."),
});

export const interventionSchema = z.object({
  categoryId: z.string().uuid("Kies een categorie."),
  co2FactorKg: z.coerce.number().min(0, "CO2-factor mag niet negatief zijn."),
  name: z.string().trim().min(1, "Naam is verplicht.").max(80, "Naam is te lang."),
  unit: z.enum(["kg", "km", "maaltijd", "kwh", "stuk", "uur", "liter", "dag"]),
});

export const orgProfileSchema = z.object({
  description: z
    .string()
    .trim()
    .max(280, "Beschrijving is te lang (max 280 tekens).")
    .optional()
    .or(z.literal("")),
  logoUrl: z.union([
    z.literal(""),
    z.string().trim().url("Geef een geldige URL op (inclusief https://)."),
  ]),
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
