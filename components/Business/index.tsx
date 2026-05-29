"use client";

import styles from "./styles.module.css";

const Business = () => {
  const features = [
    {
      icon: "⚡",
      title: "Lightning Fast",
      description:
        "Get results in seconds with optimized tools designed for speed and efficiency."
    },
    {
      icon: "🛠️",
      title: "50+ Useful Tools",
      description:
        "Image, PDF, text, converter, calculator, and productivity tools in one place."
    },
    {
      icon: "🔒",
      title: "Privacy Focused",
      description:
        "Files are processed securely with user privacy and data protection in mind."
    },
    {
      icon: "🌍",
      title: "Works Everywhere",
      description:
        "Use EaseMyTools seamlessly on desktop, tablet, and mobile devices."
    },
    {
      icon: "🎯",
      title: "Simple Interface",
      description:
        "Clean and beginner-friendly design with no unnecessary complexity."
    },
    {
      icon: "🚀",
      title: "Always Improving",
      description:
        "New tools and enhancements are added regularly to improve your workflow."
    }
  ];

  const categories = [
    {
      icon: "🖼️",
      title: "Image Tools",
      description:
        "Compress, resize, crop, convert, enhance, and optimize images online."
    },
    {
      icon: "📄",
      title: "PDF Tools",
      description:
        "Merge, split, compress, convert, protect, and organize PDF documents."
    },
    {
      icon: "✍️",
      title: "Text Tools",
      description:
        "Format, clean, generate, and transform text for everyday tasks."
    },
    {
      icon: "💻",
      title: "Developer Tools",
      description:
        "JSON formatter, encoders, decoders, converters, and coding utilities."
    },
    {
      icon: "🧮",
      title: "Calculator Tools",
      description:
        "Financial, percentage, age, EMI, and many other useful calculators."
    },
    {
      icon: "🔄",
      title: "File Converters",
      description:
        "Convert files between multiple formats quickly and accurately."
    }
  ];

  return (
    <div className={styles["business-page"]}>
      <div className={styles["business-container"]}>
        <header className={styles["business-header"]}>
          <div className={styles["header-content"]}>
            <h1>EaseMyTools</h1>

            <p className={styles["subtitle"]}>
              Free online tools to simplify everyday digital tasks.
              No registration required — just choose a tool and get
              started instantly.
            </p>
          </div>
        </header>

        <section className={styles["business-features"]}>
          <h2>Why Choose EaseMyTools?</h2>

          <div className={styles["features-grid"]}>
            {features.map((feature, index) => (
              <div
                key={index}
                className={styles["feature-card"]}
              >
                <div className={styles["feature-icon"]}>
                  {feature.icon}
                </div>

                <h3>{feature.title}</h3>

                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles["use-cases"]}>
          <h2>Popular Tool Categories</h2>

          <div className={styles["use-cases-grid"]}>
            {categories.map((category, index) => (
              <div
                key={index}
                className={styles["use-case-card"]}
              >
                <div className={styles["feature-icon"]}>
                  {category.icon}
                </div>

                <h3>{category.title}</h3>

                <p>{category.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles["business-cta"]}>
          <div className={styles["cta-content"]}>
            <h2>Explore Free Online Tools</h2>

            <p>
              Discover a growing collection of tools designed
              to save time, boost productivity, and make your
              work easier.
            </p>

            <div className={styles["cta-buttons"]}>
              <a
                href="/tools"
                className={`${styles["cta-button"]} ${styles["primary"]}`}
              >
                Browse Tools
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Business;