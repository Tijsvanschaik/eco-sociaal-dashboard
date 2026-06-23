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

  if (modeParam === "password") {
    const params = new URLSearchParams();
    if (redirectTo) params.set("redirectTo", redirectTo);
    if (error) params.set("error", error);
    const qs = params.toString();
    redirect(qs ? `/admin?${qs}` : "/admin");
  }

  const errorMessage = error ? ERROR_MESSAGES[error] : undefined;

  return (
    <div className="min-h-dvh bg-background p-4 md:p-6">
      <div className="mx-auto flex h-[calc(100dvh-2rem)] w-full max-w-screen-2xl flex-col md:h-[calc(100dvh-3rem)] md:flex-row md:gap-6">
        <main className="relative flex h-full w-full flex-col rounded-[2rem] bg-card shadow-[0_20px_40px_rgba(54,50,45,0.04)] md:w-1/2">
          <header className="flex flex-row items-center justify-between gap-3 p-6 max-[360px]:flex-col max-[360px]:items-stretch md:p-8">
            <Link
              href="/"
              aria-label="Naar home"
              className="min-w-0 shrink rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Logo className="h-7 w-auto max-w-[9.5rem] min-[400px]:max-w-[10.5rem] md:h-8 lg:max-w-none" />
            </Link>
            <nav className="flex shrink-0 items-center justify-end gap-2 min-[400px]:gap-3 lg:gap-6">
              <a
                href={CONTACT_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-secondary px-4 text-xs font-semibold text-foreground transition-colors hover:bg-accent min-[400px]:px-5 min-[400px]:text-sm"
              >
                <span className="lg:hidden">Contact</span>
                <span className="hidden lg:inline">Contact opnemen</span>
              </a>
            </nav>
          </header>

          <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-6 pb-12 md:px-10">
            <div className="w-full max-w-sm">
              {errorMessage && (
                <p
                  className="mb-6 rounded-[1.25rem] border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                  role="alert"
                >
                  {errorMessage}
                </p>
              )}

              <LoginForm redirectTo={redirectTo} />

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
