"use client";


import { useRouter } from 'next/navigation';
import '../styles/FeaturedTools.css';

const FeaturedTools = () => {
  const router = useRouter();

  const featuredTools = [
    {
      icon: '🖼️',
      title: "Remove Background",
      description: "AI-powered background removal in seconds",
      badge: 'Popular',
      path: '/remove-background'
    },
    {
      icon: '📄',
      title: "PDF Converter",
      description: "Convert PDFs to various formats",
      path: '/file-converter' // Update this to match your actual PDF tool route
    },
    {
      icon: '🎨',
      title: "Image Resizer",
      description: "Resize images without quality loss",
      path: '/image-resizer'
    },
    {
      icon: '🔐',
      title: "Password Generator",
      description: "Create strong, secure passwords",
      badge: 'New',
      path: '/password-generator'
    }
  ];

  const handleToolClick = (path) => {
    router.push(path);
  };

  return (
    <section className="featured-tools">
      <div className="container">
        <h2>{"Most Popular Tools"}</h2>
        <p className="section-subtitle">
          {"Try our most loved tools trusted by thousands"}
        </p>
        <div className="tools-grid">
          {featuredTools.map((tool, index) => (
            <div 
              key={index} 
              className="tool-card"
              onClick={() => handleToolClick(tool.path)}
            >
              {tool.badge && <span className="tool-badge">{tool.badge}</span>}
              <div className="tool-icon">{tool.icon}</div>
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
              <button className="tool-btn">
                {"Use Tool →"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTools;