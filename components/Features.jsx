"use client";


import { useTheme } from '../contexts/ThemeContext';
import '../styles/Features.css';

const Features = () => {
  const { theme } = useTheme();

  const features = [
    {
      icon: '⚡',
      title: "Lightning Fast",
      description: "Process files in seconds with our optimized algorithms and browser-based processing."
    },
    {
      icon: '🔒',
      title: "100% Secure",
      description: "All processing happens locally in your browser. Your files never leave your device."
    },
    {
      icon: '💯',
      title: "Completely Free",
      description: "No hidden costs, no watermarks, no subscription fees. Everything is free forever."
    },
    {
      icon: '🎯',
      title: "No Watermarks",
      description: "Get clean, professional results without any branding or watermarks."
    },
    {
      icon: '📱',
      title: "Fully Responsive",
      description: "Works perfectly on desktop, tablet, and mobile devices."
    },
    {
      icon: '🌐',
      title: "No Installation",
      description: "Use all tools directly in your browser without downloading any software."
    },
    {
      icon: '🔄',
      title: "Real-time Processing",
      description: "See changes instantly with live preview and real-time processing."
    },
    {
      icon: '🎨',
      title: "Professional Quality",
      description: "Enterprise-grade tools that produce professional-quality results."
    }
  ];

  return (
    <div className={`features-page ${theme}`}>
      <div className="features-container">
        <header className="features-header">
          <h1>{"Powerful Features"}</h1>
          <p className="features-subtitle">
            {"Everything you need to simplify your digital workflow"}
          </p>
        </header>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="features-cta">
          <h2>{"Ready to get started?"}</h2>
          <p>{"Choose from 50+ free tools to simplify your work"}</p>
          <button 
            className="cta-button"
            onClick={() => window.location.href = '/tools'}
          >
            {"Explore All Tools"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Features;