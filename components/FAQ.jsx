"use client";

import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/FAQ.css';

const FAQ = () => {
  const { theme } = useTheme();
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqCategories = [
    {
      title: "General Questions",
      items: [
        {
          question: "What is EaseMyTools?",
          answer: "EaseMyTools is a collection of free online tools that help you with various digital tasks like file conversion, image editing, text processing, and more. All tools work directly in your browser."
        },
        {
          question: "Is EaseMyTools really free?",
          answer: "Yes! All our tools are completely free to use. There are no hidden costs, no watermarks, and no subscription fees. We believe in providing accessible tools for everyone."
        },
        {
          question: "Do I need to create an account?",
          answer: "No account is required to use our tools. You can start using any tool immediately without signing up. However, creating an account lets you save your preferences and access additional features."
        }
      ]
    },
    {
      title: "Technical Questions",
      items: [
        {
          question: "Are my files safe and private?",
          answer: "Absolutely! All file processing happens locally in your browser. Your files never leave your device and are never uploaded to our servers. We cannot access or see your files."
        },
        {
          question: "What file formats do you support?",
          answer: "We support a wide range of file formats including PDF, JPG, PNG, GIF, MP4, DOC, TXT, and many more. Each tool page specifies the supported formats."
        },
        {
          question: "Is there a file size limit?",
          answer: "Most tools can handle files up to 100MB, but this may vary depending on the tool and your device capabilities. Larger files may take longer to process."
        },
        {
          question: "Why is a tool not working?",
          answer: "If a tool isn\\'t working, try refreshing the page, clearing your browser cache, or using a different browser. Most issues are resolved by these simple steps."
        }
      ]
    },
    {
      title: "Account & Billing",
      items: [
        {
          question: "What are the benefits of creating an account?",
          answer: "With an account, you can save your tool preferences, access usage history, create custom tool presets, and get early access to new features."
        },
        {
          question: "How do I reset my password?",
          answer: "Click on \"Forgot Password\" on the login page and enter your email address. We\\'ll send you instructions to reset your password."
        },
        {
          question: "Can I delete my account?",
          answer: "Yes, you can delete your account at any time from your account settings. This will permanently remove all your data from our systems."
        }
      ]
    }
  ];

  return (
    <div className={`faq-page ${theme}`}>
      <div className="faq-container">
        <header className="faq-header">
          <h1>{"Frequently Asked Questions"}</h1>
          <p className="faq-subtitle">
            {"Find answers to common questions about EaseMyTools"}
          </p>
        </header>

        <div className="faq-search">
          <input
            type="text"
            placeholder={"Search questions..."}
            className="search-input"
          />
        </div>

        <div className="faq-content">
          {faqCategories.map((category, categoryIndex) => (
            <section key={categoryIndex} className="faq-category">
              <h2>{category.title}</h2>
              <div className="faq-items">
                {category.items.map((item, itemIndex) => {
                  const globalIndex = categoryIndex * 10 + itemIndex;
                  return (
                    <div 
                      key={itemIndex} 
                      className={`faq-item ${openItems[globalIndex] ? 'open' : ''}`}
                    >
                      <div 
                        className="faq-question"
                        onClick={() => toggleItem(globalIndex)}
                      >
                        <h3>{item.question}</h3>
                        <span className="toggle-icon">
                          {openItems[globalIndex] ? '−' : '+'}
                        </span>
                      </div>
                      {openItems[globalIndex] && (
                        <div className="faq-answer">
                          <p>{item.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="faq-support">
          <h2>{"Still need help?"}</h2>
          <p>{"Can't find the answer you're looking for? Please contact our support team."}</p>
          <div className="support-buttons">
            <button 
              className="support-button primary"
              onClick={() => window.location.href = '/contact'}
            >
              {"Contact Support"}
            </button>
            <button 
              className="support-button secondary"
              onClick={() => window.location.href = '/tools'}
            >
              {"Browse All Tools"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;