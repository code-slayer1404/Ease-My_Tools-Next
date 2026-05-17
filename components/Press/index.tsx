"use client";
import styles from './styles.module.css';

const Press = () => {

  const pressReleases = [
    {
      id: 1,
      title: "EaseMyTools Announces New Background Editing Improvements",
      date: '2024-01-15',
      excerpt: "New feature allows users to remove image backgrounds with unprecedented accuracy and speed, completely free.",
      category: "Product Launch"
    },
    {
      id: 2,
      title: "EaseMyTools Publishes Product Update and Roadmap",
      date: '2024-01-10',
      excerpt: "Platform celebrates rapid growth and user adoption across 150+ countries worldwide.",
      category: "Milestone"
    },
    {
      id: 3,
      title: "EaseMyTools Shares Platform Reliability Update",
      date: '2024-01-05',
      excerpt: "Funding round led by Tech Ventures to accelerate product development and global expansion.",
      category: "Funding"
    }
  ];

  const mediaCoverage = [
    {
      outlet: 'Industry Newsletter',
      logo: '📰',
      title: "EaseMyTools is Revolutionizing Online File Processing",
      date: '2024-01-12',
      link: '#'
    },
    {
      outlet: 'Developer Community Blog',
      logo: '🚀',
      title: "Product of the Day: EaseMyTools Suite",
      date: '2024-01-08',
      link: '#'
    },
    {
      outlet: 'Digital Workflow Journal',
      logo: '🔊',
      title: "How Local Processing is Changing Online Tools",
      date: '2024-01-03',
      link: '#'
    }
  ];

  const pressKit = [
    {
      name: "Company Logo Pack",
      description: "High-resolution logos in multiple formats",
      format: 'ZIP, 15MB'
    },
    {
      name: "Brand Guidelines",
      description: "Complete brand usage and style guide",
      format: 'PDF, 8MB'
    },
    {
      name: "Product Screenshots",
      description: "High-quality product screenshots",
      format: 'ZIP, 25MB'
    },
    {
      name: "Executive Headshots",
      description: "Photos of leadership team",
      format: 'ZIP, 12MB'
    }
  ];

  return (
    <div className={styles["press-page"]}>
      <div className={styles["press-container"]}>
        <header className={styles["press-header"]}>
          <h1>{"Press & Media"}</h1>
          <p className={styles["press-subtitle"]}>
            {"Latest news, media resources, and information for journalists"}
          </p>
        </header>

        <section className={styles["press-contact"]}>
          <div className={styles["contact-card"]}>
            <h2>{"Press Contact"}</h2>
            <p>{"For media inquiries, interview requests, or press information, please contact our communications team."}</p>
            <div className={styles["contact-info"]}>
              <div className={styles["contact-item"]}>
                <strong>{"Email:"}</strong>
                <a href="mailto:press@easemytools.com">press@easemytools.com</a>
              </div>
              <div className={styles["contact-item"]}>
                <strong>{"Phone:"}</strong>
                <a href="tel:+1-555-123-4567">+1 (555) 123-4567</a>
              </div>
            </div>
          </div>
        </section>

        <section className={styles["press-releases"]}>
          <h2>{"Press Releases"}</h2>
          <div className={styles["releases-grid"]}>
            {pressReleases.map((release) => (
              <article key={release.id} className={styles["release-card"]}>
                <div className={styles["release-meta"]}>
                  <span className={styles["release-date"]}>{release.date}</span>
                  <span className={styles["release-category"]}>{release.category}</span>
                </div>
                <h3 className={styles["release-title"]}>{release.title}</h3>
                <p className={styles["release-excerpt"]}>{release.excerpt}</p>
                <a href="#" className={styles["read-more"]} aria-label={`Read full release: ${release.title}`}>
                  {"Read Full Release"} →
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className={styles["media-coverage"]}>
          <h2>{"Media Coverage"}</h2>
          <div className={styles["coverage-grid"]}>
            {mediaCoverage.map((coverage, index) => (
              <article key={index} className={styles["coverage-card"]}>
                <div className={styles["coverage-header"]}>
                  <div className={styles["outlet-logo"]}>{coverage.logo}</div>
                  <div className={styles["outlet-info"]}>
                    <h3 className={styles["outlet-name"]}>{coverage.outlet}</h3>
                    <span className={styles["coverage-date"]}>{coverage.date}</span>
                  </div>
                </div>
                <h4 className={styles["coverage-title"]}>{coverage.title}</h4>
                <a href={coverage.link} className={styles["read-article"]} aria-label={`Read article from ${coverage.outlet}: ${coverage.title}`} target="_blank" rel="noopener noreferrer">
                  {"Read Article"} →
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className={styles["press-kit"]}>
          <h2>{"Press Kit"}</h2>
          <p className={styles["kit-description"]}>
            {"Download official assets and resources for media use."}
          </p>
          <div className={styles["kit-grid"]}>
            {pressKit.map((item, index) => (
              <div key={index} className={styles["kit-item"]}>
                <div className={styles["kit-info"]}>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <span className={styles["kit-format"]}>{item.format}</span>
                </div>
                <a href="#" className={styles["download-button"]} aria-label={`Download ${item.name}`}>
                  {"Download"}
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className={styles["company-info"]}>
          <h2>{"Company Information"}</h2>
          <div className={styles["info-grid"]}>
            <div className={styles["info-card"]}>
              <h3>{"About EaseMyTools"}</h3>
              <p>{"EaseMyTools is a comprehensive suite of free online tools that help users with file conversion, image editing, text processing, and data analysis. All processing happens locally in the browser, ensuring maximum privacy and security."}</p>
            </div>
            <div className={styles["info-card"]}>
              <h3>{"Key Facts"}</h3>
              <ul>
                <li>{"Founded: 2023"}</li>
                <li>{"Headquarters: San Francisco, CA"}</li>
                <li>{"Users: Usage metrics are not publicly disclosed"}</li>
                <li>{"Tools: 50+ and growing"}</li>
                <li>{"Team: Team details available on request"}</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Press;