"use client";

import React, { useState, useRef, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/tools/FaviconGenerator.css';

const FaviconGenerator = () => {
  const { theme } = useTheme();
  
  const [originalImage, setOriginalImage] = useState('');
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [generatedIcons, setGeneratedIcons] = useState([]);
  const [settings, setSettings] = useState({
    format: 'ico',
    sizes: [16, 32, 48, 64, 128, 256],
    backgroundColor: 'transparent',
    padding: 0,
    borderRadius: 0,
    preserveAspectRatio: true
  });

  const fileInputRef = useRef();
  const canvasRef = useRef();

  // Supported formats with descriptions
  const formatOptions = [
    { value: 'ico', label: 'ICO', description: "Traditional favicon format, supports multiple sizes in one file", extensions: ['.ico'] },
    { value: 'png', label: 'PNG', description: "Modern format with transparency support", extensions: ['.png'] },
    { value: 'all', label: "All Formats", description: "Generate both ICO and PNG formats for maximum compatibility", extensions: ['.ico', '.png', '.svg'] }
  ];

  // Common favicon sizes
  const sizeOptions = [
    { value: 16, label: '16×16', description: "Standard browser favicon" },
    { value: 32, label: '32×32', description: "Taskbar and bookmark icons" },
    { value: 48, label: '48×48', description: "Desktop shortcuts" },
    { value: 64, label: '64×64', description: "High DPI displays" },
    { value: 128, label: '128×128', description: "Chrome Web Store" },
    { value: 256, label: '256×256', description: "Retina displays" },
    { value: 512, label: '512×512', description: "Progressive Web Apps" }
  ];

  // Handle file upload
  const handleFileUpload = useCallback((uploadedFile) => {
    if (!uploadedFile) return;
    
    if (uploadedFile.size > 5 * 1024 * 1024) {
      alert("File too large. Maximum size is 5MB.");
      return;
    }
    
    if (!uploadedFile.type.startsWith('image/')) {
      alert("Invalid file type. Please upload an image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target.result);
      setFile(uploadedFile);
      setGeneratedIcons([]);
    };
    reader.readAsDataURL(uploadedFile);
  }, [t]);

  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const uploadedFile = e.dataTransfer.files[0];
    handleFileUpload(uploadedFile);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  // Toggle size selection
  const toggleSize = (size) => {
    setSettings(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size].sort((a, b) => a - b)
    }));
  };

  // Select all sizes
  const selectAllSizes = () => {
    setSettings(prev => ({
      ...prev,
      sizes: sizeOptions.map(opt => opt.value)
    }));
  };

  // Clear all sizes
  const clearAllSizes = () => {
    setSettings(prev => ({
      ...prev,
      sizes: []
    }));
  };

  // Generate favicons
  const generateFavicons = async () => {
    if (!file) {
      alert("Please upload an image first");
      return;
    }

    if (settings.sizes.length === 0) {
      alert("Please select at least one size");
      return;
    }

    setProcessing(true);
    setGeneratedIcons([]);

    try {
      // Simulate processing - in real implementation, this would use canvas or server-side processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const icons = settings.sizes.map(size => ({
        size,
        format: settings.format === 'all' ? (size <= 64 ? 'ico' : 'png') : settings.format,
        url: originalImage, // In real implementation, this would be the processed icon
        name: `favicon-${size}x${size}.${settings.format === 'all' ? (size <= 64 ? 'ico' : 'png') : settings.format}`
      }));

      setGeneratedIcons(icons);
    } catch (error) {
      console.error('Favicon generation error:', error);
      alert("Failed to generate favicons. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Download single icon
  const downloadIcon = (icon) => {
    const link = document.createElement('a');
    link.download = icon.name;
    link.href = icon.url;
    link.click();
  };

  // Download all icons as zip
  const downloadAllIcons = () => {
    alert("In a real implementation, this would download a ZIP file containing all icons"); // In real implementation, this would create and download a zip file
    generatedIcons.forEach(icon => downloadIcon(icon));
  };

  // Copy HTML code to clipboard
  const copyHTMLCode = () => {
    const htmlCode = generatedIcons.map(icon => {
      if (icon.format === 'ico' && icon.size === 16) {
        return `<link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="16x16">`;
      }
      return `<link rel="icon" type="image/${icon.format}" href="/favicon-${icon.size}x${icon.size}.${icon.format}" sizes="${icon.size}x${icon.size}">`;
    }).join('\n');

    navigator.clipboard.writeText(htmlCode)
      .then(() => alert("HTML code copied to clipboard!"))
      .catch(() => alert("Failed to copy HTML code"));
  };

  // Clear all
  const clearAll = () => {
    setFile(null);
    setOriginalImage('');
    setGeneratedIcons([]);
    setSettings({
      format: 'ico',
      sizes: [16, 32, 48, 64, 128, 256],
      backgroundColor: 'transparent',
      padding: 0,
      borderRadius: 0,
      preserveAspectRatio: true
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`favicon-generator ${theme}`}>
      <div className="tool-header">
        <h1>{"Favicon Generator"}</h1>
        <p>{"Create professional favicons for your website in multiple formats and sizes"}</p>
      </div>

      <div className="generator-container">
        {/* Upload Section */}
        <div className="upload-section">
          <div 
            className="upload-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            {!originalImage ? (
              <div className="upload-content">
                <div className="upload-icon">🖼️</div>
                <h3>{"Upload Your Image"}</h3>
                <p>{"Drag & drop your image here or click to browse"}</p>
                <small>{"Supports: JPG, PNG, SVG, WebP"}</small>
                <small>{"Max file size: 5MB"}</small>
              </div>
            ) : (
              <div className="image-preview">
                <img src={originalImage} alt="Uploaded" className="preview-image" />
                <div className="image-info">
                  <strong>{file.name}</strong>
                  <small>{(file.size / 1024).toFixed(2)} KB</small>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Settings Section */}
        {file && (
          <div className="settings-section">
            <h3>{"Favicon Settings"}</h3>
            
            <div className="settings-grid">
              {/* Format Selection */}
              <div className="setting-group">
                <label>{"Output Format"}</label>
                <div className="format-options">
                  {formatOptions.map(format => (
                    <div
                      key={format.value}
                      className={`format-option ${settings.format === format.value ? 'active' : ''}`}
                      onClick={() => setSettings(prev => ({ ...prev, format: format.value }))}
                    >
                      <div className="format-header">
                        <span className="format-label">{format.label}</span>
                        <span className="format-badge">{format.extensions.join(', ')}</span>
                      </div>
                      <p className="format-description">{format.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="setting-group">
                <div className="size-header">
                  <label>{"Favicon Sizes"}</label>
                  <div className="size-actions">
                    <button type="button" onClick={selectAllSizes} className="size-action-btn">
                      {"Select All"}
                    </button>
                    <button type="button" onClick={clearAllSizes} className="size-action-btn">
                      {"Clear All"}
                    </button>
                  </div>
                </div>
                <div className="size-options">
                  {sizeOptions.map(size => (
                    <div
                      key={size.value}
                      className={`size-option ${settings.sizes.includes(size.value) ? 'selected' : ''}`}
                      onClick={() => toggleSize(size.value)}
                    >
                      <div className="size-checkbox">
                        {settings.sizes.includes(size.value) && '✓'}
                      </div>
                      <span className="size-label">{size.label}</span>
                      <span className="size-description">{size.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Options */}
              <div className="setting-group">
                <label>{"Advanced Options"}</label>
                <div className="advanced-options">
                  <div className="option-row">
                    <label>{"Background Color"}</label>
                    <input
                      type="color"
                      value={settings.backgroundColor === 'transparent' ? '#ffffff' : settings.backgroundColor}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        backgroundColor: e.target.value 
                      }))}
                    />
                    <button
                      type="button"
                      className={`transparent-btn ${settings.backgroundColor === 'transparent' ? 'active' : ''}`}
                      onClick={() => setSettings(prev => ({ 
                        ...prev, 
                        backgroundColor: 'transparent' 
                      }))}
                    >
                      {"Transparent"}
                    </button>
                  </div>

                  <div className="option-row">
                    <label>
                      {"Padding"}: {settings.padding}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={settings.padding}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        padding: parseInt(e.target.value) 
                      }))}
                      className="slider"
                    />
                  </div>

                  <div className="option-row">
                    <label>
                      {"Border Radius"}: {settings.borderRadius}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={settings.borderRadius}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        borderRadius: parseInt(e.target.value) 
                      }))}
                      className="slider"
                    />
                  </div>

                  <div className="option-row checkbox-row">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.preserveAspectRatio}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          preserveAspectRatio: e.target.checked 
                        }))}
                      />
                      {"Preserve Aspect Ratio"}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="generate-section">
              <button 
                onClick={generateFavicons}
                className={`generate-btn ${processing ? 'processing' : ''}`}
                disabled={processing || settings.sizes.length === 0}
              >
                {processing ? (
                  <>
                    <span className="spinner"></span>
                    {"Generating..."}
                  </>
                ) : (
                  `🎨 ${"Generate Favicons"} (${settings.sizes.length})`
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {generatedIcons.length > 0 && (
          <div className="results-section">
            <div className="results-header">
              <h3>{"Generated Icons"}</h3>
              <div className="results-actions">
                <button onClick={copyHTMLCode} className="action-btn secondary">
                  📋 {"Copy HTML"}
                </button>
                <button onClick={downloadAllIcons} className="action-btn primary">
                  📦 {"Download All"}
                </button>
              </div>
            </div>

            <div className="icons-grid">
              {generatedIcons.map((icon, index) => (
                <div key={index} className="icon-card">
                  <div className="icon-preview">
                    <img src={originalImage} alt={`Favicon ${icon.size}x${icon.size}`} />
                    <div className="icon-badge">{icon.size}×{icon.size}</div>
                  </div>
                  <div className="icon-info">
                    <span className="icon-format">{icon.format.toUpperCase()}</span>
                    <span className="icon-size">{icon.size}px</span>
                  </div>
                  <button 
                    onClick={() => downloadIcon(icon)}
                    className="download-icon-btn"
                  >
                    ⬇️ {"Download"}
                  </button>
                </div>
              ))}
            </div>

            {/* HTML Code Preview */}
            <div className="code-section">
              <h4>{"HTML Implementation Code"}</h4>
              <div className="code-preview">
                <pre>
{`<!-- Favicon HTML Code -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
${generatedIcons.filter(icon => icon.format === 'png').map(icon => 
`<link rel="icon" type="image/png" href="/favicon-${icon.size}x${icon.size}.png" sizes="${icon.size}x${icon.size}">`
).join('\n')}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="tips-section">
          <h3>💡 {"Best Practices & Tips"}</h3>
          <div className="tips-list">
            <div className="tip-item">
              <span className="tip-icon">🎯</span>
              <div>
                <strong>{"Use Simple Designs"}</strong>
                <p>{"Favicons are small - use simple, recognizable designs with good contrast"}</p>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">📐</span>
              <div>
                <strong>{"Square Format"}</strong>
                <p>{"Always start with a square image for best results across all devices"}</p>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">⚡</span>
              <div>
                <strong>{"Multiple Sizes"}</strong>
                <p>{"Include multiple sizes (16x16, 32x32) for different devices and contexts"}</p>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">🎨</span>
              <div>
                <strong>{"Test Your Favicon"}</strong>
                <p>{"Test your favicon in different browsers and dark/light modes"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="status-section">
          <div className="status-indicator">
            <div className={`status-dot ${processing ? 'processing' : 'ready'}`}></div>
            <span>
              {processing ? "Generating your favicons..." : "Ready to generate favicons"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaviconGenerator;