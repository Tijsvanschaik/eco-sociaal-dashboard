export const ORG_LOGOS_BUCKET = "org-logos";

export const ORG_LOGO_MAX_BYTES = 5 * 1024 * 1024;

export const ORG_LOGO_ACCEPTED_MIMES = new Set(["image/png", "image/svg+xml", "image/webp"]);

export type OrgLogoValidationResult = { ok: true } | { ok: false; message: string };

export function validateOrgLogoFile(file: Pick<File, "size" | "type">): OrgLogoValidationResult {
  if (!ORG_LOGO_ACCEPTED_MIMES.has(file.type)) {
    return {
      ok: false,
      message: "Gebruik een PNG, SVG of WEBP-bestand.",
    };
  }
  if (file.size > ORG_LOGO_MAX_BYTES) {
    return {
      ok: false,
      message: `Dit logo is te groot (${Math.round(file.size / 1024 / 1024)} MB). Max 5 MB.`,
    };
  }
  return { ok: true };
}

function extensionFor(file: Pick<File, "name" | "type">): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{1,8}$/.test(fromName)) return fromName;
  if (file.type === "image/svg+xml") return "svg";
  if (file.type === "image/webp") return "webp";
  return "png";
}

export function buildOrgLogoStoragePath(orgId: string, file: Pick<File, "name" | "type">): string {
  const ext = extensionFor(file);
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${orgId}/${randomId}.${ext}`;
}

export function getOrgLogoPublicUrl(supabaseUrl: string, storagePath: string): string {
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${ORG_LOGOS_BUCKET}/${storagePath}`;
}

export function isManagedOrgLogoUrl(
  url: string | null | undefined,
  orgId: string,
  supabaseUrl: string,
): boolean {
  if (!url?.trim()) return false;
  const bucketPrefix = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${ORG_LOGOS_BUCKET}/${orgId}/`;
  return url.startsWith(bucketPrefix);
}

export function extractOrgLogoStoragePath(
  url: string,
  orgId: string,
  supabaseUrl: string,
): string | null {
  if (!isManagedOrgLogoUrl(url, orgId, supabaseUrl)) return null;
  const bucketPrefix = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${ORG_LOGOS_BUCKET}/`;
  return url.slice(bucketPrefix.length);
}
