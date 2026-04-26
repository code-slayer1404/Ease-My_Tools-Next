"use client";


import { useTheme } from '../contexts/ThemeContext';
import '../styles/PrivacyPolicy.css';

const PrivacyPolicy = () => {
  const { theme } = useTheme();

  return (
    <div className={`privacy-policy ${theme}`}>
      <div className="privacy-container">
        <header className="privacy-header">
          <h1>{"Privacy Policy"}</h1>
          <p className="last-updated">
            {"Last Updated:"} {new Date().toLocaleDateString()}
          </p>
        </header>

        <div className="privacy-content">
          <section className="policy-section">
            <h2>{"Introduction"}</h2>
            <p>
              {"Welcome to EaseMyTools. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and tools."}
            </p>
          </section>

          <section className="policy-section">
            <h2>{"Information We Collect"}</h2>
            <h3>{"Automatically Collected Information"}</h3>
            <ul>
              <li>{"IP address and browser type"}</li>
              <li>{"Device information and operating system"}</li>
              <li>{"Usage data and access times"}</li>
              <li>{"Referring website addresses"}</li>
            </ul>

            <h3>{"Files You Process"}</h3>
            <p>
              {"All file processing happens locally in your browser. We do not store, upload, or permanently save any files you process through our tools. Your files remain on your device and are never transmitted to our servers."}
            </p>
          </section>

          <section className="policy-section">
            <h2>{"How We Use Your Information"}</h2>
            <ul>
              <li>{"To provide and maintain our services"}</li>
              <li>{"To improve user experience and tool functionality"}</li>
              <li>{"To analyze usage patterns and optimize performance"}</li>
              <li>{"To communicate with you about updates and features"}</li>
              <li>{"To ensure the security of our platform"}</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>{"Data Retention and Storage"}</h2>
            <p>
              {"We do not retain any processed files or their contents. Any temporary data generated during tool usage is automatically cleared when you close your browser or navigate away from the page. Analytics data is retained for 24 months to help us improve our services."}
            </p>
          </section>

          <section className="policy-section">
            <h2>{"Cookies and Tracking Technologies"}</h2>
            <p>
              {"We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier."}
            </p>
            
            <h3>{"Types of Cookies We Use"}</h3>
            <ul>
              <li>
                <strong>{"Essential Cookies:"}</strong> 
                {" Required for basic website functionality"}
              </li>
              <li>
                <strong>{"Analytics Cookies:"}</strong> 
                {" Help us understand how visitors interact with our website"}
              </li>
              <li>
                <strong>{"Preference Cookies:"}</strong> 
                {" Remember your settings and preferences"}
              </li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>{"Third-Party Services"}</h2>
            <p>
              {"We may employ third-party companies and individuals to facilitate our service, provide the service on our behalf, perform service-related services, or assist us in analyzing how our service is used. These third parties have access to your personal information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose."}
            </p>
          </section>

          <section className="policy-section">
            <h2>{"Data Security"}</h2>
            <p>
              {"We implement appropriate technical and organizational security measures designed to protect your personal information. However, please note that no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security."}
            </p>
          </section>

          <section className="policy-section">
            <h2>{"Your Rights"}</h2>
            <p>{"Depending on your location, you may have the following rights regarding your personal information:"}</p>
            <ul>
              <li>{"The right to access personal information we hold about you"}</li>
              <li>{"The right to request correction of inaccurate personal information"}</li>
              <li>{"The right to request deletion of your personal information"}</li>
              <li>{"The right to object to processing of your personal information"}</li>
              <li>{"The right to data portability"}</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>{"Children's Privacy"}</h2>
            <p>
              {"Our services are not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us."}
            </p>
          </section>

          <section className="policy-section">
            <h2>{"Changes to This Privacy Policy"}</h2>
            <p>
              {"We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the \"Last Updated\" date. You are advised to review this Privacy Policy periodically for any changes."}
            </p>
          </section>

          <section className="policy-section">
            <h2>{"Contact Us"}</h2>
            <p>
              {"If you have any questions about this Privacy Policy, please contact us:"}
            </p>
            <div className="contact-info">
              <p><strong>{"Email:"}</strong> privacy@easemytools.com</p>
              <p><strong>{"Website:"}</strong> https://easemytools.com/contact</p>
            </div>
          </section>
        </div>

        <div className="privacy-actions">
          <button 
            className="back-button"
            onClick={() => window.history.back()}
          >
            {"Go Back"}
          </button>
          <button 
            className="print-button"
            onClick={() => window.print()}
          >
            {"Print Policy"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;