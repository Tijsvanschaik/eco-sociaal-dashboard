import { z } from "zod";

export const registrationSchema = z.object({
  teamId: z.string().uuid("Kies een team."),
  interventionId: z.string().uuid("Kies een interventie."),
  quantity: z.coerce
    .number({
      invalid_type_error: "Vul een hoeveelheid in.",
    })
    .positive("Hoeveelheid moet groter zijn dan 0.")
    .max(1_000_000, "Hoeveelheid is te hoog."),
  happenedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Kies een geldige datum."),
  note: z
    .string()
    .max(500, "Notitie mag maximaal 500 tekens zijn.")
    .trim()
    .optional()
    .transform((value) => value || undefined),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export function registrationInputFromFormData(formData: FormData): RegistrationInput {
  return registrationSchema.parse({
    teamId: formData.get("teamId"),
    interventionId: formData.get("interventionId"),
    quantity: formData.get("quantity"),
    happenedOn: formData.get("happenedOn"),
    note: formData.get("note"),
  });
}
