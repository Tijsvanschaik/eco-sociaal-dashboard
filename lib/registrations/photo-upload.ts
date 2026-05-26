import type { SupabaseClient } from "@supabase/supabase-js";

import { PHOTO_UPLOAD_ACCEPTED_MIMES, PHOTO_UPLOAD_MAX_BYTES } from "@/lib/registrations/schema";

export const REGISTRATIONS_BUCKET = "registrations";

export type PhotoUploadResult =
  | { status: "ok"; path: string }
  | { status: "error"; message: string };

/** Client-side validatie. Gooit een beschrijvende fout bij ongeldige input. */
export function validatePhotoFile(file: File): { ok: true } | { ok: false; message: string } {
  if (!PHOTO_UPLOAD_ACCEPTED_MIMES.has(file.type)) {
    return {
      ok: false,
      message: "Gebruik een JPG, PNG, WEBP of HEIC-afbeelding.",
    };
  }
  if (file.size > PHOTO_UPLOAD_MAX_BYTES) {
    return {
      ok: false,
      message: `Deze foto is te groot (${Math.round(file.size / 1024 / 1024)} MB). Max 5 MB.`,
    };
  }
  return { ok: true };
}

function extensionFor(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{1,8}$/.test(fromName)) return fromName;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/heic") return "heic";
  if (file.type === "image/heif") return "heif";
  return "jpg";
}

/**
 * Upload een foto naar de `registrations` bucket onder `{orgId}/{userId}/{uuid}.{ext}`.
 * Dat pad-formaat is vereist door de Storage-RLS (zie 0001_init.sql):
 * `split_part(name, '/', 1) = orgId`. Owner (userId) zit erachter zodat elke
 * gebruiker z'n eigen upload kan verwijderen.
 */
export async function uploadRegistrationPhoto({
  file,
  orgId,
  supabase,
  userId,
}: {
  file: File;
  orgId: string;
  supabase: SupabaseClient;
  userId: string;
}): Promise<PhotoUploadResult> {
  const validation = validatePhotoFile(file);
  if (!validation.ok) {
    return { status: "error", message: validation.message };
  }

  const ext = extensionFor(file);
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const path = `${orgId}/${userId}/${randomId}.${ext}`;

  const { error } = await supabase.storage.from(REGISTRATIONS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("[registration-photo] upload failed", error.message);
    return {
      status: "error",
      message: "Foto uploaden lukte niet. Probeer het nog eens.",
    };
  }

  return { status: "ok", path };
}

/** Probeert een object uit de registratie-bucket te verwijderen (best-effort). */
export async function cleanupStoragePhoto(
  supabase: SupabaseClient,
  path: string | undefined | null,
): Promise<void> {
  if (!path) return;
  const { error } = await supabase.storage.from(REGISTRATIONS_BUCKET).remove([path]);
  if (error) {
    console.error("[registration-photo] cleanup failed", error.message);
  }
}

/** Probeert een object uit de registratie-bucket te verwijderen. */
export async function deleteRegistrationPhoto({
  path,
  supabase,
}: {
  path: string;
  supabase: SupabaseClient;
}): Promise<void> {
  const { error } = await supabase.storage.from(REGISTRATIONS_BUCKET).remove([path]);
  if (error) {
    console.error("[registration-photo] delete failed", error.message);
  }
}
