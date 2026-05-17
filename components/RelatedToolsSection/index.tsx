import Link from "next/link";
import styles from "./styles.module.css";

type RelatedTool = {
  slug: string;
  name: string;
};

type Props = {
  currentToolName: string;
  categoryTitle: string | null;
  relatedTools: RelatedTool[];
};

export default function RelatedToolsSection({ currentToolName, categoryTitle, relatedTools }: Props) {
  if (relatedTools.length === 0) {
    return null;
  }

  return (
    <section className={styles.relatedSection} aria-label={`Related tools for ${currentToolName}`}>
      <div className={styles.card}>
        <h2 className={styles.title}>Related tools</h2>
        <p className={styles.subtitle}>
          Explore similar utilities{categoryTitle ? ` in ${categoryTitle}` : ""}.
        </p>
        <ul className={styles.list}>
          {relatedTools.map((tool) => (
            <li key={tool.slug} className={styles.item}>
              <Link href={`/tools/${tool.slug}`} title={`Open ${tool.name} tool`}>
                {tool.name} tool
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
