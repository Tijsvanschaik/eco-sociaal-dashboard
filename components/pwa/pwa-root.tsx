"use client";

import { SerwistProvider } from "@serwist/next/react";
import type { ReactNode } from "react";

import { SwUpdateToast } from "./sw-update-toast";

type PwaRootProps = {
  children: ReactNode;
};

export function PwaRoot({ children }: PwaRootProps) {
  return (
    <SerwistProvider swUrl="/sw.js" disable={process.env.NODE_ENV === "development"}>
      {children}
      <SwUpdateToast />
    </SerwistProvider>
  );
}
