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
import { LOGIN_OTP_LENGTH, loginOtpTokenSchema, sanitizeLoginOtpInput } from "@/lib/auth/login-otp";

import { sendMagicLink, signInWithPassword, verifyLoginOtp } from "./actions";

const inputClassName =
  "h-auto w-full rounded-[1.5rem] border-0 bg-input px-6 py-4 text-base text-foreground shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 dark:bg-input";

const otpInputClassName =
  "h-auto w-full rounded-[1.5rem] border-0 bg-input px-6 py-4 text-center text-2xl font-semibold tracking-[0.2em] text-foreground shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 dark:bg-input";

const headingClassName = "mb-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl";

const magicLinkHeading = "Welkom op het Eco-sociaal Dashboard";

const labelClassName = "ml-1 text-sm font-semibold text-foreground";

const magicLinkSchema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in."),
});
type MagicLinkFormValues = z.infer<typeof magicLinkSchema>;

const otpOnlySchema = z.object({
  otp: loginOtpTokenSchema,
});
type OtpOnlyFormValues = z.infer<typeof otpOnlySchema>;

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

  if (status === "sent" && sentEmail) {
    return (
      <MagicLinkSentState
        email={sentEmail}
        onUseOtherEmail={() => {
          setStatus("idle");
          setSentEmail(undefined);
          setErrorMessage(undefined);
        }}
        redirectTo={redirectTo}
      />
    );
  }

  return (
    <>
      <h1 className={headingClassName}>{magicLinkHeading}</h1>
      <p className="mb-10 text-lg leading-relaxed text-muted-foreground">
        Log in met jouw werk-emailadres om verder te gaan.
      </p>
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
                <span>Doorgaan</span>
                <Icon name="arrow_forward" className="text-xl" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}

function MagicLinkSentState({
  email,
  onUseOtherEmail,
  redirectTo,
}: {
  email: string;
  onUseOtherEmail: () => void;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<OtpOnlyFormValues>({
    resolver: zodResolver(otpOnlySchema),
    defaultValues: { otp: "" },
    mode: "onTouched",
  });

  function onSubmit(values: OtpOnlyFormValues) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("email", email);
      fd.set("otp", values.otp);
      if (redirectTo) fd.set("redirectTo", redirectTo);
      const result = await verifyLoginOtp(fd);
      if (result.status === "ok") {
        form.reset({ otp: "" });
        router.push(result.redirectTo);
        router.refresh();
      } else {
        setErrorMessage(result.message);
      }
    });
  }

  return (
    <div className="space-y-6" aria-live="polite">
      <output className="block rounded-[1.5rem] bg-background p-4 sm:p-5">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:gap-3.5 sm:text-left">
          <span
            aria-hidden
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-primary-container text-primary shadow-sm"
          >
            <Icon name="mark_email_unread" filled className="text-[1.35rem]" />
          </span>
          <div className="min-w-0 space-y-1.5">
            <p className="text-base font-bold tracking-tight text-foreground">Check je inbox</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We hebben een mail gestuurd naar{" "}
              <span className="font-semibold text-foreground">{email}</span> met een loginlink en
              een {LOGIN_OTP_LENGTH}-cijferige code. Klik op de link in de mail, of plak de code
              hieronder.
            </p>
          </div>
        </div>
      </output>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClassName}>{LOGIN_OTP_LENGTH}-cijferige code</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={LOGIN_OTP_LENGTH}
                    placeholder={"0".repeat(LOGIN_OTP_LENGTH)}
                    className={otpInputClassName}
                    {...field}
                    onChange={(event) => {
                      field.onChange(sanitizeLoginOtpInput(event.target.value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {errorMessage && (
            <p className="text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          )}
          <Button
            type="submit"
            variant="brand"
            className="h-auto w-full py-4 text-base md:text-lg"
            disabled={isPending || !form.formState.isValid}
          >
            {isPending ? "Bezig met inloggen..." : "Inloggen"}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <button
          type="button"
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          onClick={onUseOtherEmail}
        >
          Andere e-mail gebruiken
        </button>
      </div>
    </div>
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
                  placeholder="Vul je wachtwoord in"
                  className={inputClassName}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
