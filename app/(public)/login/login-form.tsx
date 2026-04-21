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
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";

import { sendMagicLink, signInWithPassword } from "./actions";

const inputClassName =
  "h-auto w-full rounded-[1.5rem] border-0 bg-input px-6 py-4 text-base text-foreground shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 md:text-lg dark:bg-input";

const labelClassName = "ml-1 text-sm font-semibold text-foreground";

const magicLinkSchema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in."),
});
type MagicLinkFormValues = z.infer<typeof magicLinkSchema>;

const passwordSchema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in."),
  password: z.string().min(1, "Voer je wachtwoord in."),
});
type PasswordFormValues = z.infer<typeof passwordSchema>;

export type LoginFormMode = "magic" | "password";

type LoginFormProps = {
  mode?: LoginFormMode;
  redirectTo?: string;
};

export function LoginForm({ mode = "magic", redirectTo }: LoginFormProps) {
  if (mode === "password") {
    return <PasswordLogin redirectTo={redirectTo} />;
  }
  return <MagicLinkLogin redirectTo={redirectTo} />;
}

function MagicLinkLogin({ redirectTo }: { redirectTo?: string }) {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [sentEmail, setSentEmail] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<MagicLinkFormValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  function onSubmit(values: MagicLinkFormValues) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("email", values.email);
      if (redirectTo) fd.set("redirectTo", redirectTo);
      const result = await sendMagicLink(fd);
      if (result.status === "ok") {
        setSentEmail(result.email);
        setStatus("sent");
        form.reset();
      } else {
        setErrorMessage(result.message);
        setStatus("error");
      }
    });
  }

  if (status === "sent") {
    return (
      <div
        className="space-y-2 rounded-[1.5rem] border border-primary/15 bg-primary-container/40 p-5 text-sm"
        aria-live="polite"
      >
        <p className="font-semibold text-on-primary-container">Check je inbox</p>
        <p className="text-muted-foreground">
          We hebben een login-link gestuurd naar{" "}
          <span className="font-medium text-foreground">{sentEmail}</span>. Hij werkt eenmalig en
          verloopt na een uur.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClassName}>Uw e-mailadres</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="bijv. hallo@organisatie.nl"
                  className={inputClassName}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {status === "error" && errorMessage && (
          <p className="text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        )}
        <Button
          type="submit"
          variant="brand"
          className="mt-2 h-auto w-full gap-2 py-4 text-base md:text-lg"
          disabled={isPending || !form.formState.isValid}
        >
          {isPending ? (
            "Versturen..."
          ) : (
            <>
              <span>Magic link versturen</span>
              <Icon name="arrow_forward" className="text-xl" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

function PasswordLogin({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  function onSubmit(values: PasswordFormValues) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("email", values.email);
      fd.set("password", values.password);
      if (redirectTo) fd.set("redirectTo", redirectTo);
      const result = await signInWithPassword(fd);
      if (result.status === "ok") {
        form.reset({ email: "", password: "" });
        router.push(result.redirectTo);
        router.refresh();
      } else {
        setErrorMessage(result.message);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClassName}>Uw e-mailadres</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="bijv. hallo@organisatie.nl"
                  className={inputClassName}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClassName}>Wachtwoord</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Vul je tijdelijke wachtwoord in"
                  className={inputClassName}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className="text-sm text-muted-foreground">
          Tijdelijke fallback voor admins en testgebruikers zolang magic-link e-mails gelimiteerd
          zijn.
        </p>
        {errorMessage && (
          <p className="text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        )}
        <Button
          type="submit"
          variant="brand"
          className="mt-2 h-auto w-full py-4 text-base md:text-lg"
          disabled={isPending || !form.formState.isValid}
        >
          {isPending ? "Inloggen..." : "Log in met wachtwoord"}
        </Button>
      </form>
    </Form>
  );
}
