"use client";


import { useTheme } from '../contexts/ThemeContext';
import '../styles/Business.css';

const Business = () => {
  const { theme } = useTheme();

  const features = [
    {
      icon: '⚡',
      title: "Team Collaboration",
      description: "Share tools and workflows across your entire team with centralized management."
    },
    {
      icon: '🔒',
      title: "Enhanced Security",
      description: "Enterprise-grade security with advanced access controls and audit logs."
    },
    {
      icon: '📊',
      title: "Usage Analytics",
      description: "Track tool usage and optimize your team\\'s workflow with detailed analytics."
    },
    {
      icon: '💬',
      title: "Priority Support",
      description: "Get dedicated support with guaranteed response times and personalized assistance."
    }
  ];

  const useCases = [
    {
      industry: "Marketing & Design",
      description: "Create stunning visuals, resize images for social media, and optimize graphics for campaigns.",
      tools: ['Remove Background', 'Image Resizer', 'Format Converter']
    },
    {
      industry: "Development",
      description: "Process data, convert formats, and generate code assets efficiently.",
      tools: ['JSON Formatter', 'CSV Converter', 'Code Generator']
    },
    {
      industry: "Education",
      description: "Create educational materials, convert documents, and process academic content.",
      tools: ['PDF Tools', 'Document Converter', 'Image Editor']
    }
  ];

  return (
    <div className={`business-page ${theme}`}>
      <div className="business-container">
        <header className="business-header">
          <div className="header-content">
            <h1>{"EaseMyTools for Business"}</h1>
            <p className="subtitle">
              {"Empower your team with enterprise-grade tools that boost productivity and streamline workflows."}
            </p>
            <div className="header-actions">
              <button className="primary-button">
                {"Start Free Trial"}
              </button>
              <button className="secondary-button">
                {"Contact Sales"}
              </button>
            </div>
          </div>
        </header>

        <section className="business-features">
          <h2>{"Why Businesses Choose EaseMyTools"}</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="use-cases">
          <h2>{"Trusted by Teams Across Industries"}</h2>
          <div className="use-cases-grid">
            {useCases.map((useCase, index) => (
              <div key={index} className="use-case-card">
                <h3>{useCase.industry}</h3>
                <p>{useCase.description}</p>
                <div className="tools-list">
                  {useCase.tools.map((tool, toolIndex) => (
                    <span key={toolIndex} className="tool-tag">{tool}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="business-pricing">
          <h2>{"Simple Team Pricing"}</h2>
          <div className="pricing-cards">
            <div className="pricing-card">
              <h3>{"Team"}</h3>
              <div className="price">$29<span>/month</span></div>
              <p>{"Perfect for small to medium teams"}</p>
              <ul>
                <li>Up to 10 team members</li>
                <li>All 50+ tools included</li>
                <li>Centralized billing</li>
                <li>Basic analytics</li>
                <li>Email support</li>
              </ul>
              <button className="pricing-button">
                {"Start Free Trial"}
              </button>
            </div>
            <div className="pricing-card highlighted">
              <div className="popular-badge">{"Most Popular"}</div>
              <h3>{"Business"}</h3>
              <div className="price">$99<span>/month</span></div>
              <p>{"For growing organizations"}</p>
              <ul>
                <li>Up to 50 team members</li>
                <li>All tools + advanced features</li>
                <li>Advanced analytics</li>
                <li>Custom workflows</li>
                <li>Priority support</li>
              </ul>
              <button className="pricing-button primary">
                {"Start Free Trial"}
              </button>
            </div>
            <div className="pricing-card">
              <h3>{"Enterprise"}</h3>
              <div className="price">{"Custom"}</div>
              <p>{"For large organizations"}</p>
              <ul>
                <li>Unlimited team members</li>
                <li>Custom tool development</li>
                <li>Dedicated infrastructure</li>
                <li>SLA guarantee</li>
                <li>24/7 dedicated support</li>
              </ul>
              <button className="pricing-button">
                {"Contact Sales"}
              </button>
            </div>
          </div>
        </section>

        <section className="business-cta">
          <div className="cta-content">
            <h2>{"Ready to Transform Your Team\\'s Workflow?"}</h2>
            <p>{"Join thousands of businesses that trust EaseMyTools for their daily operations."}</p>
            <div className="cta-buttons">
              <button className="cta-button primary">
                {"Start Free Trial"}
              </button>
              <button className="cta-button secondary">
                {"Schedule a Demo"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Business;