import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_AUTHOR, blogPosts, getBlogPostBySlug, getRelatedPosts } from "@/lib/blog";
import { createSEOMetadata, generateCanonicalUrl } from "@/lib/seo";
import styles from "./page.module.css";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return createSEOMetadata({
      title: "Blog Post Not Found",
      description: "The requested blog post could not be found.",
      path: "/blog",
      noIndex: true,
    });
  }

  return createSEOMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = getRelatedPosts(post.slug, post.category);
  const articleUrl = generateCanonicalUrl(`/blog/${post.slug}`);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    author: { "@type": "Person", name: BLOG_AUTHOR.name, url: BLOG_AUTHOR.profileUrl },
    publisher: { "@type": "Organization", name: "EaseMyTools", url: "https://easemytools.com" },
    mainEntityOfPage: articleUrl,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://easemytools.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://easemytools.com/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: articleUrl },
    ],
  };

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className={styles.container}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
          <Link href="/">Home</Link> / <Link href="/blog">Blog</Link> / <span>{post.title}</span>
        </nav>
        <article>
          <header className={styles.header}>
            <p className={styles.category}>{post.category}</p>
            <h1>{post.title}</h1>
            <p>{post.description}</p>
            <div className={styles.meta}><time dateTime={post.datePublished}>{post.datePublished}</time> · <span>{post.readTime}</span> · <span>By {BLOG_AUTHOR.name}</span></div>
          </header>

          <aside className={styles.toc} aria-label="Table of contents">
            <h2>Table of contents</h2>
            <ol>
              {post.content.map((section) => (
                <li key={section.heading}><a href={`#${section.heading.toLowerCase().replace(/\s+/g, "-")}`}>{section.heading}</a></li>
              ))}
            </ol>
          </aside>

          <section className={styles.content}>
            {post.content.map((section) => {
              const sectionId = section.heading.toLowerCase().replace(/\s+/g, "-");
              return (
                <section key={section.heading} id={sectionId}>
                  <h2>{section.heading}</h2>
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </section>
              );
            })}
          </section>

          <section className={styles.toolsSection}>
            <h2>Useful tools for this topic</h2>
            <ul>
              {post.toolLinks.map((tool) => (
                <li key={tool.href}><Link href={tool.href}>{tool.label}</Link></li>
              ))}
            </ul>
          </section>
        </article>

        {relatedPosts.length > 0 && (
          <section className={styles.related}>
            <h2>Related articles</h2>
            <div className={styles.relatedGrid}>
              {relatedPosts.map((relatedPost) => (
                <article key={relatedPost.slug} className={styles.relatedCard}>
                  <h3><Link href={`/blog/${relatedPost.slug}`}>{relatedPost.title}</Link></h3>
                  <p>{relatedPost.excerpt}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
