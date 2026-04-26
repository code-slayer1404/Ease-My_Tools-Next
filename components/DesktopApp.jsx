"use client";


import { useTheme } from '../contexts/ThemeContext';
import '../styles/DesktopApp.module.css';

const DesktopApp = () => {
  const { theme } = useTheme();

  const features = [
    {
      icon: '⚡',
      title: "Native Performance",
      description: "Lightning-fast performance with native desktop optimization"
    },
    {
      icon: '💾',
      title: "Offline Access",
      description: "Use all tools without internet connection"
    },
    {
      icon: '🖥️',
      title: "System Integration",
      description: "Seamless integration with your operating system"
    },
    {
      icon: '🔒',
      title: "Enhanced Security",
      description: "Additional security features and local data storage"
    }
  ];

  const downloadOptions = [
    {
      os: 'Windows',
      icon: '🪟',
      version: "Windows 10+",
      size: "85 MB",
      downloadUrl: '#',
      instructions: "Download the .exe file and run the installer"
    },
    {
      os: 'macOS',
      icon: '🍎',
      version: "macOS 11.0+",
      size: "105 MB",
      downloadUrl: '#',
      instructions: "Download the .dmg file and drag to Applications"
    },
    {
      os: 'Linux',
      icon: '🐧',
      version: "Ubuntu 18.04+",
      size: "92 MB",
      downloadUrl: '#',
      instructions: "Download the .AppImage and make executable"
    }
  ];

  return (
    <div className={`desktop-app-page ${theme}`}>
      <div className="desktop-container">
        <header className="desktop-header">
          <div className="header-content">
            <h1>{"EaseMyTools Desktop"}</h1>
            <p className="subtitle">
              {"Get the full power of EaseMyTools on your desktop. Faster, more secure, and works offline."}
            </p>
            <div className="download-badges">
              {downloadOptions.map((option, index) => (
                <a
                  key={index}
                  href={option.downloadUrl}
                  className="download-badge"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="os-icon">{option.icon}</span>
                  <div className="os-info">
                    <span className="os-name">{option.os}</span>
                    <span className="os-details">{option.version} • {option.size}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
          <div className="header-image">
            <div className="desktop-mockup">
              <div className="desktop-screen">
                <div className="app-window">
                  <div className="window-header">
                    <div className="window-controls">
                      <span className="control close"></span>
                      <span className="control minimize"></span>
                      <span className="control maximize"></span>
                    </div>
                    <span className="window-title">EaseMyTools Desktop</span>
                  </div>
                  <div className="window-content">
                    <div className="sidebar">
                      <div className="sidebar-item active">🖼️ Image Tools</div>
                      <div className="sidebar-item">📄 PDF Tools</div>
                      <div className="sidebar-item">🔤 Text Tools</div>
                      <div className="sidebar-item">🧮 Calculators</div>
                    </div>
                    <div className="main-content">
                      <div className="tool-grid">
                        <div className="tool-card">Remove Background</div>
                        <div className="tool-card">Image Resizer</div>
                        <div className="tool-card">Format Converter</div>
                        <div className="tool-card">Color Picker</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="desktop-features">
          <h2>{"Desktop Exclusive Features"}</h2>
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

        <section className="download-section">
          <h2>{"Download for Your Platform"}</h2>
          <div className="download-grid">
            {downloadOptions.map((option, index) => (
              <div key={index} className="download-card">
                <div className="download-header">
                  <span className="platform-icon">{option.icon}</span>
                  <div className="platform-info">
                    <h3>{option.os}</h3>
                    <span className="platform-version">{option.version}</span>
                  </div>
                </div>
                <div className="download-details">
                  <p className="file-size">{"File size:"} {option.size}</p>
                  <p className="instructions">{option.instructions}</p>
                </div>
                <a
                  href={option.downloadUrl}
                  className="download-button"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {"Download for"} {option.os}
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="desktop-cta">
          <div className="cta-content">
            <h2>{"Ready to Boost Your Productivity?"}</h2>
            <p>{"Download the desktop app and experience the full power of EaseMyTools"}</p>
            <div className="cta-buttons">
              {downloadOptions.map((option, index) => (
                <a
                  key={index}
                  href={option.downloadUrl}
                  className="cta-button"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="button-icon">{option.icon}</span>
                  {"Download for"} {option.os}
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DesktopApp;