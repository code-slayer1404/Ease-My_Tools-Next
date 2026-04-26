"use client";

import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/Documentation.css';

const Documentation = () => {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    {
      id: 'getting-started',
      title: "Getting Started",
      content: "Learn how to quickly start using EaseMyTools in your projects.",
      subsections: [
        {
          title: "Quick Start",
          content: `# ${"Quick Start"}

${"Start using EaseMyTools in just a few minutes:"}

1. **${"Choose Your Tool"}** - Browse our collection of 50+ tools
2. **${"Upload Your File"}** - Drag and drop or click to upload
3. **${"Process"}** - Let our tools work their magic
4. **${"Download"}** - Get your processed file instantly

${"All processing happens locally in your browser for maximum privacy and speed."}`
        },
        {
          title: "Creating an Account",
          content: `# ${"Creating an Account"}

${"While not required, creating an account unlocks additional features:"}

- **${"Save Preferences"}** - Remember your favorite settings
- **${"Usage History"}** - Track your past conversions
- **${"Advanced Features"}** - Access premium tools

${"Sign up for free at"} [${"https://easemytools.com/signup"}](https://easemytools.com/signup)`
        }
      ]
    },
    {
      id: 'api-integration',
      title: "API Integration",
      content: "Learn how to integrate our tools into your applications.",
      subsections: [
        {
          title: "Authentication",
          content: `# ${"Authentication"}

${"All API requests require authentication using your API key:"}

\`\`\`javascript
const headers = {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json'
};
\`\`\`

${"Get your API key from the"} [${"API Dashboard"}](https://easemytools.com/api)`
        },
        {
          title: "Rate Limiting",
          content: `# ${"Rate Limiting"}

${"We implement rate limiting to ensure fair usage:"}

- **${"Free Tier"}**: 1,000 requests/month
- **${"Startup Tier"}**: 50,000 requests/month
- **${"Enterprise Tier"}**: 500,000 requests/month

${"Rate limits reset at the beginning of each calendar month."}`
        }
      ]
    },
    {
      id: 'tutorials',
      title: "Tutorials",
      content: "Step-by-step guides for common use cases.",
      subsections: [
        {
          title: "Bulk File Processing",
          content: `# ${"Bulk File Processing"}

${"Learn how to process multiple files efficiently:"}

1. **${"Prepare Your Files"}** - Organize files in a single folder
2. **${"Use Batch Tools"}** - Select tools that support batch processing
3. **${"Monitor Progress"}** - Track processing in real-time
4. **${"Download Results"}** - Get all processed files at once

${"Pro Tip: Use our desktop app for faster bulk processing."}`
        },
        {
          title: "Automating Workflows",
          content: `# ${"Automating Workflows"}

${"Create automated workflows using our API:"}

\`\`\`python
import requests
import os

def process_images(folder_path):
    for filename in os.listdir(folder_path):
        if filename.endswith(('.png', '.jpg', '.jpeg')):
            # Process each image through our API
            response = process_image(os.path.join(folder_path, filename))
            save_result(response)
\`\`\`

${"This example shows how to automate image processing for a folder of images."}`
        }
      ]
    }
  ];

  return (
    <div className={`documentation-page ${theme}`}>
      <div className="docs-container">
        <header className="docs-header">
          <h1>{"Documentation"}</h1>
          <p className="docs-subtitle">
            {"Comprehensive guides and tutorials for EaseMyTools"}
          </p>
        </header>

        <div className="docs-layout">
          <nav className="docs-sidebar">
            <div className="sidebar-content">
              <h3>{"Contents"}</h3>
              <ul className="sidebar-nav">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                      onClick={() => setActiveSection(section.id)}
                    >
                      {section.title}
                    </button>
                    {activeSection === section.id && (
                      <ul className="subsections">
                        {section.subsections.map((subsection, index) => (
                          <li key={index}>
                            <a href={`#${subsection.title.toLowerCase().replace(/\s+/g, '-')}`}>
                              {subsection.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <main className="docs-content">
            {sections
              .filter(section => section.id === activeSection)
              .map(section => (
                <div key={section.id} className="section-content">
                  <h2>{section.title}</h2>
                  <p className="section-description">{section.content}</p>
                  
                  {section.subsections.map((subsection, index) => (
                    <article key={index} className="subsection" id={subsection.title.toLowerCase().replace(/\s+/g, '-')}>
                      <div className="subsection-content">
                        <div 
                          className="markdown-content"
                          dangerouslySetInnerHTML={{ 
                            __html: subsection.content.replace(/\n/g, '<br/>').replace(/# (.*?)\n/g, '<h3>$1</h3>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code>$1</code>').replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
                          }}
                        />
                      </div>
                    </article>
                  ))}
                </div>
              ))}
          </main>
        </div>

        <div className="docs-support">
          <h2>{"Need Help?"}</h2>
          <p>{"Can't find what you're looking for? Our support team is here to help."}</p>
          <div className="support-links">
            <a href="/contact" className="support-link">
              {"Contact Support"}
            </a>
            <a href="/api" className="support-link">
              {"API Reference"}
            </a>
            <a href="/faq" className="support-link">
              {"View FAQ"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;