import ToolsPage from "@/components/ToolsPage";
import HomePage from "@/components/HomePage";
import type { Metadata } from "next";
import { createSEOMetadata } from "@/lib/seo";

export const metadata: Metadata = createSEOMetadata({
  title: "Home",
  description:
    "Discover free browser-based tools for file conversion, image editing, text formatting, and daily productivity workflows.",
  path: "/",
});

export default function Page() {
  return (
    <>
      <ToolsPage />
      <HomePage />
    </>
  );
}
