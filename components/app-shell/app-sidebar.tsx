"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

import { SidebarLayout, SidebarProvider, useSidebar } from "./sidebar-context";

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

export type AppSidebarLayoutProps = AppSidebarProps & {
  children: ReactNode;
};

/**
 * Shell-wrapper: sidebar + content-offset. Gebruik dit in tenant- en platform-shells.
 */
export function AppSidebarLayout({ children, ...sidebarProps }: AppSidebarLayoutProps) {
  return (
    <SidebarProvider>
      <SidebarLayout>
        <AppSidebar {...sidebarProps} />
        {children}
      </SidebarLayout>
    </SidebarProvider>
  );
}

/**
 * App-navigatie voor authenticated (tenant- en platformbrede) schermen.
 * Desktop (md+): vaste sidebar links; inklapbaar naar een smalle icon-rail.
 * Mobile: sticky topbar met hamburger die een slide-in drawer opent.
 */
export function AppSidebar({ brand, mainItems, cta, footerItems, mobileTitle }: AppSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const sidebar = useSidebar();
  const isCollapsed = sidebar?.isCollapsed ?? false;

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
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col gap-8 overflow-y-auto rounded-r-2xl bg-surface-container-low p-6 shadow-2xl">
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
        aria-expanded={!isCollapsed}
        className={cn(
          "fixed top-0 left-0 z-30 hidden h-dvh flex-col rounded-r-2xl bg-surface-container-low shadow-[20px_0_40px_rgba(54,50,45,0.04)] transition-all duration-300 ease-in-out md:flex",
          isCollapsed ? "w-[4.5rem]" : "w-72",
        )}
      >
        {sidebar && (
          <button
            type="button"
            onClick={sidebar.toggle}
            aria-label={isCollapsed ? "Sidebar uitklappen" : "Sidebar inklappen"}
            className="absolute top-1/2 right-0 z-40 inline-flex h-9 w-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-border/60 bg-card text-primary shadow-md transition hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Icon name={isCollapsed ? "chevron_right" : "chevron_left"} />
          </button>
        )}
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-y-auto",
            isCollapsed ? "gap-4 p-3" : "gap-8 p-6",
          )}
        >
          <SidebarBody
            brand={brand}
            isCollapsed={isCollapsed}
            mainItems={mainItems}
            cta={cta}
            footerItems={footerItems}
            pathname={pathname}
          />
        </div>
      </nav>

      {isCollapsed && cta && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 hidden justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:flex">
          <Button
            asChild
            variant="brand"
            className="pointer-events-auto h-auto gap-2 px-6 py-3.5 text-base shadow-lg"
          >
            <Link href={cta.href}>
              <Icon name={cta.icon} />
              <span>{cta.label}</span>
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}

type SidebarBodyProps = {
  brand: ReactNode;
  isCollapsed?: boolean;
  mainItems: SidebarItem[];
  cta?: SidebarCta;
  footerItems: SidebarItem[];
  pathname: string;
  onNavigate?: () => void;
};

function SidebarBody({
  brand,
  isCollapsed = false,
  mainItems,
  cta,
  footerItems,
  pathname,
  onNavigate,
}: SidebarBodyProps) {
  return (
    <>
      <div className={cn(isCollapsed && "flex justify-center")}>{brand}</div>

      <div className={cn("flex-1 space-y-2", isCollapsed ? "mt-2" : "mt-4")}>
        {mainItems.map((item) => (
          <SidebarItemRenderer
            key={itemKey(item)}
            isCollapsed={isCollapsed}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      {cta && (
        <div className={cn("pt-2", isCollapsed && "flex justify-center")}>
          {isCollapsed ? (
            <Button asChild variant="brand" className="h-11 w-11 shrink-0 p-0">
              <Link href={cta.href} title={cta.label} aria-label={cta.label} onClick={onNavigate}>
                <Icon name={cta.icon} />
              </Link>
            </Button>
          ) : (
            <Button asChild variant="brand" className="h-auto w-full gap-2 px-6 py-3.5 text-base">
              <Link href={cta.href} onClick={onNavigate}>
                <Icon name={cta.icon} />
                <span>{cta.label}</span>
              </Link>
            </Button>
          )}
        </div>
      )}

      <div className="space-y-2 pt-2">
        {footerItems.map((item) => (
          <SidebarItemRenderer
            key={itemKey(item)}
            isCollapsed={isCollapsed}
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
  isCollapsed,
  item,
  pathname,
  onNavigate,
}: {
  isCollapsed: boolean;
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
          title={isCollapsed ? item.label : undefined}
          aria-label={isCollapsed ? item.label : undefined}
          className={cn(
            "flex w-full items-center rounded-full text-left text-muted-foreground transition-all duration-300 hover:bg-card/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            isCollapsed
              ? "justify-center px-0 py-3 hover:translate-x-0"
              : "gap-4 px-5 py-3.5 hover:translate-x-1",
          )}
        >
          <Icon name={item.icon} />
          <span className={cn(isCollapsed && "sr-only")}>{item.label}</span>
        </button>
      </form>
    );
  }

  const isActive = isItemActive(item, pathname);

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      aria-label={isCollapsed ? item.label : undefined}
      title={isCollapsed ? item.label : undefined}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      data-slot="sidebar-item"
      data-active={isActive ? "true" : undefined}
      onClick={onNavigate}
      className={cn(
        "flex items-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isCollapsed
          ? "justify-center px-0 py-3 hover:translate-x-0"
          : "gap-4 px-5 py-3.5 hover:translate-x-1",
        isActive
          ? "bg-card font-bold text-primary shadow-sm"
          : "text-muted-foreground hover:bg-card/60 hover:text-primary",
      )}
    >
      <Icon name={item.icon} filled={isActive} />
      <span className={cn(isCollapsed && "sr-only")}>{item.label}</span>
    </Link>
  );
}

function isItemActive(item: SidebarLinkItem, pathname: string) {
  if (item.external || item.neverActive) return false;
  const prefix = item.matchPrefix ?? item.href;
  if (prefix === "/") return pathname === "/";
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
