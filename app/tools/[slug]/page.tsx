import type { ComponentType } from "react";
import type { Metadata } from "next";
import { createSEOMetadata } from "@/lib/seo";
import { createBreadcrumbSchema, createFAQSchema, createWebApplicationSchema } from "@/lib/schema";
import dynamic from "next/dynamic";
import CategoryToolsPage from "@/components/CategoryToolsPage";
import { categoryTitles, getToolBySlug, toolsByCategory } from "@/data/toolsData";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";
import type { ToolSeoSectionData } from "@/components/ToolSeoContent";


function ToolSeoIntro({ seoContent }: { seoContent: ToolSeoSectionData }) {
  return (
    <section className={styles.seoIntro} aria-label="Tool overview">
      <h1 className={styles.seoTitle}>{seoContent.h1}</h1>
      <p className={styles.seoDescription}>{seoContent.intro}</p>
    </section>
  );
}

function ToolSeoDetails(
  { seoContent, toolName }: { seoContent: ToolSeoSectionData; toolName: string }
) {
  return (
    <section className={styles.seoDetails} aria-label={`${toolName} details`}>
      <section className={styles.seoCard}>
        <h2>How to use</h2>
        <ol className={styles.seoText}>{seoContent.howToUse.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>
      <section className={styles.seoCard}>
        <h2>Features</h2>
        <ul className={styles.seoText}>{seoContent.features.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <section className={styles.seoCard}>
        <h2>Benefits</h2>
        <ul className={styles.seoText}>{seoContent.benefits.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <section className={styles.seoCard}>
        <h2>Use cases</h2>
        <ul className={styles.seoText}>{seoContent.useCases.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <section className={styles.seoCard}>
        <h2>Frequently asked questions</h2>
        <div className={styles.faqList}>
          {seoContent.faqs.map((faq) => (
            <article key={faq.question} className={styles.faqItem}>
              <h3>{faq.question}</h3>
              <p className={styles.seoText}>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.seoCard}>
        <h2>Related tools</h2>
        <ul className={styles.relatedList}>
          {seoContent.relatedTools.map((relatedTool) => (
            <li key={relatedTool.slug}>
              <Link href={`/tools/${relatedTool.slug}`}>{relatedTool.name}</Link>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
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
      {tool.seoContent ? <ToolSeoIntro seoContent={tool.seoContent} /> : null}
      <DynamicComponent />
      {tool.seoContent ? <ToolSeoDetails seoContent={tool.seoContent} toolName={tool.name} /> : null}
    </>);
  }

  if (slug && toolsByCategory[slug]) {
    return <CategoryToolsPage categoryId={slug} />;
  }

  return notFound();
}
