"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type SidebarLinkItem = {
  kind: "link";
  label: string;
  href: string;
  icon: string;
  /** Pathname prefix voor active-detectie; default is `href`. */
  matchPrefix?: string;
  /** Geen actieve styling (bv. Hulp-link naar dashboard naast hoofdnav Dashboard). */
  neverActive?: boolean;
  /** Externe links openen in nieuw tabblad. */
  external?: boolean;
};

export type SidebarFormItem = {
  kind: "form";
  label: string;
  action: string;
  icon: string;
};

export type SidebarItem = SidebarLinkItem | SidebarFormItem;

export type SidebarCta = {
  label: string;
  href: string;
  icon: string;
};

export type AppSidebarProps = {
  brand: ReactNode;
  mainItems: SidebarItem[];
  cta?: SidebarCta;
  footerItems: SidebarItem[];
  /** Compacte label voor de mobile topbar; bv. de org-naam. */
  mobileTitle?: string;
};

/**
 * App-navigatie voor authenticated (tenant- en platformbrede) schermen.
 * Desktop (md+): vaste sidebar links van 18rem breed.
 * Mobile: sticky topbar met hamburger die een slide-in drawer opent.
 */
export function AppSidebar({ brand, mainItems, cta, footerItems, mobileTitle }: AppSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      setIsOpen(false);
    }
  }, [pathname]);

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-surface-container-low px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Menu openen"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-card text-primary shadow-sm"
        >
          <Icon name="menu" />
        </button>
        <span className="text-sm font-bold tracking-tight text-primary">
          {mobileTitle ?? "Menu"}
        </span>
        <span className="h-10 w-10" aria-hidden />
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Menu sluiten"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col gap-8 overflow-y-auto rounded-r-[100px] bg-surface-container-low p-6 shadow-2xl">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Menu sluiten"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-card text-primary"
              >
                <Icon name="close" />
              </button>
            </div>
            <SidebarBody
              brand={brand}
              mainItems={mainItems}
              cta={cta}
              footerItems={footerItems}
              pathname={pathname}
              onNavigate={() => setIsOpen(false)}
            />
          </aside>
        </div>
      )}

      <nav
        aria-label="Hoofdnavigatie"
        className="fixed top-0 left-0 z-30 hidden h-dvh w-72 flex-col gap-8 overflow-y-auto rounded-r-[100px] bg-surface-container-low p-6 shadow-[20px_0_40px_rgba(54,50,45,0.04)] md:flex"
      >
        <SidebarBody
          brand={brand}
          mainItems={mainItems}
          cta={cta}
          footerItems={footerItems}
          pathname={pathname}
        />
      </nav>
    </>
  );
}

type SidebarBodyProps = {
  brand: ReactNode;
  mainItems: SidebarItem[];
  cta?: SidebarCta;
  footerItems: SidebarItem[];
  pathname: string;
  onNavigate?: () => void;
};

function SidebarBody({
  brand,
  mainItems,
  cta,
  footerItems,
  pathname,
  onNavigate,
}: SidebarBodyProps) {
  return (
    <>
      <div>{brand}</div>

      <div className="mt-4 flex-1 space-y-2">
        {mainItems.map((item) => (
          <SidebarItemRenderer
            key={itemKey(item)}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      {cta && (
        <div className="pt-2">
          <Button asChild variant="brand" className="h-auto w-full gap-2 px-6 py-3.5 text-base">
            <Link href={cta.href} onClick={onNavigate}>
              <Icon name={cta.icon} />
              <span>{cta.label}</span>
            </Link>
          </Button>
        </div>
      )}

      <div className="space-y-2 pt-2">
        {footerItems.map((item) => (
          <SidebarItemRenderer
            key={itemKey(item)}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </>
  );
}

function itemKey(item: SidebarItem) {
  return item.kind === "link" ? `link:${item.href}` : `form:${item.action}`;
}

function SidebarItemRenderer({
  item,
  pathname,
  onNavigate,
}: {
  item: SidebarItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  if (item.kind === "form") {
    return (
      <form action={item.action} method="post" className="block">
        <button
          type="submit"
          data-slot="sidebar-item"
          className="flex w-full items-center gap-4 rounded-full px-5 py-3.5 text-left text-muted-foreground transition-all duration-300 hover:translate-x-1 hover:bg-card/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Icon name={item.icon} />
          <span>{item.label}</span>
        </button>
      </form>
    );
  }

  const isActive = isItemActive(item, pathname);

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      data-slot="sidebar-item"
      data-active={isActive ? "true" : undefined}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-4 rounded-full px-5 py-3.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isActive
          ? "bg-card font-bold text-primary shadow-sm"
          : "text-muted-foreground hover:translate-x-1 hover:bg-card/60 hover:text-primary",
      )}
    >
      <Icon name={item.icon} filled={isActive} />
      <span>{item.label}</span>
    </Link>
  );
}

function isItemActive(item: SidebarLinkItem, pathname: string) {
  if (item.external || item.neverActive) return false;
  const prefix = item.matchPrefix ?? item.href;
  if (prefix === "/") return pathname === "/";
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
