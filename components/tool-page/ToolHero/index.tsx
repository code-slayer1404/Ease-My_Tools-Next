import styles from "./styles.module.css";

type ToolHeroProps = {
    tool: any;
};

export default function ToolHero({
    tool,
}: ToolHeroProps) {
    if (!tool) {
        return null;
    }
    return (
        <section className={styles.toolHero}>
                <div className={styles.heroCard}>
                    <span className={styles.categoryBadge}>
                        Tool
                    </span>

                    <h1 className={styles.heroTitle}>
                        {tool.seoContent?.h1 || tool.name}
                    </h1>

                    <p className={styles.heroDescription}>
                        {tool.seoContent?.intro ||
                            tool.seo?.description}
                    </p>
            </div>
        </section>
    );
}