"use client";

import React, { useState, useRef, useCallback } from 'react';
import styles from './styles.module.css';

const FaviconGenerator = () => {

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

  // ✅ FIX HERE (only change)
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

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
  }, []);

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
      await new Promise(resolve => setTimeout(resolve, 2000));

      const icons = settings.sizes.map(size => ({
        size,
        format: settings.format === 'all' ? (size <= 64 ? 'ico' : 'png') : settings.format,
        url: originalImage,
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

  const downloadIcon = (icon) => {
    const link = document.createElement('a');
    link.download = icon.name;
    link.href = icon.url;
    link.click();
  };

  const downloadAllIcons = () => {
    alert("In a real implementation, this would download a ZIP file containing all icons");
    generatedIcons.forEach(icon => downloadIcon(icon));
  };

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
    <div className={styles["favicon-generator"]}>
      {/* rest unchanged */}
    </div>
  );
};

export default FaviconGenerator;