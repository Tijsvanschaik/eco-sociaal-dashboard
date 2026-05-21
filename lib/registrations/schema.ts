import { z } from "zod";

/**
 * Storage-pad voor registratie-foto's. Moet beginnen met `{orgId}/` (dit
 * matcht met de RLS-policy `registrations_storage_insert_member`). De rest
 * kan een willekeurig nested pad met alfanumeriek + `-_./` karakters zijn.
 */
const photoPathPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[A-Za-z0-9][A-Za-z0-9._\-/]{1,200}$/;

export const registrationSchema = z.object({
  teamId: z.string().uuid("Kies een team."),
  interventionId: z.string().uuid("Kies een interventie."),
  quantity: z.coerce
    .number({
      invalid_type_error: "Vul een eco-hoeveelheid in.",
    })
    .positive("Eco-hoeveelheid moet groter zijn dan 0.")
    .max(1_000_000, "Eco-hoeveelheid is te hoog."),
  socialQuantity: z.coerce
    .number({
      invalid_type_error: "Vul een sociale hoeveelheid in.",
    })
    .positive("Sociale hoeveelheid moet groter zijn dan 0.")
    .max(1_000_000, "Sociale hoeveelheid is te hoog."),
  happenedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Kies een geldige datum."),
  note: z
    .string()
    .max(500, "Notitie mag maximaal 500 tekens zijn.")
    .trim()
    .optional()
    .transform((value) => value || undefined),
  photoPath: z
    .string()
    .regex(photoPathPattern, "Ongeldig foto-pad.")
    .optional()
    .transform((value) => value || undefined),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export function registrationInputFromFormData(formData: FormData): RegistrationInput {
  return registrationSchema.parse({
    teamId: formData.get("teamId"),
    interventionId: formData.get("interventionId"),
    quantity: formData.get("quantity"),
    socialQuantity: formData.get("socialQuantity"),
    happenedOn: formData.get("happenedOn"),
    note: formData.get("note"),
    // FormData.get levert `null` als het veld ontbreekt; zod .optional accepteert
    // alleen undefined. We fallen bewust terug op undefined zodat een
    // registratie-zonder-foto netjes door de schema heen komt.
    photoPath: formData.get("photoPath") ?? undefined,
  });
}

export const PHOTO_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const PHOTO_UPLOAD_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";
export const PHOTO_UPLOAD_ACCEPTED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
