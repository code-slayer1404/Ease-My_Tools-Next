import dynamic from "next/dynamic";
import type { Metadata } from "next";
import CategoryToolsPage from "@/components/CategoryToolsPage";
import { categoryTitles, getToolBySlug, toolsByCategory } from "@/data/toolsData";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = params.slug;
  const tool = getToolBySlug(slug);

  if (tool) {
    return {
      title: `EaseMyTools - ${tool.seo.title}`,
      description: tool.seo.description,
    };
  }

  if (slug && categoryTitles[slug]) {
    return {
      title: `EaseMyTools - ${categoryTitles[slug]}`,
      description: `Explore ${categoryTitles[slug]} on EaseMyTools.`,
    };
  }

  return {};
}

export default async function Page({ params }: PageProps) {
  const slug = params.slug;
  const tool = getToolBySlug(slug);

  if (tool) {
    const DynamicComponent = dynamic(tool.component);
    return <DynamicComponent />;
  }

  if (slug && toolsByCategory[slug]) {
    return <CategoryToolsPage categoryId={slug} />;
  }

  return notFound();
}