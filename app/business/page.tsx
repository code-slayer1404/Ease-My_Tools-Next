import Business from "@/components/Business";
import type { Metadata } from "next";
import { createSEOMetadata } from "@/lib/seo";

export const metadata: Metadata = createSEOMetadata({
  title: "Business",
  description: "Learn how teams can use EaseMyTools to standardize repeatable workflows across departments.",
  path: "/business",
});

export default function Page() {
  return <Business />;
}
