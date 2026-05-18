import styles from "./styles.module.css";

type ToolContentProps = {
    tool: any;
};

export default function ToolContent({
    tool,
}: ToolContentProps) {
    const seoContent = tool.seoContent;

    if (!seoContent) {
        return null;
    }

    const sections = [
        {
            title: "How to Use",
            items: seoContent.howToUse,
        },

        {
            title: "Features",
            items: seoContent.features,
        },

        {
            title: "Benefits",
            items: seoContent.benefits,
        },

        {
            title: "Use Cases",
            items: seoContent.useCases,
        },
    ].filter(
        (section) =>
            Array.isArray(section.items) &&
            section.items.length > 0
    );

    if (!sections.length) {
        return null;
    }

    return (
        <section className={styles.toolContent}>
            <div className={styles.contentContainer}>
                <div className={styles.contentGrid}>
                    {sections.map((section) => (
                        <article
                            key={section.title}
                            className={styles.contentCard}
                        >
                            <h2 className={styles.sectionTitle}>
                                {section.title}
                            </h2>

                            <ul className={styles.sectionList}>
                                {section.items.map(
                                    (item: string) => (
                                        <li
                                            key={item}
                                            className={styles.sectionItem}
                                        >
                                            {item}
                                        </li>
                                    )
                                )}
                            </ul>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}