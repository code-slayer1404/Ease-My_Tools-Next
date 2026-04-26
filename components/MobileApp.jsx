"use client";


import { useTheme } from '../contexts/ThemeContext';
import '../styles/MobileApp.css';

const MobileApp = () => {
  const { theme } = useTheme();

  const features = [
    {
      icon: '📱',
      title: "Optimized for Mobile",
      description: "All tools perfectly adapted for touch screens and mobile devices"
    },
    {
      icon: '⚡',
      title: "Offline Capability",
      description: "Use many tools without internet connection"
    },
    {
      icon: '🔒',
      title: "Enhanced Security",
      description: "Additional security features for mobile usage"
    },
    {
      icon: '💾',
      title: "Local Storage",
      description: "Save your work directly to your device"
    }
  ];

  const appStores = [
    {
      name: 'App Store',
      icon: '🍎',
      url: '#',
      buttonText: "Download on the App Store"
    },
    {
      name: 'Google Play',
      icon: '🤖',
      url: '#',
      buttonText: "Get it on Google Play"
    }
  ];

  return (
    <div className={`mobile-app-page ${theme}`}>
      <div className="mobile-container">
        <header className="mobile-header">
          <div className="header-content">
            <h1>{"EaseMyTools Mobile"}</h1>
            <p className="subtitle">
              {"Take your favorite tools anywhere. Download our mobile app for iOS and Android."}
            </p>
            <div className="app-badges">
              {appStores.map((store, index) => (
                <a
                  key={index}
                  href={store.url}
                  className="app-badge"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="store-icon">{store.icon}</span>
                  <div className="store-info">
                    <span className="available">{"Available on"}</span>
                    <span className="store-name">{store.name}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
          <div className="header-image">
            <div className="phone-mockup">
              <div className="phone-screen">
                <div className="app-preview">
                  <div className="app-header">
                    <span className="app-logo">🛠️</span>
                    <span className="app-name">EaseMyTools</span>
                  </div>
                  <div className="app-tools">
                    <div className="tool-item">📷 Image Tools</div>
                    <div className="tool-item">📄 PDF Tools</div>
                    <div className="tool-item">🔤 Text Tools</div>
                    <div className="tool-item">🧮 Calculators</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="mobile-features">
          <h2>{"Why Use Our Mobile App?"}</h2>
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

        <section className="mobile-cta">
          <div className="cta-content">
            <h2>{"Ready to Get Started?"}</h2>
            <p>{"Download the app now and have all your tools in your pocket"}</p>
            <div className="cta-buttons">
              {appStores.map((store, index) => (
                <a
                  key={index}
                  href={store.url}
                  className="store-button"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="button-icon">{store.icon}</span>
                  {store.buttonText}
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MobileApp;