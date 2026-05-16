"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";

import ScrollToTop from "@/components/ScrollToTop";

export default function Providers({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <ScrollToTop />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}