import MobileApp from "@/components/MobileApp";
import type { Metadata } from "next";
import { createSEOMetadata } from "@/lib/seo";

export const metadata: Metadata = createSEOMetadata({
  title: "Mobile App",
  description: "Review mobile app capabilities and platform availability information for EaseMyTools.",
  path: "/mobile",
  noIndex: true,
});

export default function Page() {
  return <MobileApp />;
}
