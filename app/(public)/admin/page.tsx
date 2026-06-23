import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginHero } from "@/components/brand/login-hero";
import { Logo } from "@/components/brand/logo";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "../login/login-form";

type SearchParams = Promise<{ redirectTo?: string; error?: string }>;

export const metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  code_exchange: "Deze login-link is verlopen of al gebruikt. Vraag een nieuwe aan.",
  missing_code: "Deze link is ongeldig. Vraag een nieuwe aan.",
};

export default async function AdminLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const { redirectTo, error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : undefined;

  return (
    <div className="min-h-dvh bg-background p-4 md:p-6">
      <div className="mx-auto flex h-[calc(100dvh-2rem)] w-full max-w-screen-2xl flex-col md:h-[calc(100dvh-3rem)] md:flex-row md:gap-6">
        <main className="relative flex h-full w-full flex-col rounded-[2rem] bg-card shadow-[0_20px_40px_rgba(54,50,45,0.04)] md:w-1/2">
          <header className="flex flex-row items-center justify-between gap-3 p-6 md:p-8">
            <Link
              href="/"
              aria-label="Naar home"
              className="min-w-0 shrink rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Logo className="h-7 w-auto max-w-[9.5rem] min-[400px]:max-w-[10.5rem] md:h-8 lg:max-w-none" />
            </Link>
          </header>

          <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-6 pb-12 md:px-10">
            <div className="w-full max-w-sm">
              <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
                Admin login
              </h1>
              <p className="mb-10 text-lg leading-relaxed text-muted-foreground">
                Log in met je platform-account.
              </p>

              {errorMessage && (
                <p
                  className="mb-6 rounded-[1.25rem] border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                  role="alert"
                >
                  {errorMessage}
                </p>
              )}

              <LoginForm mode="password" redirectTo={redirectTo} />
            </div>
          </div>
        </main>

        <LoginHero className="hidden md:flex md:w-1/2" />
      </div>
    </div>
  );
}
