"use client";

import { useEffect, useMemo, useState } from "react";

import {
  INSTALL_HINT_DISMISSED_KEY,
  INSTALL_HINT_VISIT_KEY,
  isAndroidChrome,
  isIosSafari,
  shouldShowInstallHint,
} from "@/lib/pwa/install-hint";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandaloneDisplayMode(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isMobileViewport(): boolean {
  return window.matchMedia("(max-width: 768px)").matches;
}

export function InstallHintBanner() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const platform = useMemo(() => {
    if (typeof navigator === "undefined") return "other" as const;
    if (isIosSafari(navigator.userAgent)) return "ios" as const;
    if (isAndroidChrome(navigator.userAgent)) return "android" as const;
    return "other" as const;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissed = window.localStorage.getItem(INSTALL_HINT_DISMISSED_KEY) === "1";
    const previousVisits = Number.parseInt(
      window.localStorage.getItem(INSTALL_HINT_VISIT_KEY) ?? "0",
      10,
    );
    const visitCount = Number.isFinite(previousVisits) ? previousVisits + 1 : 1;
    window.localStorage.setItem(INSTALL_HINT_VISIT_KEY, String(visitCount));

    const mayShow = shouldShowInstallHint({
      visitCount,
      dismissed,
      isStandalone: isStandaloneDisplayMode(),
      isMobile: isMobileViewport(),
    });

    setVisible(mayShow);
  }, []);

  useEffect(() => {
    if (!visible || platform !== "android") return;

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, [visible, platform]);

  const dismiss = () => {
    window.localStorage.setItem(INSTALL_HINT_DISMISSED_KEY, "1");
    setVisible(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  };

  if (!visible) return null;

  return (
    <section
      aria-label="App installeren"
      className="border-b border-primary/20 bg-primary-container/40 px-4 py-3 md:px-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Zet Eco-sociaal op je startscherm</p>
          {platform === "ios" ? (
            <p className="text-sm text-muted-foreground">
              Tik op <span className="font-medium text-foreground">Deel</span> en kies{" "}
              <span className="font-medium text-foreground">Zet op beginscherm</span>.
            </p>
          ) : platform === "android" ? (
            <p className="text-sm text-muted-foreground">
              Voeg de app toe voor snellere toegang bij het registreren van je impact.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Open het browsermenu en kies &quot;App installeren&quot; of &quot;Toevoegen aan
              startscherm&quot;.
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {platform === "android" && deferredPrompt ? (
            <button
              type="button"
              onClick={() => void install()}
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Installeren
            </button>
          ) : null}
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Niet nu
          </button>
        </div>
      </div>
    </section>
  );
}
