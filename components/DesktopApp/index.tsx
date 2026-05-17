"use client";
import styles from './styles.module.css';

const DesktopApp = () => {

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
    <div className={styles["desktop-app-page"]}>
      <div className={styles["desktop-container"]}>
        <header className={styles["desktop-header"]}>
          <div className={styles["header-content"]}>
            <h1>{"EaseMyTools Desktop"}</h1>
            <p className={styles["subtitle"]}>
              {"Review planned desktop capabilities for offline-friendly workflows and local processing."}
            </p>
            <div className={styles["download-badges"]}>
              {downloadOptions.map((option, index) => (
                <a
                  key={index}
                  href={option.downloadUrl}
                  className={styles["download-badge"]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className={styles["os-icon"]}>{option.icon}</span>
                  <div className={styles["os-info"]}>
                    <span className={styles["os-name"]}>{option.os}</span>
                    <span className={styles["os-details"]}>{option.version} • {option.size}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
          <div className={styles["header-image"]}>
            <div className={styles["desktop-mockup"]}>
              <div className={styles["desktop-screen"]}>
                <div className={styles["app-window"]}>
                  <div className={styles["window-header"]}>
                    <div className={styles["window-controls"]}>
                      <span className={`${styles["control"]} ${styles["close"]}`}></span>
                      <span className={`${styles["control"]} ${styles["minimize"]}`}></span>
                      <span className={`${styles["control"]} ${styles["maximize"]}`}></span>
                    </div>
                    <span className={styles["window-title"]}>EaseMyTools Desktop</span>
                  </div>
                  <div className={styles["window-content"]}>
                    <div className={styles["sidebar"]}>
                      <div className={`${styles["sidebar-item"]} ${styles["active"]}`}>🖼️ Image Tools</div>
                      <div className={styles["sidebar-item"]}>📄 PDF Tools</div>
                      <div className={styles["sidebar-item"]}>🔤 Text Tools</div>
                      <div className={styles["sidebar-item"]}>🧮 Calculators</div>
                    </div>
                    <div className={styles["main-content"]}>
                      <div className={styles["tool-grid"]}>
                        <div className={styles["tool-card"]}>Remove Background</div>
                        <div className={styles["tool-card"]}>Image Resizer</div>
                        <div className={styles["tool-card"]}>Format Converter</div>
                        <div className={styles["tool-card"]}>Color Picker</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className={styles["desktop-features"]}>
          <h2>{"Desktop Exclusive Features"}</h2>
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

        <section className={styles["download-section"]}>
          <h2>{"Download for Your Platform"}</h2>
          <div className={styles["download-grid"]}>
            {downloadOptions.map((option, index) => (
              <div key={index} className={styles["download-card"]}>
                <div className={styles["download-header"]}>
                  <span className={styles["platform-icon"]}>{option.icon}</span>
                  <div className={styles["platform-info"]}>
                    <h3>{option.os}</h3>
                    <span className={styles["platform-version"]}>{option.version}</span>
                  </div>
                </div>
                <div className={styles["download-details"]}>
                  <p className={styles["file-size"]}>{"File size:"} {option.size}</p>
                  <p className={styles["instructions"]}>{option.instructions}</p>
                </div>
                <a
                  href={option.downloadUrl}
                  className={styles["download-button"]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {"Download for"} {option.os}
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className={styles["desktop-cta"]}>
          <div className={styles["cta-content"]}>
            <h2>{"Ready to Boost Your Productivity?"}</h2>
            <p>{"Download the desktop app and experience the full power of EaseMyTools"}</p>
            <div className={styles["cta-buttons"]}>
              {downloadOptions.map((option, index) => (
                <a
                  key={index}
                  href={option.downloadUrl}
                  className={styles["cta-button"]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className={styles["button-icon"]}>{option.icon}</span>
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