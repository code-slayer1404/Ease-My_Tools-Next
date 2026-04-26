"use client";


import { useTheme } from '../contexts/ThemeContext';
import '../styles/Security.css';

const Security = () => {
  const { theme } = useTheme();

  const securityFeatures = [
    {
      icon: '🔒',
      title: "Local Processing",
      description: "All file processing happens locally in your browser. Your files never leave your device."
    },
    {
      icon: '🚫',
      title: "No Data Storage",
      description: "We do not store, upload, or permanently save any files you process through our tools."
    },
    {
      icon: '🔐',
      title: "End-to-End Encryption",
      description: "All data transmissions are encrypted using industry-standard TLS 1.3 protocols."
    },
    {
      icon: '📜',
      title: "Compliance Certified",
      description: "We comply with GDPR, CCPA, and other major privacy regulations."
    }
  ];

  const compliance = [
    {
      standard: 'GDPR',
      description: "General Data Protection Regulation compliance for EU users",
      status: "Compliant"
    },
    {
      standard: 'CCPA',
      description: "California Consumer Privacy Act compliance",
      status: "Compliant"
    },
    {
      standard: 'COPPA',
      description: "Children\\'s Online Privacy Protection Act",
      status: "Compliant"
    },
    {
      standard: 'FERPA',
      description: "Family Educational Rights and Privacy Act for education",
      status: "Compliant"
    }
  ];

  const securityPractices = [
    {
      area: "Data Processing",
      practices: [
        "All processing occurs client-side in the browser",
        "No file uploads to external servers",
        "Automatic cleanup of temporary files"
      ]
    },
    {
      area: "Infrastructure",
      practices: [
        "Regular security audits and penetration testing",
        "DDoS protection and rate limiting",
        "99.9% uptime SLA"
      ]
    },
    {
      area: "Privacy",
      practices: [
        "No tracking or analytics on tool usage",
        "Minimal data collection for essential services",
        "Clear data retention policies"
      ]
    }
  ];

  return (
    <div className={`security-page ${theme}`}>
      <div className="security-container">
        <header className="security-header">
          <div className="header-content">
            <h1>{"Security & Privacy"}</h1>
            <p className="subtitle">
              {"Your privacy and data security are our top priorities. Learn how we protect your information."}
            </p>
          </div>
        </header>

        <section className="security-features">
          <h2>{"Our Security Promise"}</h2>
          <div className="features-grid">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="compliance-section">
          <h2>{"Compliance & Certifications"}</h2>
          <div className="compliance-grid">
            {compliance.map((item, index) => (
              <div key={index} className="compliance-card">
                <div className="compliance-header">
                  <h3>{item.standard}</h3>
                  <span className="compliance-status">{item.status}</span>
                </div>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="security-practices">
          <h2>{"Security Practices"}</h2>
          <div className="practices-grid">
            {securityPractices.map((practice, index) => (
              <div key={index} className="practice-card">
                <h3>{practice.area}</h3>
                <ul>
                  {practice.practices.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="security-faq">
          <h2>{"Security FAQs"}</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>{"Where are my files processed?"}</h3>
              <p>{"All file processing happens locally in your web browser. Your files never leave your device and are never transmitted to our servers."}</p>
            </div>
            <div className="faq-item">
              <h3>{"Do you store any of my data?"}</h3>
              <p>{"No. We do not store, upload, or permanently save any files you process. Temporary data is automatically cleared when you close your browser."}</p>
            </div>
            <div className="faq-item">
              <h3>{"What information do you collect?"}</h3>
              <p>{"We only collect essential information for service operation, such as anonymous usage statistics and error reports. No personal file data is collected."}</p>
            </div>
            <div className="faq-item">
              <h3>{"How do you ensure compliance?"}</h3>
              <p>{"We undergo regular third-party security audits and maintain comprehensive documentation of our security practices and compliance measures."}</p>
            </div>
          </div>
        </section>

        <section className="security-contact">
          <div className="contact-content">
            <h2>{"Have Security Questions?"}</h2>
            <p>{"Our security team is available to answer any questions about our practices and compliance."}</p>
            <div className="contact-actions">
              <a href="mailto:security@easemytools.com" className="contact-button">
                {"Contact Security Team"}
              </a>
              <a href="/privacy-policy" className="contact-button secondary">
                {"View Privacy Policy"}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Security;