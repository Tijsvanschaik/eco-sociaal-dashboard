"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { sendMagicLink, signInWithPassword } from "./actions";

const magicLinkSchema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in."),
});
type MagicLinkFormValues = z.infer<typeof magicLinkSchema>;

const passwordSchema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in."),
  password: z.string().min(1, "Voer je wachtwoord in."),
});
type PasswordFormValues = z.infer<typeof passwordSchema>;

type UiState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "error"; message: string };

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const magicLinkForm = useForm<MagicLinkFormValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });
  const [state, setState] = useState<UiState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  function onMagicLinkSubmit(values: MagicLinkFormValues) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("email", values.email);
      if (redirectTo) fd.set("redirectTo", redirectTo);
      const result = await sendMagicLink(fd);
      if (result.status === "ok") {
        setState({ status: "sent", email: result.email });
        magicLinkForm.reset();
      } else {
        setState({ status: "error", message: result.message });
      }
    });
  }

  function onPasswordSubmit(values: PasswordFormValues) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("email", values.email);
      fd.set("password", values.password);
      if (redirectTo) fd.set("redirectTo", redirectTo);

      const result = await signInWithPassword(fd);
      if (result.status === "ok") {
        setState({ status: "idle" });
        passwordForm.reset({ email: "", password: "" });
        router.push(result.redirectTo);
        router.refresh();
      } else {
        setState({ status: "error", message: result.message });
      }
    });
  }

  if (state.status === "sent" && mode === "magic") {
    return (
      <div className="space-y-2 rounded-md border bg-muted/40 p-4 text-sm" aria-live="polite">
        <p className="font-medium">Check je inbox</p>
        <p className="text-muted-foreground">
          We hebben een login-link gestuurd naar{" "}
          <span className="font-medium text-foreground">{state.email}</span>. Klik de link om in te
          loggen. Hij werkt eenmalig en verloopt na een uur.
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            setState({ status: "idle" });
            setMode("password");
          }}
        >
          Gebruik tijdelijk wachtwoord
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-md bg-muted p-1">
        <Button
          type="button"
          variant={mode === "magic" ? "default" : "ghost"}
          onClick={() => {
            setMode("magic");
            setState({ status: "idle" });
          }}
        >
          Magic link
        </Button>
        <Button
          type="button"
          variant={mode === "password" ? "default" : "ghost"}
          onClick={() => {
            setMode("password");
            setState({ status: "idle" });
          }}
        >
          Tijdelijk wachtwoord
        </Button>
      </div>

      {mode === "magic" ? (
        <Form key="magic-login-form" {...magicLinkForm}>
          <form
            onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={magicLinkForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mailadres</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="jij@lev-groep.nl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {state.status === "error" && (
              <p className="text-sm text-destructive" role="alert">
                {state.message}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isPending || !magicLinkForm.formState.isValid}
            >
              {isPending ? "Versturen..." : "Stuur login-link"}
            </Button>
          </form>
        </Form>
      ) : (
        <Form key="password-login-form" {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={passwordForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mailadres</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="jij@lev-groep.nl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wachtwoord</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      placeholder="Vul je tijdelijke wachtwoord in"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-sm text-muted-foreground">
              Tijdelijke fallback voor admins en testgebruikers zolang magic-link e-mails
              gelimiteerd zijn.
            </p>
            {state.status === "error" && (
              <p className="text-sm text-destructive" role="alert">
                {state.message}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isPending || !passwordForm.formState.isValid}
            >
              {isPending ? "Inloggen..." : "Log in met wachtwoord"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
