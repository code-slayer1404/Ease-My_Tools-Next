import type { ComponentType } from "react";
import type { Metadata } from "next";
import { createSEOMetadata } from "@/lib/seo";
import { createBreadcrumbSchema, createFAQSchema, createWebApplicationSchema } from "@/lib/schema";
import dynamic from "next/dynamic";
import CategoryToolsPage from "@/components/CategoryToolsPage";
import { categoryTitles, getToolBySlug, toolsByCategory } from "@/data/toolsData";
import { notFound } from "next/navigation";
import ToolSeoContent from "@/components/ToolSeoContent";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;   // ✅ must await
  const tool = getToolBySlug(slug);

  if (tool) {
    const metadata = createSEOMetadata({
      title: tool.seo.title,
      description: tool.seo.description,
      path: `/tools/${slug}`,
    });
    return {
      ...metadata,
      keywords: tool.seo.keywords,
    };
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
    const breadcrumbSchema = createBreadcrumbSchema([
      { name: "Home", item: "https://easemytools.com" },
      { name: "Tools", item: "https://easemytools.com/tools" },
      { name: tool.name, item: `https://easemytools.com/tools/${slug}` },
    ]);
    const faqSchema = tool.seoContent?.faqs ? createFAQSchema(tool.seoContent.faqs) : null;

    return (<>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /> : null}
      {tool.seoContent ? <ToolSeoContent seoContent={tool.seoContent} mode="introOnly" /> : null}
      <DynamicComponent />
      {tool.seoContent ? (
        <section aria-label={`${tool.name} details`}>
          <ToolSeoContent seoContent={tool.seoContent} mode="detailsOnly" />
        </section>
      ) : null}
    </>);
  }

  if (slug && toolsByCategory[slug]) {
    return <CategoryToolsPage categoryId={slug} />;
  }

  return notFound();
}
