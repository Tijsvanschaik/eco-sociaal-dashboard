"use client";

import { useCallback, useEffect, useState } from "react";

export function SwUpdateToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "development" || !("serviceWorker" in navigator)) {
      return;
    }

    let cancelled = false;

    const watchRegistration = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        setVisible(true);
      }

      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;

        installing.addEventListener("statechange", () => {
          if (
            !cancelled &&
            installing.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setVisible(true);
          }
        });
      });
    };

    navigator.serviceWorker.ready.then(watchRegistration).catch(() => {
      // Service worker unavailable — ignore in UI.
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const reload = useCallback(() => {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.waiting?.postMessage({ type: "SKIP_WAITING" });
      })
      .finally(() => {
        window.location.reload();
      });
  }, []);

  if (!visible) return null;

  return (
    <output className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-lg items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg sm:inset-x-auto sm:right-4">
      <p className="text-sm text-foreground">Nieuwe versie beschikbaar</p>
      <button
        type="button"
        onClick={reload}
        className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
      >
        Ververs
      </button>
    </output>
  );
}
