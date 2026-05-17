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
      title: "Remove Background",
      description: "AI-powered background removal in seconds",
      badge: 'Popular',
      slug: 'remove-background'
    },
    {
      icon: '📄',
      title: "PDF Converter",
      description: "Convert PDFs to various formats",
      slug: 'file-converter'
    },
    {
      icon: '🎨',
      title: "Image Resizer",
      description: "Resize images without quality loss",
      slug: 'image-resizer'
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
