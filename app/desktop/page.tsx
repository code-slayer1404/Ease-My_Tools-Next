import DesktopApp from "@/components/DesktopApp";
import type { Metadata } from "next";
import { createSEOMetadata } from "@/lib/seo";

export const metadata: Metadata = createSEOMetadata({
  title: "Desktop App",
  description: "Review desktop app capabilities, platform support details, and setup guidance for EaseMyTools.",
  path: "/desktop",
  noIndex: true,
});

export default function Page() {
  return <DesktopApp />;
}
