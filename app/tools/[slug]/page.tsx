import type { ComponentType } from "react";
import type { Metadata } from "next";
import { createSEOMetadata } from "@/lib/seo";
import { createBreadcrumbSchema, createFAQSchema, createWebApplicationSchema } from "@/lib/schema";
import dynamic from "next/dynamic";
import CategoryToolsPage from "@/components/CategoryToolsPage";
import { categoryTitles, getRelatedTools, getToolBySlug, getToolCategoryBySlug, toolsByCategory } from "@/data/toolsData";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";
import type { ToolSeoSectionData } from "@/components/ToolSeoContent";
import RelatedToolsSection from "@/components/RelatedToolsSection";

type Crumb = { name: string; href?: string };

function BreadcrumbNav({ items }: { items: Crumb[] }) {
  return (
    <nav className={styles.breadcrumbNav} aria-label="Breadcrumb">
      <ol className={styles.breadcrumbList}>
        {items.map((item) => (
          <li key={item.name} className={styles.breadcrumbItem}>
            {item.href ? (
              <Link href={item.href} className={styles.breadcrumbLink}>
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className={styles.breadcrumbCurrent}>
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function ToolSeoIntro({ seoContent }: { seoContent: ToolSeoSectionData }) {
  return (
    <section className={styles.toolSection} aria-label="Tool overview">
      <div className={styles.sectionCard}>
        <h1 className={styles.sectionTitle}>{seoContent.h1}</h1>
        <p className={styles.sectionDescription}>{seoContent.intro}</p>
      </div>
    </section>
  );
}

function ToolSeoDetails({ seoContent, toolName }: { seoContent: ToolSeoSectionData; toolName: string }) {
  return (
    <section className={styles.toolSection} aria-label={`${toolName} details`}>
      <div className={styles.detailsGrid}>
        <section className={styles.sectionCard}>
          <h2 className={styles.cardHeading}>How to use</h2>
          <ol className={styles.listText}>{seoContent.howToUse.map((item) => <li key={item}>{item}</li>)}</ol>
        </section>
        <section className={styles.sectionCard}>
          <h2 className={styles.cardHeading}>Features</h2>
          <ul className={styles.listText}>{seoContent.features.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <section className={styles.sectionCard}>
          <h2 className={styles.cardHeading}>Benefits</h2>
          <ul className={styles.listText}>{seoContent.benefits.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <section className={styles.sectionCard}>
          <h2 className={styles.cardHeading}>Use cases</h2>
          <ul className={styles.listText}>{seoContent.useCases.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <section className={styles.sectionCard}>
          <h2 className={styles.cardHeading}>Frequently asked questions</h2>
          <div className={styles.faqList}>
            {seoContent.faqs.map((faq) => (
              <article key={faq.question} className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>{faq.question}</h3>
                <p className={styles.listText}>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
        <section className={styles.sectionCard}>
          <h2 className={styles.cardHeading}>Related tools</h2>
          <ul className={styles.relatedList}>
            {seoContent.relatedTools.map((relatedTool) => (
              <li key={relatedTool.slug}>
                <Link href={`/tools/${relatedTool.slug}`}>{relatedTool.name} tool</Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
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

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (tool) {
    const DynamicComponent = dynamic(() => tool.component() as Promise<{ default: ComponentType }>);
    const toolCategoryId = getToolCategoryBySlug(slug);
    const categoryTitle = toolCategoryId ? categoryTitles[toolCategoryId] : null;
    const categoryPath = toolCategoryId ? `/tools/${toolCategoryId}` : null;
    const relatedTools = getRelatedTools(slug, 6);
    const toolSchema = createWebApplicationSchema(tool.name, `https://easemytools.com/tools/${slug}`, tool.seo.description);
    const breadcrumbItems = [
      { name: "Home", item: "https://easemytools.com" },
      { name: "Tools", item: "https://easemytools.com/tools" },
      ...(toolCategoryId ? [{ name: categoryTitles[toolCategoryId], item: `https://easemytools.com/tools/${toolCategoryId}` }] : []),
      { name: tool.name, item: `https://easemytools.com/tools/${slug}` },
    ];
    const breadcrumbSchema = createBreadcrumbSchema(breadcrumbItems);
    const faqSchema = tool.seoContent?.faqs ? createFAQSchema(tool.seoContent.faqs) : null;

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        {faqSchema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /> : null}
        <BreadcrumbNav items={[{ name: "Home", href: "/" }, { name: "Tools", href: "/tools" }, ...(categoryTitle && categoryPath ? [{ name: categoryTitle, href: categoryPath }] : []), { name: tool.name }]} />
        {tool.seoContent ? <ToolSeoIntro seoContent={tool.seoContent} /> : null}
        <DynamicComponent />
        {tool.seoContent ? <ToolSeoDetails seoContent={tool.seoContent} toolName={tool.name} /> : null}
        <RelatedToolsSection currentToolName={tool.name} categoryTitle={categoryTitle ?? null} relatedTools={relatedTools} />
      </>
    );
  }

  if (slug && toolsByCategory[slug]) {
    return <CategoryToolsPage categoryId={slug} />;
  }

  return notFound();
}
