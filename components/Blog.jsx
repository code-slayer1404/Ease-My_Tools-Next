"use client";


import { useTheme } from '../contexts/ThemeContext';
import '../styles/Blog.css';

const Blog = () => {
  const { theme } = useTheme();

  const featuredPosts = [
    {
      id: 1,
      title: "10 Ways to Boost Your Productivity with Online Tools",
      excerpt: "Discover how to streamline your workflow and save time with these essential productivity tips and tools.",
      category: "Productivity",
      date: '2024-01-15',
      readTime: '5 min read',
      image: '📊'
    },
    {
      id: 2,
      title: "The Future of Browser-Based Image Processing",
      excerpt: "Explore how modern web technologies are revolutionizing image editing and processing directly in your browser.",
      category: "Technology",
      date: '2024-01-10',
      readTime: '7 min read',
      image: '🖼️'
    },
    {
      id: 3,
      title: "Privacy-First: Why Local Processing Matters",
      excerpt: "Learn why processing files locally in your browser is crucial for data privacy and security in the digital age.",
      category: "Security",
      date: '2024-01-05',
      readTime: '4 min read',
      image: '🔒'
    }
  ];

  const categories = [
    { name: "All", count: 12 },
    { name: "Productivity", count: 4 },
    { name: "Technology", count: 3 },
    { name: "Tutorials", count: 3 },
    { name: "Security", count: 2 }
  ];

  const recentPosts = [
    {
      id: 4,
      title: "How to Convert PDFs Without Losing Formatting",
      date: '2024-01-03',
      readTime: '3 min read'
    },
    {
      id: 5,
      title: "Batch Processing: Save Time with Multiple Files",
      date: '2024-01-01',
      readTime: '6 min read'
    },
    {
      id: 6,
      title: "New Tool Release: Advanced Image Resizer",
      date: '2023-12-28',
      readTime: '2 min read'
    }
  ];

  return (
    <div className={`blog-page ${theme}`}>
      <div className="blog-container">
        <header className="blog-header">
          <h1>{"EaseMyTools Blog"}</h1>
          <p className="blog-subtitle">
            {"Tips, tutorials, and insights to help you get the most out of our tools"}
          </p>
        </header>

        <div className="blog-layout">
          <main className="blog-content">
            <section className="featured-posts">
              <h2>{"Featured Posts"}</h2>
              <div className="posts-grid">
                {featuredPosts.map((post) => (
                  <article key={post.id} className="post-card featured">
                    <div className="post-image">
                      {post.image}
                    </div>
                    <div className="post-content">
                      <div className="post-meta">
                        <span className="post-category">{post.category}</span>
                        <span className="post-date">{post.date}</span>
                        <span className="post-read-time">{post.readTime}</span>
                      </div>
                      <h3 className="post-title">{post.title}</h3>
                      <p className="post-excerpt">{post.excerpt}</p>
                      <a href="#" className="read-more">
                        {"Read More"} →
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="all-posts">
              <h2>{"All Posts"}</h2>
              <div className="posts-list">
                {[...featuredPosts, ...recentPosts].map((post) => (
                  <article key={post.id} className="post-item">
                    <div className="post-info">
                      <div className="post-meta">
                        <span className="post-date">{post.date}</span>
                        <span className="post-read-time">{post.readTime}</span>
                      </div>
                      <h3 className="post-title">{post.title}</h3>
                      {post.excerpt && (
                        <p className="post-excerpt">{post.excerpt}</p>
                      )}
                    </div>
                    <a href="#" className="read-more">
                      {"Read More"} →
                    </a>
                  </article>
                ))}
              </div>
            </section>
          </main>

          <aside className="blog-sidebar">
            <div className="sidebar-section">
              <h3>{"Categories"}</h3>
              <div className="categories-list">
                {categories.map((category, index) => (
                  <a key={index} href="#" className="category-item">
                    <span className="category-name">{category.name}</span>
                    <span className="category-count">({category.count})</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <h3>{"Newsletter"}</h3>
              <div className="newsletter-box">
                <p>{"Get the latest updates and tips delivered to your inbox."}</p>
                <form className="newsletter-form">
                  <input
                    type="email"
                    placeholder={"Enter your email"}
                    className="newsletter-input"
                  />
                  <button type="submit" className="newsletter-button">
                    {"Subscribe"}
                  </button>
                </form>
              </div>
            </div>

            <div className="sidebar-section">
              <h3>{"Recent Posts"}</h3>
              <div className="recent-posts">
                {recentPosts.map((post) => (
                  <a key={post.id} href="#" className="recent-post">
                    <h4>{post.title}</h4>
                    <div className="post-meta">
                      <span>{post.date}</span>
                      <span>{post.readTime}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Blog;