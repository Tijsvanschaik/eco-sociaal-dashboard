import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { LoginForm } from "./login-form";

type SearchParams = Promise<{ redirectTo?: string; error?: string }>;

export const metadata = {
  title: "Inloggen",
};

const ERROR_MESSAGES: Record<string, string> = {
  code_exchange: "Deze login-link is verlopen of al gebruikt. Vraag een nieuwe aan.",
  missing_code: "Deze link is ongeldig. Vraag een nieuwe aan.",
};

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
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
    <div className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Inloggen</CardTitle>
          <CardDescription>
            Gebruik standaard een magic-link. Tijdelijk is er ook een wachtwoord-login voor admins
            en testgebruikers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <p
              className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              {errorMessage}
            </p>
          )}
          <LoginForm redirectTo={redirectTo} />
        </CardContent>
      </Card>
    </div>
  );
}
