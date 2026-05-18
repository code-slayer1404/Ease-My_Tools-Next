import Link from "next/link";

import { getToolBySlug } from "@/data/toolsData";

import styles from "./styles.module.css";

type RelatedToolsProps = {
    tool: any;
};

export default function RelatedTools({
    tool,
}: RelatedToolsProps) {
    const relatedSlugs =
        tool.seoContent?.relatedTools;

    if (
        !Array.isArray(relatedSlugs) ||
        !relatedSlugs.length
    ) {
        return null;
    }

    const relatedTools = relatedSlugs
        .map((related: any) =>
            getToolBySlug(related.slug)
        )
        .filter(Boolean);

    if (!relatedTools.length) {
        return null;
    }

    return (
        <section
            className={styles.relatedTools}
            aria-label="Related tools"
        >
            <div className={styles.relatedContainer}>
                <div className={styles.relatedHeader}>
                    <h2 className={styles.relatedTitle}>
                        Related Tools
                    </h2>

                    <p className={styles.relatedSubtitle}>
                        Explore more tools you may find useful.
                    </p>
                </div>

                <div className={styles.toolsGrid}>
                    {relatedTools.map((relatedTool: any) => (
                        <Link
                            key={relatedTool.slug}
                            href={`/tools/${relatedTool.slug}`}
                            className={styles.toolCard}
                        >
                            <h3 className={styles.toolName}>
                                {relatedTool.name}
                            </h3>

                            <p className={styles.toolDescription}>
                                {relatedTool.seo?.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}