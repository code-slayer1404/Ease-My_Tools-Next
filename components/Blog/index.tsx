import Link from "next/link";
import styles from "./styles.module.css";
import { BLOG_AUTHOR, blogPosts } from "@/lib/blog";

const categories = [
  { name: "All", count: blogPosts.length },
  { name: "Productivity", count: blogPosts.filter((post) => post.category === "Productivity").length },
  { name: "Technology", count: blogPosts.filter((post) => post.category === "Technology").length },
  { name: "Security", count: blogPosts.filter((post) => post.category === "Security").length },
  { name: "Tutorials", count: blogPosts.filter((post) => post.category === "Tutorials").length },
];

const recentPosts = [...blogPosts]
  .sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime())
  .slice(0, 3);

const Blog = () => {
  return (
    <div className={styles["blog-page"]}>
      <div className={styles["blog-container"]}>
        <header className={styles["blog-header"]}>
          <h1>EaseMyTools Blog</h1>
          <p className={styles["blog-subtitle"]}>Tips, tutorials, and insights to help you get the most out of our tools</p>
          <p className={styles["author-meta"]}>By {BLOG_AUTHOR.name} · {BLOG_AUTHOR.role}</p>
        </header>

        <div className={styles["blog-layout"]}>
          <main className={styles["blog-content"]}>
            <section className={styles["featured-posts"]} aria-labelledby="featured-posts-heading">
              <h2 id="featured-posts-heading">Featured Posts</h2>
              <div className={styles["posts-grid"]}>
                {blogPosts.map((post) => (
                  <article key={post.id} className={`${styles["post-card"]} ${styles["featured"]}`}>
                    <div className={styles["post-image"]}>{post.imageEmoji}</div>
                    <div className={styles["post-content"]}>
                      <div className={styles["post-meta"]}>
                        <span className={styles["post-category"]}>{post.category}</span>
                        <time className={styles["post-date"]} dateTime={post.datePublished}>{post.datePublished}</time>
                        <span className={styles["post-read-time"]}>{post.readTime}</span>
                      </div>
                      <h3 className={styles["post-title"]}>{post.title}</h3>
                      <p className={styles["post-excerpt"]}>{post.excerpt}</p>
                      <Link href={`/blog/${post.slug}`} className={styles["read-more"]}>Read More →</Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </main>

          <aside className={styles["blog-sidebar"]}>
            <section className={styles["sidebar-section"]}>
              <h2>Categories</h2>
              <div className={styles["categories-list"]}>
                {categories.map((category) => (
                  <span key={category.name} className={styles["category-item"]}>
                    <span className={styles["category-name"]}>{category.name}</span>
                    <span className={styles["category-count"]}>({category.count})</span>
                  </span>
                ))}
              </div>
            </section>

            <section className={styles["sidebar-section"]}>
              <h2>Recent Posts</h2>
              <div className={styles["recent-posts"]}>
                {recentPosts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className={styles["recent-post"]}>
                    <h3>{post.title}</h3>
                    <div className={styles["post-meta"]}>
                      <time dateTime={post.datePublished}>{post.datePublished}</time>
                      <span>{post.readTime}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Blog;
