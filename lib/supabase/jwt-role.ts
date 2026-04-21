type JwtPayload = {
  role?: string;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as JwtPayload;
  } catch {
    return null;
  }
}

export function assertSupabaseJwtRole(
  token: string,
  expectedRole: "anon" | "service_role",
  envName: string,
): void {
  const payload = decodeJwtPayload(token);
  const actualRole = payload?.role;
  if (actualRole !== expectedRole) {
    throw new Error(
      `${envName} is not a valid ${expectedRole} key (detected role: ${actualRole ?? "unknown"}). Copy the correct key from Supabase Settings -> API and update your environment variables.`,
    );
  }
}
