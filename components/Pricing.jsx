"use client";


import { useTheme } from '../contexts/ThemeContext';
import '../styles/Pricing.css';

const Pricing = () => {
  const { theme } = useTheme();

  const plans = [
    {
      name: "Free Forever",
      price: "$0",
      description: "Perfect for individuals and casual users",
      features: [
        "Access to all 50+ tools",
        "No file size limits",
        "Local browser processing",
        "No watermarks",
        "Basic support"
      ],
      highlighted: false,
      cta: "Get Started Free"
    },
    {
      name: "Pro Plan",
      price: "$9",
      period: "/month",
      description: "For professionals and power users",
      features: [
        "Everything in Free, plus:",
        "Priority processing",
        "Batch operations",
        "Advanced tool options",
        "Priority email support",
        "Early access to new tools"
      ],
      highlighted: true,
      cta: "Start Pro Trial"
    },
    {
      name: "Team Plan",
      price: "$29",
      period: "/month",
      description: "For teams and businesses",
      features: [
        "Everything in Pro, plus:",
        "Up to 10 team members",
        "Centralized billing",
        "Usage analytics",
        "Dedicated support",
        "Custom tool requests"
      ],
      highlighted: false,
      cta: "Contact Sales"
    }
  ];

  return (
    <div className={`pricing-page ${theme}`}>
      <div className="pricing-container">
        <header className="pricing-header">
          <h1>{"Simple, Transparent Pricing"}</h1>
          <p className="pricing-subtitle">
            {"Choose the plan that works best for you. All plans include access to all tools."}
          </p>
        </header>

        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`pricing-card ${plan.highlighted ? 'highlighted' : ''}`}
            >
              {plan.highlighted && (
                <div className="popular-badge">
                  {"Most Popular"}
                </div>
              )}
              
              <div className="plan-header">
                <h3>{plan.name}</h3>
                <div className="plan-price">
                  <span className="price">{plan.price}</span>
                  {plan.period && <span className="period">{plan.period}</span>}
                </div>
                <p className="plan-description">{plan.description}</p>
              </div>

              <ul className="plan-features">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex}>
                    <span className="check-icon">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                className={`plan-button ${plan.highlighted ? 'primary' : 'secondary'}`}
                onClick={() => window.location.href = plan.highlighted ? '/signup' : '/tools'}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="pricing-faq">
          <h2>{"Frequently Asked Questions"}</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>{"Can I change plans later?"}</h3>
              <p>{"Yes, you can upgrade, downgrade, or cancel your plan at any time."}</p>
            </div>
            <div className="faq-item">
              <h3>{"Is there a free trial?"}</h3>
              <p>{"All paid plans include a 14-day free trial. No credit card required."}</p>
            </div>
            <div className="faq-item">
              <h3>{"What payment methods do you accept?"}</h3>
              <p>{"We accept all major credit cards, PayPal, and bank transfers for annual plans."}</p>
            </div>
            <div className="faq-item">
              <h3>{"Do you offer discounts?"}</h3>
              <p>{"Yes, we offer educational and nonprofit discounts. Contact us for more information."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;