import styles from "./styles.module.css";

type ToolFaqProps = {
    tool: any;
};

export default function ToolFaq({
    tool,
}: ToolFaqProps) {
    const faqs = tool.seoContent?.faqs;

    if (
        !Array.isArray(faqs) ||
        !faqs.length
    ) {
        return null;
    }

    return (
        <section
            className={styles.toolFaq}
            aria-label="Frequently asked questions"
        >
            <div className={styles.faqContainer}>
                <div className={styles.faqHeader}>
                    <h2 className={styles.faqTitle}>
                        Frequently Asked Questions
                    </h2>

                    <p className={styles.faqSubtitle}>
                        Quick answers about this tool.
                    </p>
                </div>

                <div className={styles.faqGrid}>
                    {faqs.map((faq: any) => (
                        <article
                            key={faq.question}
                            className={styles.faqCard}
                        >
                            <h3 className={styles.question}>
                                {faq.question}
                            </h3>

                            <p className={styles.answer}>
                                {faq.answer}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}