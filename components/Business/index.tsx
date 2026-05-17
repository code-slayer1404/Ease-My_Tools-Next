"use client";
import styles from './styles.module.css';

const Business = () => {

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
    <div className={styles["business-page"]}>
      <div className={styles["business-container"]}>
        <header className={styles["business-header"]}>
          <div className={styles["header-content"]}>
            <h1>{"EaseMyTools for Business"}</h1>
            <p className={styles["subtitle"]}>
              {"Empower your team with enterprise-grade tools that boost productivity and streamline workflows."}
            </p>
            <div className={styles["header-actions"]}>
              <button className={styles["primary-button"]}>
                {"Start Free Trial"}
              </button>
              <button className={styles["secondary-button"]}>
                {"Contact Sales"}
              </button>
            </div>
          </div>
        </header>

        <section className={styles["business-features"]}>
          <h2>{"Why Businesses Choose EaseMyTools"}</h2>
          <div className={styles["features-grid"]}>
            {features.map((feature, index) => (
              <div key={index} className={styles["feature-card"]}>
                <div className={styles["feature-icon"]}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles["use-cases"]}>
          <h2>{"Trusted by Teams Across Industries"}</h2>
          <div className={styles["use-cases-grid"]}>
            {useCases.map((useCase, index) => (
              <div key={index} className={styles["use-case-card"]}>
                <h3>{useCase.industry}</h3>
                <p>{useCase.description}</p>
                <div className={styles["tools-list"]}>
                  {useCase.tools.map((tool, toolIndex) => (
                    <span key={toolIndex} className={styles["tool-tag"]}>{tool}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles["business-pricing"]}>
          <h2>{"Simple Team Pricing"}</h2>
          <div className={styles["pricing-cards"]}>
            <div className={styles["pricing-card"]}>
              <h3>{"Team"}</h3>
              <div className={styles["price"]}>$29<span>/month</span></div>
              <p>{"Perfect for small to medium teams"}</p>
              <ul>
                <li>Up to 10 team members</li>
                <li>All 50+ tools included</li>
                <li>Centralized billing</li>
                <li>Basic analytics</li>
                <li>Email support</li>
              </ul>
              <button className={styles["pricing-button"]}>
                {"Start Free Trial"}
              </button>
            </div>
            <div className={`${styles["pricing-card"]} ${styles["highlighted"]}`}>
              <div className={styles["popular-badge"]}>{"Most Popular"}</div>
              <h3>{"Business"}</h3>
              <div className={styles["price"]}>$99<span>/month</span></div>
              <p>{"For growing organizations"}</p>
              <ul>
                <li>Up to 50 team members</li>
                <li>All tools + advanced features</li>
                <li>Advanced analytics</li>
                <li>Custom workflows</li>
                <li>Priority support</li>
              </ul>
              <button className={`${styles["pricing-button"]} ${styles["primary"]}`}>
                {"Start Free Trial"}
              </button>
            </div>
            <div className={styles["pricing-card"]}>
              <h3>{"Enterprise"}</h3>
              <div className={styles["price"]}>{"Custom"}</div>
              <p>{"For large organizations"}</p>
              <ul>
                <li>Unlimited team members</li>
                <li>Custom tool development</li>
                <li>Dedicated infrastructure</li>
                <li>SLA guarantee</li>
                <li>24/7 dedicated support</li>
              </ul>
              <button className={styles["pricing-button"]}>
                {"Contact Sales"}
              </button>
            </div>
          </div>
        </section>

        <section className={styles["business-cta"]}>
          <div className={styles["cta-content"]}>
            <h2>{"Ready to Transform Your Team\\'s Workflow?"}</h2>
            <p>{"Teams of different sizes use EaseMyTools to streamline recurring digital tasks."}</p>
            <div className={styles["cta-buttons"]}>
              <button className={`${styles["cta-button"]} ${styles["primary"]}`}>
                {"Start Free Trial"}
              </button>
              <button className={`${styles["cta-button"]} ${styles["secondary"]}`}>
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