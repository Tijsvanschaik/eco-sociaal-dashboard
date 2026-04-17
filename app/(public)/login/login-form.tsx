"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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

import { sendMagicLink } from "./actions";

const schema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in."),
});
type FormValues = z.infer<typeof schema>;

type UiState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "error"; message: string };

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });
  const [state, setState] = useState<UiState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("email", values.email);
      if (redirectTo) fd.set("redirectTo", redirectTo);
      const result = await sendMagicLink(fd);
      if (result.status === "ok") {
        setState({ status: "sent", email: result.email });
        form.reset();
      } else {
        setState({ status: "error", message: result.message });
      }
    });
  }

  if (state.status === "sent") {
    return (
      <div className="space-y-2 rounded-md border bg-muted/40 p-4 text-sm" aria-live="polite">
        <p className="font-medium">Check je inbox</p>
        <p className="text-muted-foreground">
          We hebben een login-link gestuurd naar{" "}
          <span className="font-medium text-foreground">{state.email}</span>. Klik de link om in te
          loggen. Hij werkt eenmalig en verloopt na een uur.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
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
        <Button type="submit" className="w-full" disabled={isPending || !form.formState.isValid}>
          {isPending ? "Versturen..." : "Stuur login-link"}
        </Button>
      </form>
    </Form>
  );
}
