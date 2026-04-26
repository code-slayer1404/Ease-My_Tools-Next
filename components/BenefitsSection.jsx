"use client";


import '../styles/BenefitsSection.css';

const BenefitsSection = () => {

  const benefits = [
    {
      icon: '🔒',
      title: "100% Secure",
      description: "Files processed locally, never stored on servers"
    },
    {
      icon: '⚡',
      title: "Lightning Fast",
      description: "Process files in seconds with our optimized tools"
    },
    {
      icon: '🎯',
      title: "No Watermarks",
      description: "Get clean results without any branding"
    },
    {
      icon: '💯',
      title: "Completely Free",
      description: "No hidden costs or subscription fees"
    }
  ];

  return (
    <section className="benefits-section">
      <div className="container">
        <h2>{"Why Choose EaseMyTools?"}</h2>
        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <div key={index} className="benefit-card">
              <div className="benefit-icon">{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;