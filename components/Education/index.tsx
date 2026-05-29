"use client";

import styles from "./styles.module.css";

const Education = () => {
  const features = [
    {
      icon: "📚",
      title: "Learning Made Easy",
      description:
        "Useful tools that help students and educators complete everyday tasks faster."
    },
    {
      icon: "⚡",
      title: "Quick & Simple",
      description:
        "Easy-to-use tools with a clean interface and no complicated setup."
    },
    {
      icon: "💻",
      title: "Works Everywhere",
      description:
        "Access tools from desktop, tablet, or mobile using any modern browser."
    },
    {
      icon: "🔒",
      title: "Privacy Focused",
      description:
        "Files are processed securely with user privacy in mind."
    },
    {
      icon: "🛠️",
      title: "Multiple Tool Categories",
      description:
        "Image, PDF, text, converter, calculator, and utility tools in one place."
    },
    {
      icon: "🚀",
      title: "Free to Use",
      description:
        "Most tools are available instantly without registration."
    }
  ];

  const useCases = [
    {
      role: "Students",
      description:
        "Resize images, convert files, edit PDFs, and complete assignments more efficiently."
    },
    {
      role: "Teachers",
      description:
        "Prepare classroom materials, manage documents, and create learning resources."
    },
    {
      role: "Researchers",
      description:
        "Convert files, organize documents, and simplify digital workflows."
    }
  ];

  return (
    <div className={styles["education-page"]}>
      <div className={styles["education-container"]}>
        <header className={styles["education-header"]}>
          <div className={styles["header-content"]}>
            <h1>Education Tools</h1>

            <p className={styles["subtitle"]}>
              Free online tools designed to help students, teachers,
              researchers, and lifelong learners work more efficiently.
            </p>
          </div>
        </header>

        <section className={styles["education-features"]}>
          <h2>Why Students & Educators Choose EaseMyTools</h2>

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

        <section className={styles["education-use-cases"]}>
          <h2>Built for Every Learner</h2>

          <div className={styles["use-cases-grid"]}>
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className={styles["use-case-card"]}
              >
                <h3>{useCase.role}</h3>

                <p>{useCase.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles["education-resources"]}>
          <h2>Popular Educational Uses</h2>

          <div className={styles["resources-grid"]}>
            <div className={styles["resource-card"]}>
              <div className={styles["resource-icon"]}>📄</div>

              <h3>PDF Management</h3>

              <p>
                Merge, split, compress, and convert educational
                documents quickly and easily.
              </p>
            </div>

            <div className={styles["resource-card"]}>
              <div className={styles["resource-icon"]}>🖼️</div>

              <h3>Image Tools</h3>

              <p>
                Resize, compress, and optimize images for
                assignments, projects, and presentations.
              </p>
            </div>

            <div className={styles["resource-card"]}>
              <div className={styles["resource-icon"]}>🧮</div>

              <h3>Utility Tools</h3>

              <p>
                Access calculators, converters, and productivity
                tools for everyday educational tasks.
              </p>
            </div>
          </div>
        </section>

        <section className={styles["education-cta"]}>
          <div className={styles["cta-content"]}>
            <h2>Explore Educational Tools</h2>

            <p>
              Discover useful tools that help students, teachers,
              and learners save time and work more efficiently.
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

export default Education;