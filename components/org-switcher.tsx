"use client";

import { useRouter } from "next/navigation";

type Org = { id: string; name: string; slug: string };

// Renders a native <select> for organization switching. Keeps the bundle
// tiny for Fase 1; a fancier combobox can replace this when we grow past a
// handful of orgs.
export function OrgSwitcher({ current, orgs }: { current: Org; orgs: Org[] }) {
  const router = useRouter();

  if (orgs.length <= 1) {
    return <span className="text-sm font-medium">{current.name}</span>;
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">Kies organisatie</span>
      <select
        className="rounded-md border bg-background px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        value={current.slug}
        onChange={(event) => {
          const nextSlug = event.currentTarget.value;
          if (nextSlug !== current.slug) {
            router.push(`/${nextSlug}/dashboard`);
          }
        }}
      >
        {orgs.map((org) => (
          <option key={org.id} value={org.slug}>
            {org.name}
          </option>
        ))}
      </select>
    </label>
  );
}
