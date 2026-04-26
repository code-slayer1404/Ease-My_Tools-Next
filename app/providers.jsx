"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import ScrollToTop from "@/components/ScrollToTop";

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <ScrollToTop />
      {children}
    </ThemeProvider>
  );
}
