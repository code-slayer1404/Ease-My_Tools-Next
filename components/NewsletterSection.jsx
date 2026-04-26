"use client";

import { useState } from 'react';
import '../styles/NewsletterSection.css';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    alert("Thank you for subscribing!");
    setEmail('');
  };

  return (
    <section className="newsletter-section">
      <div className="container">
        <div className="newsletter-content">
          <h3>{"Stay Updated"}</h3>
          <p>{"Get notified about new tools and features"}</p>
          <form onSubmit={handleSubmit} className="newsletter-form">
            <input
              type="email"
              placeholder={"Enter your email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">
              {"Subscribe"}
            </button>
          </form>
          <small>{"We respect your privacy. Unsubscribe at any time."}</small>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;