import dynamic from "next/dynamic";
import type { Metadata } from "next";
import CategoryToolsPage from "@/components/CategoryToolsPage";
import { categoryTitles, getToolBySlug, toolsByCategory } from "@/data/toolsData";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (tool) {
    return {
      title: `EaseMyTools - ${tool.seo.title}`,
      description: tool.seo.description,
    };
  }

  // ✅ FIX: cast slug to valid keys
  if (slug && categoryTitles[slug as keyof typeof categoryTitles]) {
    return {
      title: `EaseMyTools - ${categoryTitles[slug as keyof typeof categoryTitles]}`,
      description: `Explore ${categoryTitles[slug as keyof typeof categoryTitles]} on EaseMyTools.`,
    };
  }

  return {};
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (tool) {
    const DynamicComponent = dynamic(tool.component);
    return <DynamicComponent />;
  }

  // ✅ FIX here as well for consistency
  if (slug && toolsByCategory[slug as keyof typeof toolsByCategory]) {
    return <CategoryToolsPage categoryId={slug} />;
  }

  return notFound();
}