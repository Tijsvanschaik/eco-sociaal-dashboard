"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { createOrganizationAndInviteAdmin } from "@/app/superadmin/orgs/new/actions";
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
import { createOrgSchema } from "@/lib/admin-schema";

type FormValues = z.infer<typeof createOrgSchema>;
type UiState =
  | { status: "idle" }
  | { message: string; status: "error" }
  | { message: string; status: "success" };

export function SuperadminOrgForm() {
  const router = useRouter();
  const [state, setState] = useState<UiState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      adminEmail: "",
      orgName: "",
      orgSlug: "",
    },
    mode: "onTouched",
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("orgName", values.orgName);
      formData.set("orgSlug", values.orgSlug);
      formData.set("adminEmail", values.adminEmail);

      const result = await createOrganizationAndInviteAdmin(formData);
      if (result.status === "error") {
        setState({ status: "error", message: result.message });
        return;
      }

      setState({ status: "success", message: result.message });
      form.reset();
      router.push(`/superadmin/orgs/${result.orgId}`);
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form className="space-y-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="orgName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organisatienaam</FormLabel>
              <FormControl>
                <Input placeholder="Bijv. Welzijn Eindhoven" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="orgSlug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="welzijn-eindhoven" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="adminEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mailadres eerste admin</FormLabel>
              <FormControl>
                <Input placeholder="beheer@organisatie.nl" type="email" {...field} />
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
        {state.status === "success" && (
          <p aria-live="polite" className="text-sm text-primary">
            {state.message}
          </p>
        )}

        <Button
          className="min-h-11 w-full rounded-full sm:w-auto"
          disabled={isPending || !form.formState.isValid}
          variant="brand"
        >
          {isPending ? "Aanmaken..." : "Organisatie aanmaken"}
        </Button>
      </form>
    </Form>
  );
}
