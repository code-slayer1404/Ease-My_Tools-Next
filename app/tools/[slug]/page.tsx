import type { ComponentType } from "react";
import type { Metadata } from "next";
import { createSEOMetadata } from "@/lib/seo";
import { createWebApplicationSchema } from "@/lib/schema";
import dynamic from "next/dynamic";
import CategoryToolsPage from "@/components/CategoryToolsPage";
import { categoryTitles, getToolBySlug, toolsByCategory } from "@/data/toolsData";
import { notFound } from "next/navigation";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;   // ✅ must await
  const tool = getToolBySlug(slug);

  if (tool) {
    return createSEOMetadata({
      title: tool.seo.title,
      description: tool.seo.description,
      path: `/tools/${slug}`,
    });
  }

  if (slug && categoryTitles[slug]) {
    return createSEOMetadata({
      title: categoryTitles[slug],
      description: `Explore ${categoryTitles[slug]} tools on EaseMyTools.`,
      path: `/tools/${slug}`,
    });
  }

  return {};
}

export default async function Page(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;   // ✅ must await
  const tool = getToolBySlug(slug);

  if (tool) {
    const DynamicComponent = dynamic(() => tool.component() as Promise<{ default: ComponentType }>);
    const toolSchema = createWebApplicationSchema(tool.name, `https://easemytools.com/tools/${slug}`, tool.seo.description);

    return (<>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} />
      <DynamicComponent />
    </>);
  }

  if (slug && toolsByCategory[slug]) {
    return <CategoryToolsPage categoryId={slug} />;
  }

  return notFound();
}
