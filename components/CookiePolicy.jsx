"use client";


import { useTheme } from '../contexts/ThemeContext';
import '../styles/LegalPage.css';

const CookiePolicy = () => {
  const { theme } = useTheme();

  return (
    <div className={`legal-page ${theme}`}>
      <div className="legal-container">
        <header className="legal-header">
          <h1>{"Cookie Policy"}</h1>
          <p className="last-updated">
            {"Last Updated:"} {new Date().toLocaleDateString()}
          </p>
        </header>

        <div className="legal-content">
          <section className="policy-section">
            <h2>{"What Are Cookies"}</h2>
            <p>
              {"Cookies are small text files that are placed on your device by websites you visit. They are widely used to make websites work more efficiently."}
            </p>
          </section>

          <section className="policy-section">
            <h2>{"How We Use Cookies"}</h2>
            <p>
              {"We use cookies to understand how you use our website and to improve your experience. This includes remembering your preferences and settings."}
            </p>
          </section>

          <section className="policy-section">
            <h2>{"Managing Cookies"}</h2>
            <p>
              {"You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and set most browsers to prevent them from being placed."}
            </p>
          </section>
        </div>

        <div className="legal-actions">
          <button className="back-button" onClick={() => window.history.back()}>
            {"Go Back"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;