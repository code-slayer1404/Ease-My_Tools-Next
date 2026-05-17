import styles from "./page.module.css";

export default function VerifyEmailLoading() {
    return (
        <main className={styles.container}>
            <section className={styles.card}>
                <div className={`${styles.icon} ${styles.info}`} aria-hidden="true">
                    …
                </div>
                <h1 className={styles.title}>Verifying your email…</h1>
                <p className={styles.description}>
                    Please wait while we securely confirm your verification link.
                </p>
            </section>
        </main>
    );
}
