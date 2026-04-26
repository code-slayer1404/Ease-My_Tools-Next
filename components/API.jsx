"use client";

import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/API.css';

const API = () => {
  const { theme } = useTheme();
  const [activeEndpoint, setActiveEndpoint] = useState(0);

  const endpoints = [
    {
      name: 'remove-background',
      method: 'POST',
      path: '/api/v1/remove-background',
      description: "Remove background from images using AI",
      parameters: [
        {
          name: 'image',
          type: 'file',
          required: true,
          description: "Image file (JPEG, PNG, WebP)"
        },
        {
          name: 'bg_mode',
          type: 'string',
          required: false,
          description: "Background mode: transparent or color"
        }
      ],
      response: `{
  "success": true,
  "result": {
    "image_url": "https://api.easemytools.com/results/abc123.png",
    "processing_time": 1.23
  }
}`
    },
    {
      name: 'image-resize',
      method: 'POST',
      path: '/api/v1/image-resize',
      description: "Resize images with quality preservation",
      parameters: [
        {
          name: 'image',
          type: 'file',
          required: true,
          description: "Image file to resize"
        },
        {
          name: 'width',
          type: 'integer',
          required: true,
          description: "Target width in pixels"
        },
        {
          name: 'height',
          type: 'integer',
          required: true,
          description: "Target height in pixels"
        }
      ],
      response: `{
  "success": true,
  "result": {
    "image_url": "https://api.easemytools.com/results/def456.png",
    "original_size": "1920x1080",
    "new_size": "800x450"
  }
}`
    }
  ];

  const codeExamples = [
    {
      language: 'JavaScript',
      code: `// Remove background example
const formData = new FormData();
formData.append('image', imageFile);
formData.append('bg_mode', 'transparent');

const response = await fetch('https://api.easemytools.com/api/v1/remove-background', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: formData
});

const result = await response.json();
console.log(result);`
    },
    {
      language: 'Python',
      code: `import requests

url = "https://api.easemytools.com/api/v1/remove-background"
headers = {"Authorization": "Bearer YOUR_API_KEY"}

with open("image.png", "rb") as image_file:
    files = {"image": image_file}
    data = {"bg_mode": "transparent"}
    response = requests.post(url, files=files, data=data, headers=headers)

print(response.json())`
    }
  ];

  return (
    <div className={`api-page ${theme}`}>
      <div className="api-container">
        <header className="api-header">
          <h1>{"EaseMyTools API"}</h1>
          <p className="api-subtitle">
            {"Integrate our powerful tools directly into your applications with our REST API"}
          </p>
          <div className="api-actions">
            <button className="primary-button">
              {"Get API Key"}
            </button>
            <button className="secondary-button">
              {"View Documentation"}
            </button>
          </div>
        </header>

        <section className="api-features">
          <h2>{"Why Use Our API?"}</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>{"High Performance"}</h3>
              <p>{"Process thousands of requests per second with our scalable infrastructure"}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>{"Secure & Reliable"}</h3>
              <p>{"Enterprise-grade security with 99.9% uptime SLA"}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>{"Comprehensive Docs"}</h3>
              <p>{"Detailed documentation with code examples in multiple languages"}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>{"Developer Support"}</h3>
              <p>{"Dedicated support team to help you integrate our API"}</p>
            </div>
          </div>
        </section>

        <section className="api-endpoints">
          <h2>{"Available Endpoints"}</h2>
          <div className="endpoints-container">
            <div className="endpoints-sidebar">
              {endpoints.map((endpoint, index) => (
                <button
                  key={index}
                  className={`endpoint-item ${activeEndpoint === index ? 'active' : ''}`}
                  onClick={() => setActiveEndpoint(index)}
                >
                  <span className={`method ${endpoint.method.toLowerCase()}`}>
                    {endpoint.method}
                  </span>
                  <span className="endpoint-path">{endpoint.path}</span>
                </button>
              ))}
            </div>
            <div className="endpoint-details">
              {endpoints[activeEndpoint] && (
                <>
                  <div className="endpoint-header">
                    <h3>{endpoints[activeEndpoint].name}</h3>
                    <p>{endpoints[activeEndpoint].description}</p>
                  </div>
                  
                  <div className="parameters-section">
                    <h4>{"Parameters"}</h4>
                    <div className="parameters-table">
                      <div className="table-header">
                        <span>{"Parameter"}</span>
                        <span>{"Type"}</span>
                        <span>{"Required"}</span>
                        <span>{"Description"}</span>
                      </div>
                      {endpoints[activeEndpoint].parameters.map((param, index) => (
                        <div key={index} className="table-row">
                          <span className="param-name">{param.name}</span>
                          <span className="param-type">{param.type}</span>
                          <span className="param-required">
                            {param.required ? '✓' : '✗'}
                          </span>
                          <span className="param-description">{param.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="response-section">
                    <h4>{"Response"}</h4>
                    <pre className="response-code">
                      <code>{endpoints[activeEndpoint].response}</code>
                    </pre>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="code-examples">
          <h2>{"Code Examples"}</h2>
          <div className="examples-tabs">
            {codeExamples.map((example, index) => (
              <div key={index} className="code-example">
                <div className="example-header">
                  <span className="language">{example.language}</span>
                </div>
                <pre className="example-code">
                  <code>{example.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>

        <section className="api-pricing">
          <h2>{"Simple Pricing"}</h2>
          <div className="pricing-cards">
            <div className="pricing-card">
              <h3>{"Developer"}</h3>
              <div className="price">$0</div>
              <p>{"Perfect for testing and development"}</p>
              <ul>
                <li>1,000 requests/month</li>
                <li>Basic support</li>
                <li>All tools available</li>
              </ul>
              <button className="pricing-button">
                {"Get Started"}
              </button>
            </div>
            <div className="pricing-card highlighted">
              <h3>{"Startup"}</h3>
              <div className="price">$29<span>/month</span></div>
              <p>{"For growing applications"}</p>
              <ul>
                <li>50,000 requests/month</li>
                <li>Priority support</li>
                <li>Advanced features</li>
              </ul>
              <button className="pricing-button primary">
                {"Get Started"}
              </button>
            </div>
            <div className="pricing-card">
              <h3>{"Enterprise"}</h3>
              <div className="price">$199<span>/month</span></div>
              <p>{"For high-volume applications"}</p>
              <ul>
                <li>500,000 requests/month</li>
                <li>24/7 support</li>
                <li>Custom solutions</li>
              </ul>
              <button className="pricing-button">
                {"Contact Sales"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default API;