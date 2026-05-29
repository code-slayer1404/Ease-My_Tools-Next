import Link from "next/link";
import styles from './styles.module.css';

type FeaturedTool = {
  icon: string;
  title: string;
  description: string;
  badge?: string;
  slug: string;
};

const FeaturedTools = () => {
  const featuredTools: FeaturedTool[] = [
    {
      icon: '🖼️',
      title: "Image Compressor",
      description: "Compress images to your exact target file size",
      badge: 'Popular',
      slug: 'image-compressor'
    },
    {
      icon: '📄',
      title: "Markdown Previewer",
      description: "Write and preview Markdown and HTML files in real-time",
      slug: 'markdown-previewer'
    },
    {
      icon: '🔍',
      title: "Text Diff Checker",
      description: "Compare two texts and highlight the differences instantly",
      slug: 'text-diff-checker'
    },
    {
      icon: '🔐',
      title: "Password Generator",
      description: "Create strong, secure passwords",
      badge: 'New',
      slug: 'password-generator'
    }
  ];

  return (
    <section className={styles["featured-tools"]}>
      <div className={`container`}>
        <h2>{"Most Popular Tools"}</h2>
        <p className={styles["section-subtitle"]}>
          {"Try our most loved tools trusted by thousands"}
        </p>
        <div className={styles["tools-grid"]}>
          {featuredTools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className={styles["tool-card"]}
            >
              {tool.badge && <span className={styles["tool-badge"]}>{tool.badge}</span>}
              <div className={styles["tool-icon"]}>{tool.icon}</div>
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
              <span className={styles["tool-btn"]}>
                {"Use Tool →"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTools;
