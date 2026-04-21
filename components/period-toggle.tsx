"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { DashboardPeriod } from "@/lib/timeseries";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{ label: string; value: DashboardPeriod }> = [
  { label: "30 dagen", value: "30d" },
  { label: "90 dagen", value: "90d" },
  { label: "Alles", value: "all" },
];

export function PeriodToggle({ current }: { current: DashboardPeriod }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSelect(nextPeriod: DashboardPeriod) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", nextPeriod);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={current === option.value ? "default" : "outline"}
          className={cn("min-h-11", current === option.value && "shadow-sm")}
          onClick={() => handleSelect(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
