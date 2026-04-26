"use client";


import { useTheme } from '../contexts/ThemeContext';
import '../styles/LegalPage.css';

const TermsConditions = () => {
  const { theme } = useTheme();

  return (
    <div className={`legal-page ${theme}`}>
      <div className="legal-container">
        <header className="legal-header">
          <h1>{"Terms & Conditions"}</h1>
          <p className="last-updated">
            {"Last Updated:"} {new Date().toLocaleDateString()}
          </p>
        </header>

        <div className="legal-content">
          <section className="policy-section">
            <h2>{"Acceptance of Terms"}</h2>
            <p>
              {"By accessing and using EaseMyTools, you accept and agree to be bound by the terms and provision of this agreement."}
            </p>
          </section>

          <section className="policy-section">
            <h2>{"Use License"}</h2>
            <p>
              {"Permission is granted to temporarily use EaseMyTools for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title."}
            </p>
          </section>

          <section className="policy-section">
            <h2>{"User Responsibilities"}</h2>
            <p>
              {"You are responsible for the files you process through our tools. Ensure you have the right to use and process any content you upload."}
            </p>
          </section>

          <section className="policy-section">
            <h2>{"Limitations"}</h2>
            <p>
              {"In no event shall EaseMyTools or its suppliers be liable for any damages arising out of the use or inability to use our tools."}
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

export default TermsConditions;