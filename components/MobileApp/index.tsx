"use client";
import styles from './styles.module.css';

const MobileApp = () => {

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
    <div className={styles["mobile-app-page"]}>
      <div className={styles["mobile-container"]}>
        <header className={styles["mobile-header"]}>
          <div className={styles["header-content"]}>
            <h1>{"EaseMyTools Mobile"}</h1>
            <p className={styles["subtitle"]}>
              {"Explore planned mobile experiences and current browser-first access for iOS and Android users."}
            </p>
            <div className={styles["app-badges"]}>
              {appStores.map((store, index) => (
                <a
                  key={index}
                  href={store.url}
                  className={styles["app-badge"]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className={styles["store-icon"]}>{store.icon}</span>
                  <div className={styles["store-info"]}>
                    <span className={styles["available"]}>{"Available on"}</span>
                    <span className={styles["store-name"]}>{store.name}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
          <div className={styles["header-image"]}>
            <div className={styles["phone-mockup"]}>
              <div className={styles["phone-screen"]}>
                <div className={styles["app-preview"]}>
                  <div className={styles["app-header"]}>
                    <span className={styles["app-logo"]}>🛠️</span>
                    <span className={styles["app-name"]}>EaseMyTools</span>
                  </div>
                  <div className={styles["app-tools"]}>
                    <div className={styles["tool-item"]}>📷 Image Tools</div>
                    <div className={styles["tool-item"]}>📄 PDF Tools</div>
                    <div className={styles["tool-item"]}>🔤 Text Tools</div>
                    <div className={styles["tool-item"]}>🧮 Calculators</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className={styles["mobile-features"]}>
          <h2>{"Why Use Our Mobile App?"}</h2>
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

        <section className={styles["mobile-cta"]}>
          <div className={styles["cta-content"]}>
            <h2>{"Ready to Get Started?"}</h2>
            <p>{"Download the app now and have all your tools in your pocket"}</p>
            <div className={styles["cta-buttons"]}>
              {appStores.map((store, index) => (
                <a
                  key={index}
                  href={store.url}
                  className={styles["store-button"]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className={styles["button-icon"]}>{store.icon}</span>
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