import Press from "@/components/Press";
import type { Metadata } from "next";
import { createSEOMetadata } from "@/lib/seo";

export const metadata: Metadata = createSEOMetadata({
  title: "Press & Media",
  description: "Find official media resources, announcements, and contact details for EaseMyTools.",
  path: "/press",
});

export default function Page() {
  return <Press />;
}
