import Blog from "@/components/Blog";
import type { Metadata } from "next";
import { createSEOMetadata } from "@/lib/seo";

export const metadata: Metadata = createSEOMetadata({
  title: "Blog",
  description: "Read practical tutorials, workflow tips, and product insights from the EaseMyTools team.",
  path: "/blog",
});

export default function Page() {
  return <Blog />;
}
