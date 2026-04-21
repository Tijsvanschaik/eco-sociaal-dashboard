import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginHero } from "@/components/brand/login-hero";
import { Logo } from "@/components/brand/logo";
import { createClient } from "@/lib/supabase/server";

import { LoginForm } from "./login-form";

type SearchParams = Promise<{ redirectTo?: string; error?: string; mode?: string }>;

export const metadata = {
  title: "Inloggen",
};

const ERROR_MESSAGES: Record<string, string> = {
  code_exchange: "Deze login-link is verlopen of al gebruikt. Vraag een nieuwe aan.",
  missing_code: "Deze link is ongeldig. Vraag een nieuwe aan.",
};

const CONTACT_HREF = "https://createdforthefuture.nl";

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const { redirectTo, error, mode: modeParam } = await searchParams;
  const mode = modeParam === "password" ? "password" : "magic";
  const errorMessage = error ? ERROR_MESSAGES[error] : undefined;

  const toggleHref = buildLoginHref({
    redirectTo,
    mode: mode === "password" ? undefined : "password",
  });
  const toggleLabel = mode === "password" ? "Gebruik magic link" : "Admin Login";

  const heading = mode === "password" ? "Admin login" : "Welkom!";
  const lede =
    mode === "password"
      ? "Log in met je tijdelijke wachtwoord. Deze fallback is er zolang magic-link e-mails gelimiteerd zijn."
      : "Log in op jouw persoonlijke omgeving om verder te gaan met het Eco-sociaal Dashboard.";

  return (
    <div className="min-h-dvh bg-background p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 md:flex-row">
        <main className="relative flex w-full flex-col rounded-[2rem] bg-card shadow-[0_20px_40px_rgba(54,50,45,0.04)] md:min-h-[calc(100dvh-3rem)] md:w-1/2">
          <header className="flex w-full items-center justify-between p-6 md:p-8">
            <Link
              href="/"
              aria-label="Naar home"
              className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Logo />
            </Link>
            <nav className="flex items-center gap-3 md:gap-6">
              <Link
                href={toggleHref}
                className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
                data-testid="login-mode-toggle"
              >
                {toggleLabel}
              </Link>
              <a
                href={CONTACT_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
              >
                Contact opnemen
              </a>
            </nav>
          </header>

          <div className="flex flex-1 items-center justify-center px-6 pb-12 md:px-10">
            <div className="w-full max-w-sm">
              <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
                {heading}
              </h1>
              <p className="mb-10 text-lg leading-relaxed text-muted-foreground">{lede}</p>

              {errorMessage && (
                <p
                  className="mb-6 rounded-[1.25rem] border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                  role="alert"
                >
                  {errorMessage}
                </p>
              )}

              <LoginForm mode={mode} redirectTo={redirectTo} />

              <p className="mt-10 text-center text-sm font-medium text-muted-foreground">
                Heeft u nog geen account?{" "}
                <a
                  href={CONTACT_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 font-bold text-primary underline-offset-4 hover:underline"
                >
                  Neem contact op!
                </a>
              </p>
            </div>
          </div>
        </main>

        <LoginHero className="hidden md:flex md:w-1/2" />
      </div>
    </div>
  );
}

function buildLoginHref({
  redirectTo,
  mode,
}: {
  redirectTo?: string;
  mode?: "password";
}) {
  const params = new URLSearchParams();
  if (redirectTo) params.set("redirectTo", redirectTo);
  if (mode) params.set("mode", mode);
  const qs = params.toString();
  return qs ? `/login?${qs}` : "/login";
}
