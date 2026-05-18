import Link from "next/link";
import styles from "./styles.module.css";

export interface ToolSeoFAQ {
  question: string;
  answer: string;
}

export interface ToolSeoSectionData {
  h1: string;
  intro: string;
  howToUse: string[];
  features: string[];
  benefits: string[];
  useCases: string[];
  faqs: ToolSeoFAQ[];
  relatedTools: Array<{ slug: string; name: string }>;
}

interface ToolSeoContentProps {
  seoContent: ToolSeoSectionData;
  mode?: "full" | "introOnly" | "detailsOnly";
}

const ToolSeoContent = ({ seoContent, mode = "full" }: ToolSeoContentProps) => {
  const showHeader = mode !== "detailsOnly";
  const showDetails = mode !== "introOnly";
  return (
    <section className={styles.container} aria-label="Tool information">
      {showHeader ? (
        <header className={styles.header}>
          <h1 className={styles.h1}>{seoContent.h1}</h1>
          <p className={styles.intro}>{seoContent.intro}</p>
        </header>
      ) : null}

      {showDetails ? <div className={styles.sections}>
        <section className={styles.section}>
          <h2>How to use</h2>
          <ol>{seoContent.howToUse.map((item) => <li key={item}>{item}</li>)}</ol>
        </section>
        <section className={styles.section}>
          <h2>Features</h2>
          <ul>{seoContent.features.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <section className={styles.section}>
          <h2>Benefits</h2>
          <ul>{seoContent.benefits.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <section className={styles.section}>
          <h2>Use cases</h2>
          <ul>{seoContent.useCases.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <section className={styles.section}>
          <h2>Frequently asked questions</h2>
          <div className={styles.faqList}>
            {seoContent.faqs.map((faq) => (
              <article key={faq.question} className={styles.faqItem}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
        <section className={styles.section}>
          <h2>Related tools</h2>
          <ul className={styles.relatedTools}>
            {seoContent.relatedTools.map((relatedTool) => (
              <li key={relatedTool.slug}>
                <Link href={`/tools/${relatedTool.slug}`}>{relatedTool.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      </div> : null}
    </section>
  );
};

export default ToolSeoContent;
