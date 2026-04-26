"use client";


import { useTheme } from '../contexts/ThemeContext';
import '../styles/Press.css';

const Press = () => {
  const { theme } = useTheme();

  const pressReleases = [
    {
      id: 1,
      title: "EaseMyTools Launches Revolutionary AI-Powered Background Removal Tool",
      date: '2024-01-15',
      excerpt: "New feature allows users to remove image backgrounds with unprecedented accuracy and speed, completely free.",
      category: "Product Launch"
    },
    {
      id: 2,
      title: "EaseMyTools Reaches 1 Million Users Milestone",
      date: '2024-01-10',
      excerpt: "Platform celebrates rapid growth and user adoption across 150+ countries worldwide.",
      category: "Milestone"
    },
    {
      id: 3,
      title: "Company Secures $5M in Series A Funding",
      date: '2024-01-05',
      excerpt: "Funding round led by Tech Ventures to accelerate product development and global expansion.",
      category: "Funding"
    }
  ];

  const mediaCoverage = [
    {
      outlet: 'TechCrunch',
      logo: '📰',
      title: "EaseMyTools is Revolutionizing Online File Processing",
      date: '2024-01-12',
      link: '#'
    },
    {
      outlet: 'Product Hunt',
      logo: '🚀',
      title: "Product of the Day: EaseMyTools Suite",
      date: '2024-01-08',
      link: '#'
    },
    {
      outlet: 'The Verge',
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
    <div className={`press-page ${theme}`}>
      <div className="press-container">
        <header className="press-header">
          <h1>{"Press & Media"}</h1>
          <p className="press-subtitle">
            {"Latest news, media resources, and information for journalists"}
          </p>
        </header>

        <section className="press-contact">
          <div className="contact-card">
            <h2>{"Press Contact"}</h2>
            <p>{"For media inquiries, interview requests, or press information, please contact our communications team."}</p>
            <div className="contact-info">
              <div className="contact-item">
                <strong>{"Email:"}</strong>
                <a href="mailto:press@easemytools.com">press@easemytools.com</a>
              </div>
              <div className="contact-item">
                <strong>{"Phone:"}</strong>
                <a href="tel:+1-555-123-4567">+1 (555) 123-4567</a>
              </div>
            </div>
          </div>
        </section>

        <section className="press-releases">
          <h2>{"Press Releases"}</h2>
          <div className="releases-grid">
            {pressReleases.map((release) => (
              <article key={release.id} className="release-card">
                <div className="release-meta">
                  <span className="release-date">{release.date}</span>
                  <span className="release-category">{release.category}</span>
                </div>
                <h3 className="release-title">{release.title}</h3>
                <p className="release-excerpt">{release.excerpt}</p>
                <a href="#" className="read-more">
                  {"Read Full Release"} →
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="media-coverage">
          <h2>{"Media Coverage"}</h2>
          <div className="coverage-grid">
            {mediaCoverage.map((coverage, index) => (
              <article key={index} className="coverage-card">
                <div className="coverage-header">
                  <div className="outlet-logo">{coverage.logo}</div>
                  <div className="outlet-info">
                    <h3 className="outlet-name">{coverage.outlet}</h3>
                    <span className="coverage-date">{coverage.date}</span>
                  </div>
                </div>
                <h4 className="coverage-title">{coverage.title}</h4>
                <a href={coverage.link} className="read-article" target="_blank" rel="noopener noreferrer">
                  {"Read Article"} →
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="press-kit">
          <h2>{"Press Kit"}</h2>
          <p className="kit-description">
            {"Download official assets and resources for media use."}
          </p>
          <div className="kit-grid">
            {pressKit.map((item, index) => (
              <div key={index} className="kit-item">
                <div className="kit-info">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <span className="kit-format">{item.format}</span>
                </div>
                <a href="#" className="download-button">
                  {"Download"}
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="company-info">
          <h2>{"Company Information"}</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>{"About EaseMyTools"}</h3>
              <p>{"EaseMyTools is a comprehensive suite of free online tools that help users with file conversion, image editing, text processing, and data analysis. All processing happens locally in the browser, ensuring maximum privacy and security."}</p>
            </div>
            <div className="info-card">
              <h3>{"Key Facts"}</h3>
              <ul>
                <li>{"Founded: 2023"}</li>
                <li>{"Headquarters: San Francisco, CA"}</li>
                <li>{"Users: 1M+ worldwide"}</li>
                <li>{"Tools: 50+ and growing"}</li>
                <li>{"Team: 25+ employees"}</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Press;